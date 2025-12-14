<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

function getSafePolygon(cx, cy, rect, refRect, placement) {
  const side = placement.split('-')[0];
  const buffer = 2;
  const isFloatingWider = rect.width > refRect.width;
  const isFloatingTaller = rect.height > refRect.height;
  const fromRight = cx > rect.right - rect.width / 2;
  const fromBottom = cy > rect.bottom - rect.height / 2;

  if (side === 'top') {
    const c1 = [
      isFloatingWider ? cx + buffer / 2 : fromRight ? cx + buffer * 4 : cx - buffer * 4,
      cy + buffer + 1,
    ];
    const c2 = [
      isFloatingWider ? cx - buffer / 2 : fromRight ? cx + buffer * 4 : cx - buffer * 4,
      cy + buffer + 1,
    ];
    return [
      c1,
      c2,
      [
        rect.left,
        fromRight ? rect.bottom - buffer : isFloatingWider ? rect.bottom - buffer : rect.top,
      ],
      [
        rect.right,
        fromRight ? (isFloatingWider ? rect.bottom - buffer : rect.top) : rect.bottom - buffer,
      ],
    ];
  } else if (side === 'bottom') {
    const c1 = [
      isFloatingWider ? cx + buffer / 2 : fromRight ? cx + buffer * 4 : cx - buffer * 4,
      cy - buffer,
    ];
    const c2 = [
      isFloatingWider ? cx - buffer / 2 : fromRight ? cx + buffer * 4 : cx - buffer * 4,
      cy - buffer,
    ];
    return [
      c1,
      c2,
      [
        rect.left,
        fromRight ? rect.top + buffer : isFloatingWider ? rect.top + buffer : rect.bottom,
      ],
      [
        rect.right,
        fromRight ? (isFloatingWider ? rect.top + buffer : rect.bottom) : rect.top + buffer,
      ],
    ];
  } else if (side === 'left') {
    const c1 = [
      cx + buffer + 1,
      isFloatingTaller ? cy + buffer / 2 : fromBottom ? cy + buffer * 4 : cy - buffer * 4,
    ];
    const c2 = [
      cx + buffer + 1,
      isFloatingTaller ? cy - buffer / 2 : fromBottom ? cy + buffer * 4 : cy - buffer * 4,
    ];
    return [
      [
        fromBottom ? rect.right - buffer : isFloatingTaller ? rect.right - buffer : rect.left,
        rect.top,
      ],
      [
        fromBottom ? (isFloatingTaller ? rect.right - buffer : rect.left) : rect.right - buffer,
        rect.bottom,
      ],
      c1,
      c2,
    ];
  } else if (side === 'right') {
    const c1 = [
      cx - buffer,
      isFloatingTaller ? cy + buffer / 2 : fromBottom ? cy + buffer * 4 : cy - buffer * 4,
    ];
    const c2 = [
      cx - buffer,
      isFloatingTaller ? cy - buffer / 2 : fromBottom ? cy + buffer * 4 : cy - buffer * 4,
    ];
    return [
      [
        fromBottom ? rect.left + buffer : isFloatingTaller ? rect.left + buffer : rect.right,
        rect.top,
      ],
      [
        fromBottom ? (isFloatingTaller ? rect.left + buffer : rect.right) : rect.left + buffer,
        rect.bottom,
      ],
      c1,
      c2,
    ];
  }
  return [];
}

function inferSide(rect, refRect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const rcx = refRect.left + refRect.width / 2;
  const rcy = refRect.top + refRect.height / 2;
  const dx = cx - rcx;
  const dy = cy - rcy;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}

function toPoints(arr) {
  return arr.map(([x, y]) => `${x},${y}`).join(' ');
}

const container = ref(null);
const svgEl = ref(null);
let triggerEl = null;
let popoverEl = null;
let cleanupFns = [];

function onMove(e) {
  if (!svgEl.value || !popoverEl || !triggerEl) return;

  const floating = popoverEl.shadowRoot?.querySelector('[popover]');
  if (!floating || !floating.matches(':popover-open')) {
    svgEl.value.innerHTML = '';
    return;
  }

  const rect = floating.getBoundingClientRect();
  const refRect = triggerEl.getBoundingClientRect();
  const side = inferSide(rect, refRect);

  const polygon = getSafePolygon(e.clientX, e.clientY, rect, refRect, side);

  svgEl.value.innerHTML = `<polygon points="${toPoints(polygon)}" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.6)" stroke-width="1"/>`;
}

onMounted(() => {
  triggerEl = container.value?.querySelector('#safe-triangle-trigger');
  popoverEl = container.value?.querySelector('l-popover');

  document.addEventListener('pointermove', onMove);
  cleanupFns.push(() => document.removeEventListener('pointermove', onMove));
});

onUnmounted(() => {
  cleanupFns.forEach((fn) => fn());
});
</script>

<template>
  <div
    ref="container"
    class="vp-raw component-wrapper bg-surface-sunken"
    style="min-height: 180px; justify-content: center"
  >
    <div class="flex items-center gap-2">
      <button
        id="safe-triangle-trigger"
        class="l-button"
      >
        Hover me
      </button>
      <l-popover
        for="safe-triangle-trigger"
        trigger="hover"
        placement="right"
      >
        <div class="flex flex-col gap-2 p-1">
          <p class="font-medium">Safe area demo</p>
          <p class="text-sm text-gray-500">
            The <span style="color: rgb(239 68 68)">red polygon</span> keeps the popover open while
            your cursor travels between trigger and content.
          </p>
        </div>
      </l-popover>
    </div>
    <svg
      ref="svgEl"
      style="
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 99999;
      "
    />
  </div>
</template>
