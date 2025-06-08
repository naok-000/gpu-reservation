# GPU-RESERVATION


## ローカル開発

### 1. 環境変数ファイルの準備

各ディレクトリに必要な環境変数ファイルを作成します：

```sh
# バックエンド用の環境変数ファイル
cp examples/backend.env.development backend/.env.development

# フロントエンド用の環境変数ファイル
cp examples/frontend.env.development frontend/.env.development

# インフラ用の環境変数ファイル（必要な場合）
cp examples/infra.env.development infra/.env.development
```

### 2. バックエンドの起動

```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. フロントエンドの起動

```sh
cd frontend
# 開発環境用の環境変数を使用して起動
npm run dev
```

## デプロイ手順

### 1. 環境変数ファイルの準備

デプロイ用の環境変数ファイルを準備します：

```sh
# インフラ用の環境変数ファイル
cp examples/infra.env.production infra/.env.production
# YOUR_DOMAINなどのプレースホルダーを実際の値に置き換えてください

# バックエンド用の環境変数ファイル
cp examples/backend.env.production backend/.env.production
# YOUR_DOMAINなどのプレースホルダーを実際の値に置き換えてください
```

### 2. バックエンドのデプロイ

```sh
# インフラディレクトリに移動
cd infra

# 環境変数を本番用に設定
export ENVIRONMENT=production

# バックエンドスタックをデプロイ
cdk deploy BackendStack --profile <profile-name>

```

### 3. フロントエンドのビルドとデプロイ

```sh
# APIエンドポイントを取得
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name BackendStack --query "Stacks[0].Outputs[?ExportName=='BackendApiEndpoint'].OutputValue" --output text --profile <profile-name>)

# フロントエンドディレクトリに移動
cd ../frontend

# 本番用の環境変数を使用してビルド
NUXT_ENV_API_BASE_URL=$API_ENDPOINT npm run build

# インフラディレクトリに戻る
cd ../infra

# フロントエンドスタックをデプロイ
cdk deploy FrontendStack --profile <profile-name>
```

### APIエンドポイントの確認方法

バックエンドAPIのエンドポイントは以下のコマンドで確認できます：

```sh
aws cloudformation describe-stacks --stack-name BackendStack --query "Stacks[0].Outputs[?ExportName=='BackendApiEndpoint'].OutputValue" --output text --profile <profile-name>
```

### CloudFrontドメインの確認方法

フロントエンドのCloudFrontドメインは以下のコマンドで確認できます：

```sh
aws cloudformation describe-stacks --stack-name FrontendStack --query "Stacks[0].Outputs[?OutputKey=='DistributionUrl'].OutputValue" --output text --profile <profile-name>
```

## 注意事項

### 使用するAIモデルについて

このプロジェクトではAmazon Bedrock上の以下のAIモデルを使用しています：

- **Amazon Nova Micro (amazon.nova-micro-v1:0)**: テキスト処理に特化した高速で低コストなモデルです。
- **Amazon Nova Lite (amazon.nova-lite-v1:0)**: 画像処理などにも対応したマルチモーダルモデルで、必要に応じて切り替えることができます。

モデルを変更する場合は、各環境変数ファイルの`MODEL_ID`を適宜変更してください。

### Lambda Adapter ARNについて

`LAMBDA_ADAPTER_ARN`はAWS Lambda Web Adapterのレイヤー参照用ARNです。最新のバージョンについては[AWS Lambda Web Adapter GitHub](https://github.com/awslabs/aws-lambda-web-adapter)を参照してください。