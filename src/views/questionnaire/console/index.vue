<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { assessList, getResultPdf } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import { ElTag, ElProgress, ElButton } from 'element-plus'
  import { router } from '@/router'

  defineOptions({ name: 'Console' })

  type UserListItem = Api.SystemManage.UserListItem

  // 搜索表单
  const searchForm = ref({
    status: '0,1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '0': { type: 'info' as const, text: '未开始' },
    '1': { type: 'warning' as const, text: '进行中' },
    '2': { type: 'success' as const, text: '已完成' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    // 核心配置
    core: {
      apiFn: assessList,
      apiParams: {
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      paginationKey: {
        current: 'pageNum',
        size: 'pageSize'
      },
      columnsFactory: () => [
        {
          prop: 'questionnaireTitle',
          label: '量表名称',
          align: 'center'
        },
        {
          prop: 'createByName',
          label: '昵称',
          align: 'center'
        },
        {
          prop: 'status',
          label: '状态',
          align: 'center',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'answerProgress',
          label: '答题进度',
          align: 'center',
          width: 500,
          formatter: (row) => {
            // 计算答题进度百分比
            const progress =
              row.iniScore > 0 ? Math.round((row.answerCount / row.iniScore) * 100) : 0
            return h('div', { class: 'flex items-center gap-2' }, [
              h('div', { class: 'flex-1' }, [
                h(ElProgress, {
                  percentage: progress,
                  textInside: true,
                  color: progress === 100 ? '#67c23a' : '#409eff',
                  strokeWidth: 20
                })
              ]),
              h(
                'span',
                { class: 'text-xs text-gray-500 whitespace-nowrap ml-2' },
                `${row.answerCount}/${row.iniScore}`
              )
            ])
          }
        },
        // {
        //   prop: 'createTime',
        //   label: '创建日期',
        //   sortable: true
        // },
        {
          prop: 'operation',
          label: '操作',
          width: 320,
          fixed: 'right', // 固定列
          align: 'center',
          formatter: (row) =>
            h('div', [
              h(
                ElButton,
                {
                  disabled: row.isSee !== '1',
                  type: 'success',
                  onClick: () => downloadReport(row)
                },
                () => '查看报告'
              ),
              h(
                ElButton,
                {
                  type: 'primary',
                  onClick: () => startQuestions(row)
                },
                () => '开始答题'
              )
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 下载报告
   */
  const downloadReport = async (row?: any) => {
    try {
      ElMessage.info('正在生成报告，请稍候...')

      // 获取 PDF Blob
      const blob = await getResultPdf(row.resultId)

      // 检查是否是有效的 Blob
      if (!blob || !(blob instanceof Blob)) {
        throw new Error('服务器返回的数据格式不正确')
      }

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${row.questionnaireTitle}_报告_${row.resultId}.pdf`

      // 触发下载
      document.body.appendChild(link)
      link.click()

      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('报告下载成功')
      console.log('✅ 下载成功')
    } catch (error: any) {
      console.error('❌ 下载失败:', error)
      ElMessage.error(error.message || '报告下载失败，请稍后重试')
    }
  }
  /* 开始答题 */
  const startQuestions = (row: UserListItem): void => {
    console.log('开始答题:', row)
    router.push({ name: 'Answer', params: { id: row.resultId } })
    // window.open(`/questionnaire/answer/${row.questionnaireId}?resultId=${row.resultId}`, '_blank')
  }
</script>
