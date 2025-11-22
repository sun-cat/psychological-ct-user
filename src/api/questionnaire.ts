import request from '@/utils/http'

// 获取量表和答题的详情
export function getAnswerDetail(resultId: string) {
  return request.get<any>({
    url: '/answer/getAnswer/' + resultId
  })
}

// 提交单题答案
export interface SubmitAnswerParams {
  resultId: string
  questionId: string
  type: string
  answer: string
  optionId: string
  time: number
}

export function submitAnswer(data: SubmitAnswerParams) {
  return request.post<any>({
    url: '/answer/addOption',
    data
  })
}

// 开始答题/继续答题
export function resumeAnswer(resultId: string) {
  return request.get<any>({
    url: '/answer/resumeAnswer/' + resultId
  })
}
