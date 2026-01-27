<template>
  <ElCard shadow="never" class="mb-4">
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium">量表列表：</span>
      <ElRadioGroup v-model="formData.status" @change="handleStatusChange">
        <ElRadioButton label="0,1">未完成</ElRadioButton>
        <ElRadioButton label="2">已完成</ElRadioButton>
      </ElRadioGroup>
      <ElButton :icon="RefreshRight" @click="handleRefresh">刷新</ElButton>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { RefreshRight } from '@element-plus/icons-vue'
  import { ElCard, ElRadioGroup, ElRadioButton, ElButton } from 'element-plus'

  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 状态改变时自动触发搜索
  function handleStatusChange() {
    emit('search', formData.value)
  }

  // 刷新按钮 - 重新加载当前筛选条件的数据
  function handleRefresh() {
    emit('search', formData.value)
  }
</script>
