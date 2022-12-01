import * as cdk from 'aws-cdk-lib';
import { CfnOutput, SecretValue, StackProps } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Domain, EngineVersion } from 'aws-cdk-lib/aws-opensearchservice';
import { Credentials, DatabaseInstance, DatabaseInstanceEngine, MysqlEngineVersion } from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { dbSecretNamePrefix, dbSecretPrefix, EnvName, osSecretPrefix, osURLPrefix, vpcNamePrefix, vpcPrefix } from '../../../baseline/code/stack-resources';

interface InfraStackStackProps extends StackProps {
  readonly envName: EnvName;  
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, vpcPrefix + props.envName, {
      // Same CIDR for all envs, choose different CIDR range if you plan to VPC peer them
      cidr: "10.0.0.0/20",
      vpcName: vpcPrefix + props.envName
    });

    // allow all VPC - this is an example, you should allow only application servers
    const dbSecurityGroup = new SecurityGroup(this, 'dbSecurityGroup' + props.envName, {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'security group for DB in ' + this.stackName
    })

    dbSecurityGroup.addIngressRule(
      Peer.ipv4('10.0.0.0/16'),
      Port.tcp(3306),
      'allow Mysql to all VPC IPs', // remember, this is an example, don't allow everything for production
    );

    // Small DB with MYSQL for tests
    const dbSecretCredentials = Credentials.fromGeneratedSecret('mysqladmin', { secretName: dbSecretPrefix + props.envName });

    const instance = new DatabaseInstance(this, 'db' + props.envName, {
      engine: DatabaseInstanceEngine.mysql({ version: MysqlEngineVersion.VER_8_0_28 }),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.SMALL),
      credentials: dbSecretCredentials,
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [ dbSecurityGroup ]
    });

    // small opens earch cluster for test
    const osSecretName = osSecretPrefix + props.envName;
    
    const osSecurityGroup = new SecurityGroup(this, 'osSecurityGroup' + props.envName, {
      vpc: vpc,
      allowAllOutbound: true,
      description: 'security group for OS in ' + this.stackName
    })

    osSecurityGroup.addIngressRule(
      Peer.ipv4('10.0.0.0/16'),
      Port.tcp(443),
      'allow OS to all VPC IPs', // remember, this is an example, don't allow everything for production
    );

    const osDomain = new Domain(this, 'Domain', {
      version: EngineVersion.OPENSEARCH_1_3,
      fineGrainedAccessControl: {
        masterUserName: SecretValue.secretsManager(osSecretName, { jsonField: "username" }).unsafeUnwrap(),
        masterUserPassword: SecretValue.secretsManager(osSecretName, { jsonField: "password" })
      },
      capacity: {
        dataNodeInstanceType: "t3.small.search"
      },
      vpcSubnets: [{
        subnets: [vpc.privateSubnets[0]],
      }],
      vpc: vpc,
      nodeToNodeEncryption: true,
      enforceHttps: true,
      useUnsignedBasicAuth: true,
      encryptionAtRest: { enabled: true },
      logging: {
        slowSearchLogEnabled: true,
        appLogEnabled: true,
        slowIndexLogEnabled: true,
      },
      securityGroups: [ osSecurityGroup ]
    });

    // Export VPC ID
    const cfnVpcId = new CfnOutput(this, vpcNamePrefix + props.envName, {
      value: vpc.vpcId,
      exportName: vpcNamePrefix + props.envName
    });

    // Export secret name
    const cfnDbSecret = new CfnOutput(this, dbSecretNamePrefix + props.envName, {
      value: instance.secret!.secretName,
      exportName: dbSecretNamePrefix + props.envName
    });

    // export opensearch url to be called by services
    const cfnOsURL = new CfnOutput(this, osURLPrefix + props.envName, {
      value: osDomain.domainEndpoint,
      exportName: osURLPrefix + props.envName
    });
  }
}
