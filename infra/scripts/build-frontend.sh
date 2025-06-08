#!/bin/bash
# フロントエンドビルドスクリプト

# プロファイル引数の処理
PROFILE=""
if [ "$1" != "" ]; then
  PROFILE="--profile $1"
  echo "AWSプロファイル '$1' を使用します"
fi

# スクリプトの場所から相対パスでディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INFRA_DIR="$( dirname "$SCRIPT_DIR" )"
PROJECT_DIR="$( dirname "$INFRA_DIR" )"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# APIエンドポイントを取得（CloudFormationから）
API_ENDPOINT=$(aws cloudformation describe-stacks --stack-name BackendStack --query "Stacks[0].Outputs[?ExportName=='BackendApiEndpoint'].OutputValue" --output text $PROFILE)

if [ -z "$API_ENDPOINT" ]; then
  echo "警告: APIエンドポイントが見つかりません。デフォルトのURLを使用します。"
  API_ENDPOINT="http://localhost:8000"
fi

echo "使用するAPIエンドポイント: $API_ENDPOINT"

# フロントエンドのビルド（環境変数を設定）
cd "$FRONTEND_DIR"
NUXT_ENV_API_BASE_URL="$API_ENDPOINT" npm run build

echo "フロントエンドのビルドが完了しました" 