// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  app: { baseURL: '/' }, 
  nitro: { preset: 'static'},
  
  // ランタイム設定
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_ENV_API_BASE_URL || 'http://localhost:8000',
    }
  }
})
