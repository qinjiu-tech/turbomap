<script setup lang="ts">
// 功能块右上角的全屏按钮。文案由调用方根据当前状态传入。

defineProps<{ active: boolean }>()
defineEmits<{ toggle: [] }>()
</script>

<template>
  <t-button class="fullscreen-button" theme="default" variant="outline" @click="$emit('toggle')">
    {{ active ? '退出全屏' : '全屏' }}
  </t-button>
</template>

<style scoped lang="scss">
.fullscreen-button {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
}
</style>
