#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';
import { enumFromStringValue, EnvName } from '../../../baseline/code/stack-resources';

let envName: EnvName | undefined;

const app = new cdk.App();

envName = enumFromStringValue(EnvName, app.node.tryGetContext('envName'));

if(envName == undefined) {
  throw new Error("please provide valide value for stack : preprod or prod");
} else {
  new InfraStack(app, 'InfraStack', {
    envName: envName
  });
}