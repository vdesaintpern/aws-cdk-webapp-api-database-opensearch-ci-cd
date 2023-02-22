#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiContainerPipelineStack } from './api-container-pipeline-stack';

if(!process.env.AWS_ACCOUNT_ID
    || !process.env.AWS_REGION
    || !process.env.CODECOMMIT_REPOSITORY_NAME) {
      throw new Error("please provide all env variables : AWS_ACCOUNT_ID, AWS_REGION, CODECOMMIT_REPOSITORY_NAME");
}

// deploying everything in the same account : prod and pre-prod
const deploymentAccount  = { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION };
const codecommitRepository = process.env.CODECOMMIT_REPOSITORY_NAME;

const app = new cdk.App();

new ApiContainerPipelineStack(app, "ApiContainerPipeline", { 
  env: deploymentAccount, 
  codeCommitRepository: codecommitRepository
});
