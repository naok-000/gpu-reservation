<template>
  <div class="api-test">
    <h2>バックエンド通信テスト</h2>
    <div class="controls">
      <input v-model="apiUrl" type="text" placeholder="バックエンドAPIのURL" class="input" />
      <button @click="testConnection" class="button">接続テスト</button>
    </div>
    
    <div v-if="loading" class="loading">テスト実行中...</div>
    
    <div v-if="result" class="result" :class="{ success: result.status === 'success', error: result.error }">
      <h3>{{ result.error ? 'エラー' : '結果' }}</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

// 設定を取得
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;

// 環境に応じたデフォルトのAPI URLを設定
const defaultApiUrl = `${apiBaseUrl}/api/test`;
console.log(`APIベースURL: ${apiBaseUrl}`);

const apiUrl = ref(defaultApiUrl);
const result = ref(null);
const loading = ref(false);

// バックエンドとの通信テスト
const testConnection = async () => {
  loading.value = true;
  result.value = null;
  
  try {
    const response = await fetch(apiUrl.value, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`エラー: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    result.value = {
      status: 'success',
      ...data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    result.value = {
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.api-test {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  color: #333;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button {
  padding: 0.5rem 1rem;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #3a5ce5;
}

.loading {
  margin: 1rem 0;
  color: #666;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #fff;
  border-left: 5px solid #ccc;
}

.success {
  border-left-color: #4caf50;
}

.error {
  border-left-color: #f44336;
}

pre {
  background-color: #f0f0f0;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style> 