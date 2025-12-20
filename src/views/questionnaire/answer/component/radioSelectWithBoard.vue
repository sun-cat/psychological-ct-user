<template>
  <div class="radio-select-box" :class="{ 'large-font': fontSizeMode === 'large' }">
    <!-- 单选画板题 -->
    <div class="header">
      <AudioPlayer :audioUrl="question.audio" />
      <div class="title" v-html="question.title"></div>
    </div>

    <ElDivider style="margin: 10px 0; border-color: #5d87ff" />

    <!-- 图片和画板并排显示 -->
    <div class="content-wrapper">
      <div class="desc-section">
        <div class="desc" v-html="question.desc"></div>
      </div>
      <div class="board-section">
        <DrawingBoard ref="drawingBoardRef" v-model="drawingData" />
      </div>
    </div>

    <div class="select" v-if="question.optionStyleType === '1'">
      <div
        class="select-item-crosswise"
        :class="{ active: selectedValue === item.optionId }"
        v-for="(item, index) in question.options"
        :key="index"
        @click="selectOption(item.optionId)"
      >
        <div class="item-1">{{ item.title }}</div>
        <div v-html="item.content"></div>
      </div>
    </div>
    <div class="select" v-else-if="question.optionStyleType === '2'">
      <div
        class="select-item"
        :class="{ active: selectedValue === item.optionId }"
        v-for="(item, index) in question.options"
        :key="index"
        @click="selectOption(item.optionId)"
      >
        <div class="item-1">{{ item.title }}</div>
        <div v-html="item.content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import AudioPlayer from './AudioPlayer.vue'
  import DrawingBoard from './DrawingBoard.vue'

  interface Props {
    question: any
    modelValue: any
    isVisible?: boolean // 标记当前题目是否可见
  }

  interface Emits {
    (e: 'update:modelValue', value: any): void
    (e: 'onSelect', optionId: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 从父组件注入字体大小状态
  const fontSizeMode = inject<Ref<'normal' | 'large'>>('fontSizeMode', ref('normal'))

  // 获取 DrawingBoard 组件的引用
  const drawingBoardRef = ref<InstanceType<typeof DrawingBoard> | null>(null)

  // 监听题目可见性变化，重新初始化画布
  watch(
    () => props.isVisible,
    (newVisible) => {
      if (newVisible) {
        // 当题目变为可见时，延迟一小段时间后重新初始化画布
        // 确保 DOM 已经完全渲染和显示
        nextTick(() => {
          setTimeout(() => {
            drawingBoardRef.value?.reinitCanvas()
          }, 50)
        })
      }
    },
    { immediate: true }
  )

  // 单选答案
  const selectedValue = computed({
    get: () => props.modelValue?.optionId || null,
    set: (value: string | number) => {
      emit('update:modelValue', {
        optionId: value,
        drawing: drawingData.value
      })
    }
  })

  // 画板数据
  const drawingData = ref<string>(props.modelValue?.drawing || '')

  // 监听画板数据变化，同步到父组件
  watch(drawingData, (newVal) => {
    emit('update:modelValue', {
      optionId: selectedValue.value,
      drawing: newVal
    })
  })

  const question = computed(() => props.question)

  // 选择选项
  const selectOption = (optionId: string) => {
    selectedValue.value = optionId
    // 触发选择事件，通知父组件
    emit('onSelect', optionId)
  }
</script>

<style lang="scss" scoped>
  .radio-select-box {
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

    .content-wrapper {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      .desc-section {
        flex: 1;
        min-width: 0;

        .desc {
          :deep(p) {
            padding: 0;
            margin: 0;
          }

          :deep(img) {
            max-width: 100%;
            height: auto;
            display: block;
          }
        }
      }

      .board-section {
        flex: 1;
        min-width: 0;
      }
    }

    .select {
      .select-item-crosswise {
        display: inline-flex;
        align-items: center;
        padding: 10px 20px;
        margin: 14px 10px;
        font-size: 14px;
        cursor: pointer;
        background-color: #f7f7f7;
        border-radius: 50px;
        transition: font-size 0.3s ease;

        .item-1 {
          margin-right: 10px;
        }

        // 富文本内容样式
        :deep(p) {
          padding: 0;
          margin: 0;
        }

        :deep(img) {
          max-width: 100%;
          height: auto;
        }

        &:hover {
          color: #fff;
          background-color: #b9d3f6;
        }

        &.active {
          color: #fff;
          background-color: #5d87ff;
        }
      }

      .select-item {
        display: flex;
        align-items: center;
        padding: 10px 0;
        margin: 14px 0;
        font-size: 14px;
        cursor: pointer;
        background-color: #f7f7f7;
        border-radius: 50px;
        transition: font-size 0.3s ease;

        .item-1 {
          margin: 0 20px 0 50px;
        }

        // 富文本内容样式
        :deep(p) {
          padding: 0;
          margin: 0;
        }

        :deep(img) {
          max-width: 60%;
          height: auto;
        }
      }

      .select-item:hover {
        color: #fff;
        background-color: #b9d3f6;
      }

      .select-item.active {
        color: #fff;
        background-color: #5d87ff;
      }
    }

    // 大字体模式
    &.large-font {
      .header .title {
        font-size: 24px; // 从 18px 增大到 24px
      }

      .select .select-item {
        font-size: 18px; // 从 14px 增大到 18px
      }

      .select .select-item-crosswise {
        font-size: 18px; // 从 14px 增大到 18px
      }
    }
  }
</style>
