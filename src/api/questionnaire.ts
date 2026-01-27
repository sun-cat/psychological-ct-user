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

// 上传画板图片
export function uploadDrawingImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<{ url: string }>({
    url: '/resource/oss/patient/upload',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
/**
 * 查询测评任务列表
 */
export function answerTaskList(data: any) {
  return request.get<any>({
    url: '/answer/task/list',
    params: data
  })
}
/* 
结束答题调用
*/
export function finishAnswer(resultId: string) {
  return request.get<any>({
    url: '/answer/finishAnswer/' + resultId
  })
}