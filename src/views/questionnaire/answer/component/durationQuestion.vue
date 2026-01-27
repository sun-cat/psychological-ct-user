<template>
  <div class="duration-question-box" :class="{ 'large-font': fontSizeMode === 'large' }">
    <!-- 时长题 -->
    <div class="header">
      <AudioPlayer :audioUrl="question.audio" />
      <div class="title" v-html="question.title"></div>
    </div>

    <ElDivider style="margin: 10px 0; border-color: #5d87ff" />
   <div calss="desc" v-html="question.desc"></div>
    <div class="duration-input">
      <div class="duration-group">
        <span class="unit">输入数值：</span>
        <ElInputNumber
          v-model="hours"
          :min="0"
          :max="999"
          controls-position="right"
          @change="handleDurationChange"
        />
      </div>
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
    (e: 'update:modelValue', value: number): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 从父组件注入字体大小状态
  const fontSizeMode = inject<Ref<'normal' | 'large'>>('fontSizeMode', ref('normal'))

  const question = computed(() => props.question)

  // 时长的小时、分钟、秒
  const hours = ref(0)

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== null && newVal !== undefined) {
        hours.value = newVal
      } else {
        // modelValue 为空时，尝试使用 defaultValue
        const defaultValue = props.question?.defaultValue
        if (defaultValue !== null && defaultValue !== undefined) {
          const numValue = Number(defaultValue)
          if (!isNaN(numValue)) {
            hours.value = numValue
            // 同步给父组件
            nextTick(() => {
              emit('update:modelValue', numValue)
            })
          }
        } else {
          hours.value = 0
        }
      }
    },
    { immediate: true }
  )

  // 监听 question.defaultValue 变化
  watch(
    () => props.question?.defaultValue,
    (newVal) => {
      // 仅在当前无答案时使用 defaultValue
      if ((props.modelValue === null || props.modelValue === undefined) && newVal !== null && newVal !== undefined) {
        const numValue = Number(newVal)
        if (!isNaN(numValue)) {
          hours.value = numValue
          // 同步给父组件
          nextTick(() => {
            emit('update:modelValue', numValue)
          })
        }
      }
    }
  )

  // 处理时长变化
  const handleDurationChange = () => {
    const durationStr = hours.value 
    emit('update:modelValue', durationStr)
  }
</script>

<style lang="scss" scoped>
  .duration-question-box {
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

    .duration-input {
      margin-top: 20px;

      .duration-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;

        .unit {
          font-size: 18px;
          color: #606266;
          margin-right: 10px;
        }

        :deep(.el-input-number) {
          width: 120px;

          .el-input__wrapper {
            padding: 4px 4px;
            background-color: #f7f7f7;
            border-radius: 8px;
            box-shadow: 0 0 0 1px #dcdfe6 inset;
            transition: all 0.3s ease;

            &:hover {
              background-color: #fff;
            }

            &.is-focus {
              background-color: #fff;
              box-shadow:
                0 0 0 1px #5d87ff inset,
                0 0 0 2px rgba(93, 135, 255, 0.1);
            }
          }

          .el-input__inner {
            font-size: 18px;
            text-align: center;

            &::placeholder {
              color: #a8abb2;
            }
          }
        }
      }
    }

    // 大字体模式
    &.large-font {
      .header .title {
        font-size: 36px; // 从 18px 增大到 24px
      }

      .duration-input {
        .duration-group {
          .unit {
            font-size: 24px; // 从 14px 增大到 18px
          }

          :deep(.el-input-number) {
            width: 140px;

            .el-input__wrapper {
              padding:18px;
            }

            .el-input__inner {
              font-size: 24px; // 从 14px 增大到 18px
            }
          }
        }
      }
    }
  }
</style>
