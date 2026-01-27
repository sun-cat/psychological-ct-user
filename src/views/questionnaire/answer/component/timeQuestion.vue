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
      <div class="time-select-container">
        <ElSelect 
          v-model="hourValue" 
          placeholder="时"
          clearable
          class="hour-select"
        >
          <ElOption 
            v-for="hour in hourOptions" 
            :key="hour" 
            :label="hour" 
            :value="hour"
          />
        </ElSelect>
        
        <span class="separator">:</span>
        
        <ElSelect 
          v-model="minuteValue" 
          placeholder="分"
          clearable
          class="minute-select"
        >
          <ElOption 
            v-for="minute in minuteOptions" 
            :key="minute" 
            :label="minute" 
            :value="minute"
          />
        </ElSelect>
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
    (e: 'update:modelValue', value: string): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 从父组件注入字体大小状态
  const fontSizeMode = inject<Ref<'normal' | 'large'>>('fontSizeMode', ref('normal'))

  // 生成小时选项 00-23
  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

  // 生成分钟选项 00, 15, 30, 45
  const minuteOptions = ['00', '15', '30', '45']

  // 小时和分钟的独立响应式值
  const hourValue = ref<string>('')
  const minuteValue = ref<string>('')

  // 将分钟数四舍五入到最近的可选值 [00, 15, 30, 45]
  const roundToNearestMinute = (minute: number): string => {
    const options = [0, 15, 30, 45]
    const nearest = options.reduce((prev, curr) => {
      return Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
    })
    return String(nearest).padStart(2, '0')
  }

  // 从 defaultValue（秒数）初始化时间
  const initFromDefaultValue = (defaultValue: string | number) => {
    if (defaultValue) {
      const seconds = Number(defaultValue)
      if (!isNaN(seconds)) {
        const hour = Math.floor(seconds / 3600)
        const minute = Math.floor((seconds % 3600) / 60)
        hourValue.value = String(hour).padStart(2, '0')
        minuteValue.value = roundToNearestMinute(minute)
      }
    }
  }

  // 监听 props.modelValue 变化，解析并设置小时和分钟
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue && typeof newValue === 'string') {
        const [hour, minute] = newValue.split(':')
        hourValue.value = hour || ''
        minuteValue.value = minute || ''
      } else {
        // modelValue 为空时，尝试使用 defaultValue
        if (!hourValue.value && !minuteValue.value) {
          const defaultValue = props.question?.defaultValue
          if (defaultValue) {
            initFromDefaultValue(defaultValue)
            // 同步给父组件
            nextTick(() => {
              emit('update:modelValue', `${hourValue.value}:${minuteValue.value}`)
            })
          } else {
            // 如果都没有，使用固定默认值
            hourValue.value = '19'
            minuteValue.value = '00'
            // 同步给父组件
            nextTick(() => {
              emit('update:modelValue', '19:00')
            })
          }
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
      if (!props.modelValue && newVal) {
        initFromDefaultValue(newVal)
        // 同步给父组件
        nextTick(() => {
          emit('update:modelValue', `${hourValue.value}:${minuteValue.value}`)
        })
      }
    }
  )

  // 监听小时或分钟变化，组合并发射给父组件
  watch([hourValue, minuteValue], ([hour, minute]) => {
    if (hour && minute) {
      emit('update:modelValue', `${hour}:${minute}`)
    } else if (hour && !minute) {
      emit('update:modelValue', `${hour}:`)
    } else if (!hour && minute) {
      emit('update:modelValue', `:${minute}`)
    } else {
      emit('update:modelValue', '')
    }
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

    .time-picker {
      margin-top: 20px;

      .time-select-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .hour-select,
        .minute-select {
          width: 150px;
        }

        .separator {
          font-size: 24px;
          font-weight: 500;
          color: #303133;
          user-select: none;
        }
      }

      :deep(.el-input__wrapper) {
        padding: 18px 20px;
        font-size: 18px;
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
        font-size: 18px;

        &::placeholder {
          color: #a8abb2;
        }
      }
    }

    // 大字体模式
    &.large-font {
      .header .title {
        font-size: 36px; // 从 18px 增大到 24px
      }

      .time-picker {
        .time-select-container {
          .hour-select,
          .minute-select {
            width: 200px; // 大字体模式下选择器宽度增大
          }

          .separator {
            font-size: 32px; // 大字体模式下冒号也增大
          }
        }

        :deep(.el-input__wrapper) {
          padding: 22px 22px;
        }

        :deep(.el-input__inner) {
          font-size: 24px; // 从 14px 增大到 18px
        }

        // 下拉选项的字体大小
        :deep(.el-select-dropdown__item) {
          font-size: 24px;
          padding: 12px 20px;
        }
      }
    }
  }
</style>
