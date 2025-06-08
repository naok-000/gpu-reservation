import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Distribution, ViewerProtocolPolicy, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

// フロントエンドスタックのプロパティ拡張
interface FrontendStackProps extends StackProps {
  apiEndpoint?: string;
}

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

    const siteBucket = new Bucket(this, 'SiteBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFrontがS3にアクセスするための権限設定
    const oai = new OriginAccessIdentity(this, 'OAI');
    siteBucket.grantRead(oai);

    const dist = new Distribution(this, 'CFDist', {
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket, {
          originAccessIdentity: oai
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // APIエンドポイントを出力
    if (props?.apiEndpoint) {
      new CfnOutput(this, 'BackendApiUrl', {
        value: props.apiEndpoint,
        description: 'フロントエンドが接続するバックエンドAPIのURL',
      });
    }

    // `cdk deploy` で自動アップロード
    new BucketDeployment(this, 'DeployWithCdk', {
      sources: [Source.asset('../frontend/.output/public')],
      destinationBucket: siteBucket,
      distribution: dist,
    });

    // CloudFrontのURLを出力
    new CfnOutput(this, 'DistributionUrl', {
      value: `https://${dist.distributionDomainName}`,
      description: 'フロントエンドのURL',
    });
  }
}
