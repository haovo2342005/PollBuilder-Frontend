<script setup></script>

<template>
  <section class="wrap">
    <h1>Không tìm thấy trang</h1>
    <p>Link này không đúng, hoặc trang đã bị di chuyển.</p>
    <router-link class="btn" to="/">Về trang tạo poll</router-link>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 480px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
