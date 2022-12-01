import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { dbSecretNamePrefix, EnvName, osSecretARNPrefix, osSecretNamePrefix, osSecretPrefix } from '../../code/stack-resources';
import { CfnOutput, StackProps } from 'aws-cdk-lib';

interface BaselineStackProp extends StackProps {
  readonly envName: EnvName;
}

export class BaselineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BaselineStackProp) {
    super(scope, id, props);

    const openSearchSecret = new Secret(this, osSecretPrefix + props.envName, {
      secretName: osSecretPrefix + props.envName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'opensearchadmin' }),
        generateStringKey: "password"
      },
    });

    // Export secret name
    const cfnOsSecretArn = new CfnOutput(this, osSecretARNPrefix + props.envName, {
      value: openSearchSecret.secretArn,
      exportName: osSecretARNPrefix + props.envName
    });

    const cfnOsSecretName = new CfnOutput(this, osSecretNamePrefix + props.envName, {
      value: openSearchSecret.secretName,
      exportName: osSecretNamePrefix + props.envName
    });
  }
}
