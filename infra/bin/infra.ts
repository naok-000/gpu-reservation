#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';

// ❶ ここを差し替え
import { FrontendStack } from '../lib/frontend-stack';
import { BackendStack }  from '../lib/backend-stack';

const app = new App();

// ❷ バックエンドスタックを先に作成
const backendStack = new BackendStack(app, 'BackendStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

// ❸ フロントエンドスタックにバックエンドのAPIエンドポイントを渡す
new FrontendStack(app, 'FrontendStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  apiEndpoint: backendStack.apiUrl,
});
