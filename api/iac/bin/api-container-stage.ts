import * as cdk from 'aws-cdk-lib';
import { StageProps } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { ApiContainerStack } from '../lib/api-container-stack';

interface ApiContainerStageProps extends StageProps {
    readonly envName: string;
    readonly databaseName: string;
}

export class ApiContainerPipelineAppStage extends cdk.Stage {
    
    constructor(scope: Construct, id: string, props: ApiContainerStageProps) {
        super(scope, id, props);

        const apiContainerStack = new ApiContainerStack(this, 'ApiContainerStack-' + props.envName, { 
            envName : props.envName, 
            env: props.env,
            databaseName: props.databaseName
        });
    }
}