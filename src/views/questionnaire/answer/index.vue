<template>
  <div class="user-page art-full-height">
    <ElCard class="art-table-card" shadow="never" v-if="data && questionnaireData">
      <ElRow>
        <ElCol :span="3"> </ElCol>
        <ElCol :span="18">
          <div class="title">{{ questionnaireData.title }}</div>
          <div class="progress-style">
            <span>进度：</span>
            <ElProgress class="flex-1" :percentage="percent" :stroke-width="12">
              <div class="activeIndex"
                >(<span>{{ activeIndex + 1 }}</span
                >/ <span>{{ data.questions.length }}</span
                >)</div
              >
            </ElProgress>
          </div>
          <div class="issue">
            <div
              class="issue-item"
              v-show="activeIndex === index"
              v-for="(item, index) in data.questions"
              :key="index"
            >
              <radioSelect
                :question="item"
                v-model="item.answer"
                @update:modelValue="handleAnswerChange(item, $event)"
              />
            </div>
          </div>

          <!-- <div>
                        <div></div>
                        <div>{{ questionnaireData.description }}</div>
                    </div> -->
        </ElCol>
        <ElCol :span="3">
          <div class="setting">
            <div @click="preQuestion" :class="{ disabled: activeIndex === 0 }">上一题</div>
            <div @click="nextQuestion" v-if="activeIndex < data.questions.length - 1">下一题</div>
            <div @click="submitAnswer" v-else class="submit-btn">提交</div>
            <div @click="toggleFontSize">【{{ fontSizeMode === 'large' ? '大' : '正常' }}】</div>
            <div @click="openDialog">指导语</div>
          </div>
        </ElCol>
      </ElRow>
    </ElCard>
    <!-- 指导语弹窗（首次进入） -->
    <ElDialog
      v-model="dialogVisible"
      title="指导语"
      width="600"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="isManualOpen"
      append-to-body
      destroy-on-close
    >
      <div class="description">
        <AudioPlayer
          style="display: inline; margin-right: 6px"
          :audioUrl="questionnaireData?.audio"
          iconClass="text-2xl text-blue-500"
        />
        <span v-html="questionnaireData?.description"></span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton v-if="isManualOpen" @click="dialogVisible = false">关闭</ElButton>
          <ElButton v-else type="primary" @click="startAnswer" :loading="startLoading"
            >开始答题</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <!-- 继续答题确认弹窗 -->
    <ElDialog
      v-model="continueDialogVisible"
      title="提示"
      width="400px"
      append-to-body
      destroy-on-close
    >
      <div style="font-size: 16px; text-align: center">
        检测到您有未答完的题，是否继续进行答题？
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="handleStartFromBeginning">否，从第一题开始</ElButton>
          <ElButton type="primary" @click="handleContinueAnswer">是，继续答题</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>
