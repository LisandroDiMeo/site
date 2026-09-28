<template>
  <div class="shell-page">
    <div
      class="shell-window"
      :class="{ 'has-overlay': hasOverlay }"
    >
      <div class="shell-titlebar">
        <div class="shell-titlebar-label">
          <span
            class="shell-titlebar-icon"
            aria-hidden="true"
          >&gt;_</span>
          <span>{{ titleBarText }}</span>
        </div>
        <div
          class="shell-titlebar-buttons"
          aria-hidden="true"
        >
          <span class="shell-titlebar-btn">_</span>
          <span class="shell-titlebar-btn">&#9633;</span>
          <span class="shell-titlebar-btn">&times;</span>
        </div>
      </div>
      <div class="shell-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titleBarText: {
    type: String,
    default: 'Command Prompt — lisandro'
  },
  hasOverlay: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.shell-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: var(--shell-page-padding-y) var(--shell-page-padding-x);
  background: var(--f0-page);
  display: flex;
  flex-direction: column;
}

.shell-window {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  border: 2px solid #c0c0c0;
  box-shadow: 0 0 0 1px #404040, 0 20px 50px rgba(0, 0, 0, 0.25);
  background: var(--f0-window);
}

.shell-window.has-overlay {
  position: relative;
}

.shell-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 4px 0 10px;
  background: linear-gradient(90deg, var(--f0-title-a), var(--f0-title-b));
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.shell-titlebar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow: hidden;
}

.shell-titlebar-label span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shell-titlebar-icon {
  width: 16px;
  height: 14px;
  background: #000;
  border: 1px solid #c0c0c0;
  box-sizing: border-box;
  font-size: 9px;
  line-height: 12px;
  color: #c0c0c0;
  text-align: center;
  flex-shrink: 0;
}

.shell-titlebar-buttons {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.shell-titlebar-btn {
  width: 20px;
  height: 18px;
  background: #c0c0c0;
  box-shadow: inset -1px -1px #404040, inset 1px 1px #fff;
  color: #000;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
}

.shell-content {
  flex-grow: 1;
  padding: var(--shell-content-padding-y) var(--shell-content-padding-x);
  color: var(--f0-text);
  font-size: var(--fs-body);
  line-height: var(--lh-body);
  display: flex;
  flex-direction: column;
  gap: 28px;
}
</style>
