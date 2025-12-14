<template>
  <span class="luxen-logo">
    <img
      src="/logos/luxen.svg"
      alt=""
      class="logo-icon"
      width="28"
      height="28"
    />
    <span class="logo-text">luxen-ui</span>
  </span>
</template>

<style scoped>
.luxen-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 5px;
}

.logo-text {
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}
</style>
