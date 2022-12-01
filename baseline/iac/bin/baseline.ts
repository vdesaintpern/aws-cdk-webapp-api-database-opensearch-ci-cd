#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BaselineStack } from '../lib/baseline-stack';
import { enumFromStringValue, EnvName } from '../../code/stack-resources';

let envName: EnvName | undefined;

const app = new cdk.App();

envName = enumFromStringValue(EnvName, app.node.tryGetContext('envName'));

if(envName == undefined) {
  throw new Error("please provide valide value for stack : preprod or prod");
} else {
  new BaselineStack(app, 'BaselineStack', {
    envName: envName
  });
}
