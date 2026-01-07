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
              <template v-if="item.type === '1'">
                <radioSelect :question="item" v-model="item.answer" @onSelect="handleRadioSelect" />
              </template>
              <template v-if="item.type === '2'">
                <multiSelect :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '3'">
                <shortAnswer :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '4'">
                <dateQuestion :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '5'">
                <timeQuestion :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '8'">
                <regionQuestion :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '9'">
                <durationQuestion :question="item" v-model="item.answer" />
              </template>
              <template v-if="item.type === '10'">
                <radioSelectWithBoard
                  :question="item"
                  v-model="item.answer"
                  :isVisible="activeIndex === index"
                  @onSelect="handleRadioSelect"
                />
              </template>
            </div>
          </div>
        </ElCol>
        <ElCol :span="3">
          <div class="back-btn">
            <ElButton type="primary" size="large" @click="backBtn">返回</ElButton>
          </div>
          <div class="setting">
            <div @click="preQuestion" :class="{ disabled: activeIndex === 0 }">上一题</div>
            <div
              @click="nextQuestion"
              v-if="activeIndex < data.questions.length - 1"
              :class="{ disabled: isAutoNavigating }"
            >
              下一题
            </div>
            <div
              @click="submitAnswer"
              v-else
              class="submit-btn"
              :class="{ disabled: isAutoNavigating }"
            >
              提交
            </div>
            <div @click="toggleFontSize">【{{ fontSizeMode === 'large' ? '正常' : '大' }}】</div>
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
    uploadDrawingImage,
    answerTaskList,
    type SubmitAnswerParams
  } from '@/api/questionnaire'
  import radioSelect from './component/radioSelect.vue'
  import multiSelect from './component/multiSelect.vue'
  import shortAnswer from './component/shortAnswer.vue'
  import dateQuestion from './component/dateQuestion.vue'
  import timeQuestion from './component/timeQuestion.vue'
  import regionQuestion from './component/regionQuestion.vue'
  import durationQuestion from './component/durationQuestion.vue'
  import radioSelectWithBoard from './component/radioSelectWithBoard.vue'
  import AudioPlayer from './component/AudioPlayer.vue'
  import { router } from '@/router'
  defineOptions({ name: 'Answer' })
  const route = useRoute()
  const resultId = route.params.id as string
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

  // 标记是否正在处理自动跳转（防止重复提交）
  const isAutoNavigating = ref(false)

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
    // 清空所有题目的答案
    if (data.value && data.value.questions) {
      data.value.questions.forEach((question: any) => {
        if (question.type === '2') {
          // 多选题初始化为空数组
          question.answer = []
        } else if (question.type === '10') {
          // 单选画板题初始化为对象
          question.answer = { optionId: null, drawing: '' }
        } else {
          // 其他题型初始化为空字符串或 null
          question.answer = null
        }
      })
    }
    activeIndex.value = 0
    questionStartTime.value = Date.now()
    continueDialogVisible.value = false
    ElMessage.info('从第一题开始答题')
  }

  // 处理单选题选择事件（自动跳转到下一题）
  const handleRadioSelect = async () => {
    // 防止重复触发
    if (isAutoNavigating.value) {
      return
    }

    isAutoNavigating.value = true
    const currentQuestion = data.value.questions[activeIndex.value]

    // 提交当前题目答案
    const submitSuccess = await submitCurrentAnswer(currentQuestion)

    if (submitSuccess) {
      // 添加短暂延迟，让用户看到选中效果
      setTimeout(async () => {
        // 判断是否是最后一题
        if (activeIndex.value < data.value.questions.length - 1) {
          // 不是最后一题，自动跳转到下一题
          activeIndex.value++
          questionStartTime.value = Date.now()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          const res = await answerTaskList({ taskId: data.value.result.taskId, status: '0' })
          if (res.length > 0) {
            ElMessage.info('您还有未完成的测评任务，正在跳转...')
            setTimeout(() => {
              router.push({
                name: 'Answer',
                params: { id: res[0].resultId },
                query: { t: Date.now() }
              })
            }, 1000)
            return
          }

          // 如果是最后一题
          const isInIframe = window.self !== window.top

          if (isInIframe) {
            window.parent.postMessage(
              {
                type: 'ANSWER_COMPLETED',
                resultId: resultId
              },
              '*'
            )
          } else {
            ElMessage.success('量表提交成功')
            router.push({ name: 'Console' })
          }
        }
        isAutoNavigating.value = false
      }, 400) // 400ms 延迟，让用户看到选中效果
    } else {
      isAutoNavigating.value = false
    }
  }

  // 提交当前题目答案
  const submitCurrentAnswer = async (question: any) => {
    // 计算答题时间（毫秒）
    const answerTime = Date.now() - questionStartTime.value

    // 处理不同类型的题目
    let submitData: SubmitAnswerParams
    if (question.type === '1') {
      // 单选题：answer 是 optionId（字符串）
      const selectedOption = question.options.find((opt: any) => opt.optionId === question.answer)

      if (!selectedOption) {
        console.error('未找到选中的选项')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: selectedOption.content, // 选项内容
        optionId: selectedOption.optionId,
        time: answerTime
      }
    } else if (question.type === '2') {
      // 多选题：answer 是 optionId 数组
      // 确保答案是数组类型
      let selectedOptionIds = question.answer || []
      if (!Array.isArray(selectedOptionIds)) {
        console.error('多选题答案格式错误，应该是数组')
        return false
      }

      if (selectedOptionIds.length === 0) {
        console.error('多选题未选择任何选项')
        return false
      }

      // 获取所有选中选项的内容
      const selectedOptions = question.options.filter((opt: any) =>
        selectedOptionIds.includes(opt.optionId)
      )
      const answerContent = selectedOptions.map((opt: any) => opt.content).join(', ')

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: answerContent, // 多个选项内容用逗号分隔
        optionId: selectedOptionIds.join(','), // 多个 optionId 用逗号分隔
        time: answerTime
      }
    } else if (question.type === '3') {
      // 简答题：answer 是文本内容（字符串）
      const answerText = question.answer || ''

      if (!answerText.trim()) {
        console.error('简答题答案不能为空')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: answerText.trim(), // 答案文本内容
        optionId: '', // 简答题没有 optionId
        time: answerTime
      }
    } else if (question.type === '4') {
      // 日期题：answer 是日期字符串（YYYY-MM-DD）
      const dateValue = question.answer || ''

      if (!dateValue) {
        console.error('日期题答案不能为空')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: dateValue, // 日期字符串
        optionId: '', // 日期题没有 optionId
        time: answerTime
      }
    } else if (question.type === '5') {
      // 时间题：answer 是时间字符串（HH:mm:ss）
      const timeValue = question.answer || ''

      if (!timeValue) {
        console.error('时间题答案不能为空')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: timeValue, // 时间字符串
        optionId: '', // 时间题没有 optionId
        time: answerTime
      }
    } else if (question.type === '8') {
      // 地区题：answer 是地区文本（省 / 市 / 区）
      const regionValue = question.answer || ''

      if (!regionValue || !regionValue.trim()) {
        console.error('地区题答案不能为空')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: regionValue.trim(), // 地区文本
        optionId: '', // 地区题没有 optionId
        time: answerTime
      }
    } else if (question.type === '9') {
      // 时长题：answer 是时长字符串（HH:mm:ss）
      const durationValue = question.answer || ''

      if (!durationValue) {
        console.error('时长题答案不能为空')
        return false
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: durationValue, // 时长字符串
        optionId: '', // 时长题没有 optionId
        time: answerTime
      }
    } else if (question.type === '10') {
      // 单选画板题：answer 是对象 { optionId, drawing }
      const answerData = question.answer || {}

      if (!answerData.optionId) {
        console.error('单选画板题未选择选项')
        return false
      }

      const selectedOption = question.options.find(
        (opt: any) => opt.optionId === answerData.optionId
      )

      if (!selectedOption) {
        console.error('未找到选中的选项')
        return false
      }

      // 如果有画板数据，先上传画板图片
      let drawingUrl = ''
      if (answerData.drawing) {
        try {
          // 将base64转换为Blob
          const base64Data = answerData.drawing.split(',')[1] || answerData.drawing
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], { type: 'image/png' })

          // 创建File对象
          const file = new File([blob], `drawing_${Date.now()}.png`, { type: 'image/png' })

          // 上传图片
          const uploadRes = await uploadDrawingImage(file)
          drawingUrl = uploadRes.url || ''
          console.log('画板图片上传成功:', drawingUrl)
        } catch (error) {
          console.error('画板图片上传失败:', error)
          ElMessage.error('画板图片上传失败，请重试')
          return false
        }
      }

      submitData = {
        resultId: resultId,
        questionId: question.questionId,
        type: question.type.toString(),
        answer: drawingUrl, // 使用上传后的图片URL作为答案
        optionId: selectedOption.optionId,
        time: answerTime
      }
    } else {
      console.error('不支持的题目类型:', question.type)
      return false
    }

    try {
      await submitAnswerApi(submitData)
      console.log('答题提交成功:', submitData)
      return true
    } catch (error) {
      console.error('答题提交失败:', error)
      ElMessage.error('答案保存失败，请重试')
      return false
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
  const nextQuestion = async () => {
    // 如果正在自动跳转，阻止手动点击
    if (isAutoNavigating.value) {
      return
    }

    // 检查当前题目是否已作答
    const currentQuestion = data.value.questions[activeIndex.value]

    // 检查答案是否有效
    if (currentQuestion.type === '1') {
      // 单选题：检查是否选择了选项
      if (!currentQuestion.answer && currentQuestion.answer !== 0) {
        ElMessage.warning('请先回答当前题目')
        return
      }
    } else if (currentQuestion.type === '2') {
      // 多选题：检查是否至少选择了一个选项
      if (
        !currentQuestion.answer ||
        !Array.isArray(currentQuestion.answer) ||
        currentQuestion.answer.length === 0
      ) {
        ElMessage.warning('请至少选择一个选项')
        return
      }
    } else if (currentQuestion.type === '3') {
      // 简答题：检查是否输入了答案
      if (!currentQuestion.answer || !currentQuestion.answer.trim()) {
        ElMessage.warning('请输入答案后再提交')
        return
      }
    } else if (currentQuestion.type === '4') {
      // 日期题：检查是否选择了日期
      if (!currentQuestion.answer) {
        ElMessage.warning('请选择日期')
        return
      }
    } else if (currentQuestion.type === '5') {
      // 时间题：检查是否选择了时间
      if (!currentQuestion.answer) {
        ElMessage.warning('请选择时间')
        return
      }
    } else if (currentQuestion.type === '8') {
      // 地区题：检查是否选择了地区
      if (!currentQuestion.answer || !currentQuestion.answer.trim()) {
        ElMessage.warning('请选择地区')
        return
      }
    } else if (currentQuestion.type === '9') {
      // 时长题：检查是否输入了时长
      if (!currentQuestion.answer) {
        ElMessage.warning('请输入时长')
        return
      }
    } else if (currentQuestion.type === '10') {
      // 单选画板题：检查是否选择了选项
      if (!currentQuestion.answer || !currentQuestion.answer.optionId) {
        ElMessage.warning('请先选择一个选项')
        return
      }
    }

    // 提交当前题目答案
    const submitSuccess = await submitCurrentAnswer(currentQuestion)

    if (!submitSuccess) {
      // 提交失败，不跳转到下一题
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
    const currentQuestion = data.value.questions[activeIndex.value]

    // 检查当前题目（最后一题）是否已作答
    if (currentQuestion.type === '1') {
      if (!currentQuestion.answer && currentQuestion.answer !== 0) {
        ElMessage.warning('请先回答当前题目')
        return
      }
    } else if (currentQuestion.type === '2') {
      if (
        !currentQuestion.answer ||
        !Array.isArray(currentQuestion.answer) ||
        currentQuestion.answer.length === 0
      ) {
        ElMessage.warning('请至少选择一个选项')
        return
      }
    } else if (currentQuestion.type === '3') {
      if (!currentQuestion.answer || !currentQuestion.answer.trim()) {
        ElMessage.warning('请输入答案后再提交')
        return
      }
    } else if (currentQuestion.type === '4') {
      if (!currentQuestion.answer) {
        ElMessage.warning('请选择日期')
        return
      }
    } else if (currentQuestion.type === '5') {
      if (!currentQuestion.answer) {
        ElMessage.warning('请选择时间')
        return
      }
    } else if (currentQuestion.type === '8') {
      if (!currentQuestion.answer || !currentQuestion.answer.trim()) {
        ElMessage.warning('请选择地区')
        return
      }
    } else if (currentQuestion.type === '9') {
      if (!currentQuestion.answer) {
        ElMessage.warning('请输入时长')
        return
      }
    } else if (currentQuestion.type === '10') {
      if (!currentQuestion.answer || !currentQuestion.answer.optionId) {
        ElMessage.warning('请先选择一个选项')
        return
      }
    }

    // 提交最后一题的答案
    const submitSuccess = await submitCurrentAnswer(currentQuestion)
    if (!submitSuccess) {
      return
    }

    // 检查是否所有题目都已作答
    const unansweredQuestions = data.value.questions.filter((q: any) => {
      if (q.type === '1') {
        return !q.answer && q.answer !== 0
      } else if (q.type === '2') {
        return !q.answer || !Array.isArray(q.answer) || q.answer.length === 0
      } else if (q.type === '3') {
        return !q.answer || !q.answer.trim()
      } else if (q.type === '4') {
        return !q.answer
      } else if (q.type === '5') {
        return !q.answer
      } else if (q.type === '8') {
        return !q.answer || !q.answer.trim()
      } else if (q.type === '9') {
        return !q.answer
      } else if (q.type === '10') {
        return !q.answer || !q.answer.optionId
      }
      return true
    })

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
      // 检查是否还有未完成的任务
      const res = await answerTaskList({ taskId: data.value.result.taskId, status: '0' })
      if (res.length > 0) {
        ElMessage.info('您还有未完成的测评任务，正在跳转...')
        setTimeout(() => {
          router.push({
            name: 'Answer',
            params: { id: res[0].resultId },
            query: { t: Date.now() }
          })
        }, 1000)
        return
      }
      // 判断是否在 iframe 中
      const isInIframe = window.self !== window.top

      if (isInIframe) {
        // 如果在 iframe 中，通知父窗口
        window.parent.postMessage(
          {
            type: 'ANSWER_COMPLETED',
            resultId: resultId
          },
          '*'
        ) // 生产环境建议指定具体域名
      } else {
        // 如果不在 iframe 中，按原流程跳转到 Console
        await router.push({ name: 'Console' })
      }
    } catch (error) {
      // 用户取消提交
      if (error === 'cancel') {
        console.log('用户取消提交')
      } else {
        console.error('提交量表失败:', error)
      }
    }
  }
  /* 返回 */
  const backBtn = async () => {
    try {
      await ElMessageBox.confirm('您未答完题，确定要退出吗？', '提示', {
        confirmButtonText: '确定退出',
        cancelButtonText: '继续答题',
        type: 'warning'
      })
      const isInIframe = window.self !== window.top

      if (isInIframe) {
        // 通知父窗口用户取消答题
        window.parent.postMessage(
          {
            type: 'ANSWER_CANCELLED',
            resultId: resultId
          },
          '*'
        )
      } else {
        // 按原流程返回 Console
        await router.push({ name: 'Console' })
      }
    } catch (error) {
      // 用户取消，继续答题
      console.log('用户选择继续答题')
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
  .back-btn {
    margin: 80px 40px 0;
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
