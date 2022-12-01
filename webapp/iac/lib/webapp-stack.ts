import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { CloudFrontWebDistribution, Distribution, OriginProtocolPolicy, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { webappURLPrefix } from '../../../baseline/code/stack-resources';
import * as path from "path";  

interface WebappStackProps extends StackProps {
  readonly envName: string;
}

export class WebappStack extends Stack {
  constructor(scope: Construct, id: string, props: WebappStackProps) {
    super(scope, id, props);

    // S3 bucket for the code
    const webappBucket = new Bucket(this, "webapp-bucket-" + props.envName, {
      bucketName: 'webapp-' + props.envName + "-" + props.env?.account,
      publicReadAccess: false
    })

    // Cloudfront distribution with link to S3 
    const myWebAppDistribution = new Distribution(this, 'webapp-cdn-' + props.envName, {
      defaultBehavior: { 
        origin: new S3Origin(webappBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL
      },
      defaultRootObject: 'index.html',
    });

    const s3Deployment = new BucketDeployment(this, 'DeployWebapp' + props.envName, {
      sources: [Source.asset(path.join(__dirname + '../../../code/build-' + props.envName))],
      destinationBucket: webappBucket,
      distribution: myWebAppDistribution,
      distributionPaths: ['/*'],
      memoryLimit: 256
    });

    // export de l'url de cloudfront
    const cfnCloudFrontURL = new CfnOutput(this, webappURLPrefix + props.envName, {
      value: myWebAppDistribution.distributionDomainName,
      exportName: webappURLPrefix + props.envName
    });

  }
}
