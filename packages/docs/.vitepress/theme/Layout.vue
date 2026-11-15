<script setup>
import DefaultTheme from 'vitepress/theme';
import Logo from '../components/Logo.vue';
import SoundToggle from '../components/SoundToggle.vue';
import ThemePicker from '../components/ThemePicker.vue';
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-title-before>
      <Logo />
    </template>
    <template #nav-bar-content-after>
      <ThemePicker />
      <SoundToggle />
    </template>
  </DefaultTheme.Layout>
</template>
