<template>
  <div class="region-question-box" :class="{ 'large-font': fontSizeMode === 'large' }">
    <!-- 地区题 -->
    <div class="header">
      <AudioPlayer :audioUrl="question.audio" />
      <div class="title" v-html="question.title"></div>
    </div>

    <ElDivider style="margin: 10px 0; border-color: #5d87ff" />
   <div calss="desc" v-html="question.desc"></div>
    <div class="region-cascader">
      <ElCascader
        v-model="regionValue"
        :options="regionOptions"
        placeholder="请选择省/市/区"
        :props="cascaderProps"
        :clearable="true"
        style="width: 100%"
        @change="handleRegionChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { Ref } from 'vue'
  import AudioPlayer from './AudioPlayer.vue'
  import { regionData,codeToText } from 'element-china-area-data'
  // import { getRegionData } from '@/api/region' // TODO: 取消注释以使用后端接口获取地区数据

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

  // 地区数据（省市区三级联动）
  // 方式1：使用本地静态数据（element-china-area-data）
  const regionOptions = ref(regionData)

  // 方式2：从后端接口获取地区数据（需要时取消下面的注释）
  // const regionOptions = ref<any[]>([])
  // const loadRegionData = async () => {
  //   try {
  //     const data = await getRegionData()
  //     regionOptions.value = data
  //   } catch (error) {
  //     console.error('加载地区数据失败:', error)
  //     ElMessage.error('加载地区数据失败')
  //   }
  // }
  // onMounted(() => {
  //   loadRegionData()
  // })

  // 级联选择器配置
  const cascaderProps = {
    expandTrigger: 'hover' as const,
    value: 'value',
    label: 'label',
    children: 'children'
  }

  // 级联选择器的值（地区代码数组）
  const regionValue = ref<string[]>([])

  // 处理地区选择变化
  const handleRegionChange = (value: any) => {
    if (value && value.length > 0) {
      // 将选择的地区代码转换为文本
      const regionText = value.map((code: string) => codeToText[code]).join(' / ')
      console.log('选择的地区代码:', value)
      console.log('转换后的地区文本:', regionText)
      // 向父组件传递地区文本
      emit('update:modelValue', regionText)
    } else {
      emit('update:modelValue', '')
    }
  }

  const question = computed(() => props.question)
</script>

<style lang="scss" scoped>
  .region-question-box {
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

    .region-cascader {
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

      .region-cascader {
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
