import { PhysicalName, pipelines, Stack, StackProps, Stage } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-codecommit';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { WebappPipelineAppStage } from './webapp-stage';
import { EnvName } from '../../../baseline/code/stack-resources';
import { Effect, IRole, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BuildSpec, PipelineProject } from 'aws-cdk-lib/aws-codebuild';
import { CodeBuildAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';

interface WebappPipelineStackProps extends StackProps {
    readonly codeCommitRepository: string;
}

export class WebappPipelineStack extends Stack {

    constructor(scope: Construct, id: string, props: WebappPipelineStackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'WebappPipeline', {  
            pipelineName: "webappPipeline",        
            synth: new CodeBuildStep('Synth', {
                input: CodePipelineSource.codeCommit(Repository.fromRepositoryName(this, 'webapp-coderepository', 
                props.codeCommitRepository), 'main'),
                commands: [
                    'export AWS_ACCOUNT_ID=' + props.env?.account,
                    'export AWS_REGION=' + props.env?.region,
                    'export CODECOMMIT_REPOSITORY_NAME=' + props.codeCommitRepository,
                    
                    // Build webapp for pre-prod
                    'cd webapp/code',
                    "API_URL_FOUND=`aws cloudformation list-exports --query \"Exports[?Name=='apiurl" + EnvName.PreProd + "'].Value\" --no-paginate --output text`",
                    "pwd",
                    "cat ./src/Api.js",
                    "rm -Rf ./src/Api.js",
                    "echo \"export const apiURL = 'http://$API_URL_FOUND';\" > ./src/Api.js",
                    "echo $API_URL_FOUND",
                    "cat ./src/Api.js",
                    'npm install',
                    'npm run build',
                    'mv build build-preprod',
                    
                    // Build webapp for prod - will be uncommented during workshop
                    /* 'cd webapp/code',
                    "API_URL_FOUND=`aws cloudformation list-exports --query \"Exports[?Name=='apiurl" + EnvName.Prod + "'].Value\" --no-paginate --output text`",
                    "echo \"export const apiURL = 'http://$API_URL_FOUND';\" > ./src/Api.js",
                    'npm install',
                    'npm run build',
                    'mv build build-prod',*/

                    // build IAC
                    'cd ../iac', 
                    'npm ci', 
                    'npm run build', 
                    'npx cdk synth', 
                    'cp -R cdk.out ../../'
                ],
                rolePolicyStatements: [
                    new PolicyStatement({
                        actions: ['cloudformation:*'],
                        resources: ['*']
                    })
                ]
            })    
        });

        const devStage = pipeline.addStage(new WebappPipelineAppStage(this, "webapp-" + EnvName.PreProd, { env: props.env, envName: EnvName.PreProd }));

        /* prod stage to be uncommented later in the workshop
            const prodStage = pipeline.addStage(new WebappPipelineAppStage(this, "webapp-" + EnvName.Prod, { env: props.env, envName: EnvName.Prod })), {
            pre: [
                new ManualApprovalStep('PromoteToProd'),
            ],
        });
        */

    }

}