<script setup lang="ts">
  import {
    getAnswerDetail,
    submitAnswer as submitAnswerApi,
    resumeAnswer,
    type SubmitAnswerParams
  } from '@/api/questionnaire'
  import radioSelect from './component/radioSelect.vue'
  import AudioPlayer from './component/AudioPlayer.vue'
  import { useWorktabStore } from '@/store/modules/worktab'
  defineOptions({ name: 'Answer' })
  import { router } from '@/router'
  const route = useRoute()
  const resultId = route.params.id as string
  const worktabStore = useWorktabStore()
  const data = ref<any>(null)
  const questionnaireData = ref<any>(null)
  const activeIndex = ref(0)

  // 记录每道题的开始时间
  const questionStartTime = ref<number>(Date.now())

  // 存储 questionIndex 和 lastQno
  const questionIndex = ref<number | null>(null)
  const lastQno = ref<string | null>(null)

  // 开始答题按钮加载状态
  const startLoading = ref(false)

  // 继续答题确认弹窗
  const continueDialogVisible = ref(false)

  // 标记是否是手动打开指导语（点击按钮打开）
  const isManualOpen = ref(false)

  // 字体大小模式：'normal' | 'large'
  const fontSizeMode = ref<'normal' | 'large'>('normal')

  // 切换字体大小
  const toggleFontSize = () => {
    fontSizeMode.value = fontSizeMode.value === 'normal' ? 'large' : 'normal'
  }

  // 向子组件提供字体大小状态
  provide('fontSizeMode', fontSizeMode)

  const getData = async () => {
    const res = await getAnswerDetail(resultId)
    console.log('量表答题详情', res)
    data.value = res
    questionnaireData.value = res.questionnaire
    questionIndex.value = res.questionIndex
    lastQno.value = res.lastQno

    // 等待 DOM 更新完成后再显示弹窗，避免位置跳动
    await nextTick()

    // 使用 setTimeout 延迟显示弹窗，确保页面完全渲染
    setTimeout(() => {
      // 判断是否是首次进入
      if (questionIndex.value === null) {
        // 首次进入，自动弹出指导语
        isManualOpen.value = false
        dialogVisible.value = true
      } else {
        // 非首次进入，弹出继续答题确认
        continueDialogVisible.value = true
      }
    }, 100)

    // 初始化第一题的开始时间
    questionStartTime.value = Date.now()
  }

  // 开始答题（首次进入点击开始答题按钮）
  const startAnswer = async () => {
    startLoading.value = true
    try {
      await resumeAnswer(resultId)
      console.log('开始答题接口调用成功')
      dialogVisible.value = false
      isManualOpen.value = false
      // 从第一题开始
      activeIndex.value = 0
      questionStartTime.value = Date.now()
    } catch (error) {
      console.error('开始答题失败:', error)
      ElMessage.error('开始答题失败，请重试')
    } finally {
      startLoading.value = false
    }
  }

  // 处理继续答题
  const handleContinueAnswer = () => {
    if (questionIndex.value !== null && questionIndex.value >= 0) {
      // 跳转到上次答题的位置
      activeIndex.value = questionIndex.value
      questionStartTime.value = Date.now()
      continueDialogVisible.value = false
      ElMessage.success(`已跳转到第 ${questionIndex.value + 1} 题`)
    } else {
      ElMessage.error('无法获取答题进度')
    }
  }

  // 处理从第一题开始
  const handleStartFromBeginning = () => {
    activeIndex.value = 0
    questionStartTime.value = Date.now()
    continueDialogVisible.value = false
    ElMessage.info('从第一题开始答题')
  }

  // 处理答案变化，调用提交接口
  const handleAnswerChange = async (question: any, selectedOptionId: string) => {
    // 计算答题时间（秒）
    const answerTime = Math.floor((Date.now() - questionStartTime.value) / 1000)

    // 找到选中的选项
    const selectedOption = question.options.find((opt: any) => opt.optionId === selectedOptionId)

    if (!selectedOption) {
      console.error('未找到选中的选项')
      return
    }

    // 构建提交参数
    const submitData: SubmitAnswerParams = {
      resultId: resultId,
      questionId: question.questionId,
      type: question.type.toString(),
      answer: selectedOption.content, // 选项内容
      optionId: selectedOption.optionId,
      time: answerTime
    }

    try {
      await submitAnswerApi(submitData)
      console.log('答题提交成功:', submitData)

      // 更新问题的答题信息
      question.optionId = selectedOption.optionId

      // 静默保存，不弹出成功提示，减少打扰
      // ElMessage.success('答案已保存')
    } catch (error) {
      console.error('答题提交失败:', error)
      ElMessage.error('答案保存失败，请重试')
      // 提交失败时清空答案
      question.answer = null
    }
  }
  // 打开指导语弹窗（点击按钮手动打开）
  const dialogVisible = ref(false)
  const openDialog = () => {
    isManualOpen.value = true
    dialogVisible.value = true
  }
  // 计算进度条
  const percent = computed(() => {
    return Math.round((100 * (activeIndex.value + 1)) / data.value.questions.length)
  })
  // 上一题
  const preQuestion = () => {
    if (activeIndex.value > 0) {
      activeIndex.value--
      // 重置下一题的开始时间
      questionStartTime.value = Date.now()
      // 滚动到顶部，确保用户看到题目
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      ElMessage.warning('已经是第一题了')
    }
  }

  // 下一题
  const nextQuestion = () => {
    // 检查当前题目是否已作答
    const currentQuestion = data.value.questions[activeIndex.value]
    if (!currentQuestion.answer && currentQuestion.answer !== 0) {
      ElMessage.warning('请先回答当前题目')
      return
    }

    // 判断是否是最后一题
    if (activeIndex.value < data.value.questions.length - 1) {
      activeIndex.value++
      // 重置下一题的开始时间
      questionStartTime.value = Date.now()
      // 滚动到顶部，确保用户看到题目
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      ElMessage.warning('已经是最后一题了')
    }
  }

  // 最终提交量表（所有题目已答完）
  const submitAnswer = async () => {
    // 检查是否所有题目都已作答
    const unansweredQuestions = data.value.questions.filter((q: any) => !q.answer && q.answer !== 0)

    if (unansweredQuestions.length > 0) {
      ElMessage.warning(`还有 ${unansweredQuestions.length} 道题未作答，请完成所有题目后再提交`)
      return
    }

    try {
      await ElMessageBox.confirm('确认提交量表吗？提交后将无法修改', '提示', {
        confirmButtonText: '确认提交',
        cancelButtonText: '取消',
        type: 'warning'
      })

      ElMessage.success('量表提交成功')
      worktabStore.removeTab(route.path)
      // 先跳转到 Console 页面
      await router.push({ name: 'Console' })

      // 延迟关闭当前标签页，确保路由跳转完成
      // nextTick(() => {

      // })
    } catch (error) {
      // 用户取消提交
      if (error === 'cancel') {
        console.log('用户取消提交')
      } else {
        console.error('提交量表失败:', error)
      }
    }
  }

  onMounted(() => {
    getData()
  })
</script>
<style lang="scss" scoped>
  .user-page {
    overflow-y: auto;
  }

  .art-table-card {
    height: auto !important;
    overflow: visible !important;
  }

  .title {
    margin-top: 10px;
    font-size: 28px;
    color: #5d87ff;
    text-align: center;
  }

  .progress-style {
    display: flex;
    align-items: center;
    width: 30%;
    margin: 30px 0;
    font-size: 16px;

    > span {
      margin-right: 10px;
    }

    .activeIndex {
      margin-left: 10px;
    }
  }

  .setting {
    margin: 80px 40px 0;
    text-align: center;
    cursor: pointer;
    background-color: #dcebff;

    > div {
      height: 50px;
      line-height: 50px;
      transition: all 0.3s ease;
    }

    > div:hover:not(.disabled) {
      color: white;
      background-color: #5d87ff;
    }

    > div.disabled {
      cursor: not-allowed;
      background-color: #e8e8e8;
      opacity: 0.5;
    }

    > div.submit-btn {
      font-weight: bold;
      color: white;
      background-color: #67c23a;
    }

    > div.submit-btn:hover {
      background-color: #529b2e;
    }
  }

  .description {
    display: inline-flex;
    font-size: 16px;
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
  }
</style>
