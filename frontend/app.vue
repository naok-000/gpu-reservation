<template>
  <div>
    <h1>GPU予約システム</h1>
    <ApiTest />
  </div>
</template>

<script setup>
import ApiTest from './components/ApiTest.vue';
</script>

<style>
body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}
</style>
