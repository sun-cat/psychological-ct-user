<template>
  <div class="short-answer-box" :class="{ 'large-font': fontSizeMode === 'large' }">
    <!-- 简答题 -->
    <div class="header">
      <AudioPlayer :audioUrl="question.audio" />
      <div class="title" v-html="question.title"></div>
    </div>

    <ElDivider style="margin: 10px 0; border-color: #5d87ff" />
   <div calss="desc" v-html="question.desc"></div>
    <div class="answer-input">
      <ElInput
        v-model="answerText"
        type="textarea"
        :rows="6"
        :maxlength="500"
        show-word-limit
        placeholder="请输入您的答案..."
        resize="none"
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

  const answerText = computed({
    get: () => props.modelValue || '',
    set: (value: string) => emit('update:modelValue', value)
  })
  const question = computed(() => props.question)
</script>

<style lang="scss" scoped>
  .short-answer-box {
    .header {
      display: flex;
      align-items: center;

      .title {
        margin-left: 6px;
        font-size: 24px;
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

    .answer-input {
      margin-top: 20px;

      :deep(.el-textarea__inner) {
        padding: 15px;
        font-size: 18px;
        line-height: 1.6;
        background-color: #f7f7f7;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:focus {
          background-color: #fff;
          border-color: #5d87ff;
          box-shadow: 0 0 0 2px rgba(93, 135, 255, 0.1);
        }

        &::placeholder {
          color: #a8abb2;
        }
      }

      :deep(.el-input__count) {
        background-color: transparent;
        font-size: 12px;
        color: #909399;
      }
    }

    // 大字体模式
    &.large-font {
      .header .title {
        font-size: 36px; // 从 18px 增大到 24px
      }

      .answer-input {
        :deep(.el-textarea__inner) {
          font-size: 24px; // 从 14px 增大到 18px
        }
      }
    }
  }
</style>
