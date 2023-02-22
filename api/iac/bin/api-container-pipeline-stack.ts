import { Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { databaseNamePrefix, EnvName } from '../../../baseline/code/stack-resources';
import { ApiContainerPipelineAppStage } from './api-container-stage';

interface ApiContainerPipelineStackProps extends StackProps {
    readonly codeCommitRepository: string;
}

export class ApiContainerPipelineStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiContainerPipelineStackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'ApiContainerPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.codeCommit(Repository.fromRepositoryName(this, 'coderepository', 
                props.codeCommitRepository), 'main'),
                commands: [
                    // synth the pipeline here to enable auto update of pipeline
                    // please note application code is NOT built here ! it's build in the docker file !
                    'cd api-container/iac',
                    'export AWS_ACCOUNT_ID=' + props.env?.account,
                    'export AWS_REGION=' + props.env?.region,
                    'export CODECOMMIT_REPOSITORY_NAME=' + props.codeCommitRepository,
                    'npm ci',
                    'npm run build',
                    'npx cdk synth',
                    'cp -R cdk.out ../../']
            }),
            synthCodeBuildDefaults: {
                rolePolicy: [
                  new PolicyStatement({
                    actions: [ 'sts:AssumeRole' ],
                    resources: [ ApiContainerPipelineStack.cdkToolkitLookupRoleArn(this) ],
                  }),
                ],
              },
        });

        const testStage = pipeline.addStage(new ApiContainerPipelineAppStage(this, "api-container-test", { env: props.env, envName: EnvName.PreProd, databaseName: databaseNamePrefix + EnvName.PreProd }));

        /* This should be uncommented when other prod stacks is created, then push code and pipeline will redeploy
            const prodStage = pipeline.addStage(new ApiContainerPipelineAppStage(this, "api-container-prod", { env: props.env, envName: 'prod', databaseName: databaseNamePrefix + EnvName.Prod}), {
            pre: [
                new ManualApprovalStep('PromoteToProd'),
            ]
        });*/

    }

    static cdkToolkitLookupRoleArn(stack: Stack): string {
        const synthesizer: any = stack.synthesizer
        if ('lookupRoleArn' in synthesizer) {
            console.log(synthesizer.lookupRoleArn);
            return synthesizer.lookupRoleArn.replace('${AWS::Partition}', 'aws');
        } else {
          throw new Error(`No lookupRoleArn on ${synthesizer}`)
        }
    }
}
