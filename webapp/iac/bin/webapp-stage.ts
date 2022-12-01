import * as cdk from 'aws-cdk-lib';
import { StackProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { WebappStack } from '../lib/webapp-stack';

interface WebappStageStackProps extends StackProps {
    readonly envName: string;
}

export class WebappPipelineAppStage extends cdk.Stage {
    
    constructor(scope: Construct, id: string, props: WebappStageStackProps) {
        super(scope, id, props);

        const webappStack = new WebappStack(this, "webappstage" + props.envName, props);
    }
}