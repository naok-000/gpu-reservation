import { Stack, Duration, StackProps, CfnOutput, BundlingOptions } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, LayerVersion, Function, Code, Architecture } from 'aws-cdk-lib/aws-lambda';
import { HttpApi, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as path from 'path';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import * as dotenv from 'dotenv';

// 環境変数を読み込む
const envName = process.env.ENVIRONMENT || 'development';
dotenv.config({ path: path.join(__dirname, `../.env.${envName}`) });

export class BackendStack extends Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB (PK: userId, SK: ISO timestamp)
    const table = new Table(this, 'AppTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey:      { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // AWS Lambda Web Adapter レイヤー ARN（環境変数から取得）
    const adapter = LayerVersion.fromLayerVersionArn(
      this, 'Adapter',
      process.env.LAMBDA_ADAPTER_ARN || 'arn:aws:lambda:us-east-1:753240598075:layer:LambdaAdapterLayerArm64:24'
    );

    const backendPath = path.join(__dirname, '../../backend');

    const fn = new Function(this, 'FastApiFn', {
      architecture: Architecture.ARM_64,
      runtime: Runtime.PYTHON_3_12,
      memorySize: 512,
      timeout: Duration.seconds(20),
      code: Code.fromAsset(backendPath, {
        bundling: {
          image: Runtime.PYTHON_3_12.bundlingImage,
          platform: 'linux/arm64',
          command: [
            'bash', '-c',
            [
              // 1. 依存をインストール
              'pip install -r requirements.txt -t /asset-output',
              // 2. ソースをコピー
              'cp -au . /asset-output'
            ].join(' && ')
          ],
        } satisfies BundlingOptions,
      }),
      handler: 'main.handler',
      layers: [adapter],
      environment: {
        TABLE_NAME: table.tableName,
        MODEL_ID: process.env.MODEL_ID || 'amazon.nova-micro-v1:0',
        ENVIRONMENT: process.env.ENVIRONMENT || 'production',
      },
    });
    table.grantReadWriteData(fn);

    // CORS設定用のオリジンを環境変数から取得
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

    const api = new HttpApi(this, 'HttpApi', {
      defaultIntegration: new HttpLambdaIntegration('LambdaIntegration', fn),
      corsPreflight: { 
        allowOrigins: allowedOrigins,
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        allowCredentials: true,
        maxAge: Duration.days(1),
      },
    });

    // APIのURLをプロパティとして設定
    this.apiUrl = api.apiEndpoint;

    // APIのURLをスタックの出力として追加
    new CfnOutput(this, 'ApiEndpoint', {
      value: api.apiEndpoint,
      description: 'バックエンドAPIのエンドポイントURL',
      exportName: 'BackendApiEndpoint',
    });
  }
}
