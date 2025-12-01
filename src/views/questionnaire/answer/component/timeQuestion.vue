<template>
  <div class="time-question-box" :class="{ 'large-font': fontSizeMode === 'large' }">
    <!-- 时间题 -->
    <div class="header">
      <AudioPlayer :audioUrl="question.audio" />
      <div class="title" v-html="question.title"></div>
    </div>

    <ElDivider style="margin: 10px 0; border-color: #5d87ff" />
   <div calss="desc" v-html="question.desc"></div>
    <div class="time-picker">
      <ElTimePicker
        v-model="timeValue"
        placeholder="请选择时间"
        format="HH:mm"
        value-format="HH:mm"
        :clearable="true"
        style="width: 100%"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import AudioPlayer from './AudioPlayer.vue'

  interface Props {
    question: any
    modelValue: any
  }
  interface Emits {
    (e: 'update:modelValue', value: string): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 从父组件注入字体大小状态
  const fontSizeMode = inject<Ref<'normal' | 'large'>>('fontSizeMode', ref('normal'))

  const timeValue = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
  })
  const question = computed(() => props.question)
</script>

<style lang="scss" scoped>
  .time-question-box {
    .header {
      display: flex;
      align-items: center;

      .title {
        margin-left: 6px;
        font-size: 18px;
        transition: font-size 0.3s ease;

        // 富文本内容样式重置
        :deep(p) {
          padding: 0;
          margin: 0;
        }

        :deep(img) {
          max-width: 60%;
          height: auto;
        }
      }
    }

    .time-picker {
      margin-top: 20px;

      :deep(.el-input__wrapper) {
        padding: 12px 15px;
        font-size: 14px;
        background-color: #f7f7f7;
        border-radius: 8px;
        box-shadow: 0 0 0 1px #dcdfe6 inset;
        transition: all 0.3s ease;

        &:hover {
          background-color: #fff;
        }

        &.is-focus {
          background-color: #fff;
          box-shadow: 0 0 0 1px #5d87ff inset, 0 0 0 2px rgba(93, 135, 255, 0.1);
        }
      }

      :deep(.el-input__inner) {
        font-size: 14px;

        &::placeholder {
          color: #a8abb2;
        }
      }
    }

    // 大字体模式
    &.large-font {
      .header .title {
        font-size: 24px; // 从 18px 增大到 24px
      }

      .time-picker {
        :deep(.el-input__wrapper) {
          padding: 15px 18px;
        }

        :deep(.el-input__inner) {
          font-size: 18px; // 从 14px 增大到 18px
        }
      }
    }
  }
</style>
