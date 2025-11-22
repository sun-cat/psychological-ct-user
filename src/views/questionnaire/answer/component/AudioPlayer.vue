<template>
  <span
    class="audio-player-icon"
    @click="handleClick"
    :class="{ playing: isPlayingCurrent }"
    :title="isPlayingCurrent ? '暂停' : '播放'"
  >
    <ArtSvgIcon
      :icon="isPlayingCurrent ? 'line-md:pause' : 'line-md:volume-high-filled'"
      :class="iconClass"
    />
  </span>
</template>

<script setup lang="ts">
  /**
   * 音频播放器组件
   * 用于播放题目或指导语的音频
   * 集成了完整的音频播放逻辑，无需依赖父组件
   *
   * @example
   * <AudioPlayer :audioUrl="question.audio" />
   * <AudioPlayer :audioUrl="questionnaireData.audio" iconClass="text-2xl text-blue-500" />
   */
  import { useAudioStore } from '@/store/modules/audio'

  interface Props {
    /** 音频 URL（相对路径或完整路径） */
    audioUrl?: string
    /** 图标自定义类名 */
    iconClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    audioUrl: '',
    iconClass: 'text-blue-500'
  })

  // 使用 Pinia store 管理音频状态（所有 AudioPlayer 组件共享同一个音频实例）
  const audioStore = useAudioStore()
  const { audioInstance, isPlaying, currentAudioUrl } = storeToRefs(audioStore)

  /**
   * 判断当前音频是否正在播放
   */
  const isPlayingCurrent = computed(() => {
    return isPlaying.value && currentAudioUrl.value === props.audioUrl
  })

  /**
   * 播放音频
   * @param audioUrl 音频 URL（相对路径或完整路径）
   */
  const playAudio = (audioUrl: string) => {
    if (!audioUrl) {
      ElMessage.warning('暂无音频')
      return
    }

    // 构建完整的音频 URL
    const fullAudioUrl = audioUrl.startsWith('http')
      ? audioUrl
      : `${import.meta.env.VITE_API_PROXY_URL}${audioUrl}`

    // 如果正在播放相同的音频，则暂停
    if (isPlaying.value && currentAudioUrl.value === audioUrl) {
      audioInstance.value?.pause()
      audioStore.setIsPlaying(false)
      return
    }

    // 停止之前的音频
    if (audioInstance.value) {
      audioInstance.value.pause()
      audioStore.setAudioInstance(null)
    }

    // 创建新的音频实例
    const newAudio = new Audio(fullAudioUrl)
    audioStore.setAudioInstance(newAudio)
    audioStore.setCurrentAudioUrl(audioUrl)

    // 播放音频
    newAudio
      .play()
      .then(() => {
        audioStore.setIsPlaying(true)
      })
      .catch((error) => {
        console.error('音频播放失败:', error)
        ElMessage.error('音频播放失败')
        audioStore.setIsPlaying(false)
      })

    // 监听播放结束
    newAudio.addEventListener('ended', () => {
      audioStore.setIsPlaying(false)
      audioStore.setCurrentAudioUrl('')
    })

    // 监听播放错误
    newAudio.addEventListener('error', () => {
      audioStore.setIsPlaying(false)
      audioStore.setCurrentAudioUrl('')
      ElMessage.error('音频加载失败')
    })
  }

  /**
   * 停止音频播放
   */
  const stopAudio = () => {
    if (audioInstance.value) {
      audioInstance.value.pause()
      audioStore.resetAudioState()
    }
  }

  /**
   * 处理点击事件
   */
  const handleClick = () => {
    if (!props.audioUrl) {
      ElMessage.warning('暂无音频')
      return
    }
    playAudio(props.audioUrl)
  }

  // 组件卸载时停止音频
  onUnmounted(() => {
    stopAudio()
  })
</script>

<style lang="scss" scoped>
  .audio-player-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    line-height: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }

    &.playing {
      color: #5d87ff;
      animation: pulse 1.5s ease-in-out infinite;
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.6;
    }
  }
</style>
