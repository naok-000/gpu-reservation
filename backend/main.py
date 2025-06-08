from fastapi import FastAPI
import boto3, os
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from dotenv import load_dotenv

# 環境変数を読み込む
load_dotenv(f".env.{os.getenv('ENVIRONMENT', 'development')}")

app = FastAPI(title="Sample API")

# CORS設定の追加
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # 環境変数から読み込む
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    max_age=86400,  # 1日（秒単位）
)

@app.get("/hello")
def hello(name: str = "world"):
    return {"msg": f"Hello, {name}!"}

# 通信テスト用エンドポイント
@app.get("/api/test")
def test_connection():
    return {
        "status": "success", 
        "message": "バックエンドとの通信が成功しました",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Bedrock 呼び出し例（環境変数からモデル ID を取得）
@app.post("/bedrock")
def bedrock(prompt: str):
    bedrock = boto3.client("bedrock-runtime")
    resp = bedrock.invoke_model(
        modelId=os.getenv("MODEL_ID", "amazon.nova-micro-v1:0"),
        body=prompt.encode(),
        contentType="text/plain",
    )
    return {"completion": resp["body"].read().decode()}

# Lambdaハンドラー
handler = Mangum(app)
