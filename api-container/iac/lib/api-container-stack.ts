import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnOutput, Fn, StackProps } from 'aws-cdk-lib';
import { Cluster, ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { apiURLPrefix, dbSecretNamePrefix, dbSecretPrefix, EnvName, osSecretPrefix, osURLPrefix, vpcNamePrefix, vpcPrefix, webappURLPrefix } from '../../../baseline/code/stack-resources';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

interface ApiContainerStackProps extends StackProps {
  readonly envName: string;
  readonly databaseName: string;
}

export class ApiContainerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiContainerStackProps) {
    super(scope, id, props);

    if(!props.env || !props.env.region) {
      throw new Error("Please provide region");
    }

    // retrieving vpc from infra stack
    const vpc = Vpc.fromLookup(this, vpcPrefix + props.envName, { vpcName : vpcPrefix + props.envName });

    const cluster = new Cluster(this, "Cluster-" + props.envName, {
      vpc,
    });

    // this will trigger docker build
    const image = new DockerImageAsset(this, "API-image", {
      directory: "../code",
    });

    // retrieving secrets name from baseline stack
    const api = new ApplicationLoadBalancedFargateService(
      this,
      "API-" + props.envName,
      {
        cluster: cluster,
        cpu: 256,
        desiredCount: 2,
        listenerPort: 80,
        taskImageOptions: {
          image: ContainerImage.fromDockerImageAsset(image),
          containerPort: 80,    
          environment: {
            ENV_NAME: props.envName,
            DB_SECRET_NAME: dbSecretPrefix + props.envName,
            DATABASE_NAME: props.databaseName,
            OS_SECRET_NAME: osSecretPrefix + props.envName,
            AWS_REGION: props.env.region,
            OS_HOSTNAME: Fn.importValue(osURLPrefix + props.envName),
            OS_PORT: '443'   
          },
        },
        memoryLimitMiB: 512,
        publicLoadBalancer: true,
      }
    );

    // quicker to deploy as we know we don't have long running queries
    api.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '10');

    api.taskDefinition.addToTaskRolePolicy(new PolicyStatement({
      resources: [
        Secret.fromSecretNameV2(this, "dbsecret", dbSecretPrefix + props.envName).secretArn + "*",
        Secret.fromSecretNameV2(this, "ossecret", osSecretPrefix + props.envName).secretArn + "*"
      ],
      actions: ["secretsmanager:GetResourcePolicy",
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecretVersionIds"],
    }));

    api.targetGroup.configureHealthCheck({
      path: '/healthcheck',
    });

    // these are baseline values - adjust to your needs
    const scalableTarget = api.service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 5,
    });
    
    scalableTarget.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 60,
    });
    
    scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 60,
    });

    const cfnAPIURL = new CfnOutput(this, apiURLPrefix + props.envName, {
      value: api.loadBalancer.loadBalancerDnsName,
      exportName: apiURLPrefix + props.envName
    });
  }
}
