<script setup>
import DefaultTheme from 'vitepress/theme';
import Logo from '../components/Logo.vue';
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <Logo />
    </template>
  </DefaultTheme.Layout>
</template>
