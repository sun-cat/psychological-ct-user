/**
 * 音频播放状态管理
 *
 * 管理全局音频播放器的状态，确保同一时间只有一个音频在播放
 *
 * @module store/modules/audio
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  // 音频实例
  const audioInstance = ref<HTMLAudioElement | null>(null)

  // 是否正在播放
  const isPlaying = ref(false)

  // 当前播放的音频 URL
  const currentAudioUrl = ref<string>('')

  /**
   * 设置音频实例
   */
  const setAudioInstance = (instance: HTMLAudioElement | null) => {
    audioInstance.value = instance
  }

  /**
   * 设置播放状态
   */
  const setIsPlaying = (playing: boolean) => {
    isPlaying.value = playing
  }

  /**
   * 设置当前音频 URL
   */
  const setCurrentAudioUrl = (url: string) => {
    currentAudioUrl.value = url
  }

  /**
   * 重置所有状态
   */
  const resetAudioState = () => {
    audioInstance.value = null
    isPlaying.value = false
    currentAudioUrl.value = ''
  }

  return {
    audioInstance,
    isPlaying,
    currentAudioUrl,
    setAudioInstance,
    setIsPlaying,
    setCurrentAudioUrl,
    resetAudioState
  }
})
