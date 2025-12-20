<template>
  <div class="drawing-board">
    <div class="board-container">
      <canvas ref="canvasRef" class="canvas"></canvas>
      <div class="toolbar">
        <ElButton size="small" @click="clearCanvas">清空</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    modelValue?: string // base64 格式的图片数据
  }

  interface Emits {
    (e: 'update:modelValue', value: string): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let ctx: CanvasRenderingContext2D | null = null
  let isDrawing = false
  let lastX = 0
  let lastY = 0

  // 保存当前画布内容（用于重新初始化时恢复）
  let savedImageData: string = ''

  // 初始化画布
  const initCanvas = () => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const container = canvas.parentElement
    if (!container) return

    // 设置画布大小为容器大小
    const width = container.clientWidth
    const height = container.clientHeight

    // 如果容器尺寸为0（隐藏状态），不进行初始化
    if (width === 0 || height === 0) {
      return
    }

    canvas.width = width
    canvas.height = height

    ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画笔样式
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 填充白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 如果有保存的图像数据，优先恢复
    if (savedImageData) {
      loadImage(savedImageData)
    } else if (props.modelValue) {
      // 否则如果有初始值，加载图片
      loadImage(props.modelValue)
    }
  }

  // 重新初始化画布（当组件从隐藏变为可见时调用）
  const reinitCanvas = () => {
    // 保存当前的画布数据
    if (canvasRef.value && canvasRef.value.width > 0) {
      savedImageData = canvasRef.value.toDataURL('image/png')
    } else if (props.modelValue) {
      savedImageData = props.modelValue
    }

    // 重新初始化
    initCanvas()
  }

  // 暴露方法给父组件
  defineExpose({
    reinitCanvas
  })

  // 加载图片到画布
  const loadImage = (base64: string) => {
    if (!canvasRef.value || !ctx) return

    const img = new Image()
    img.onload = () => {
      ctx!.drawImage(img, 0, 0)
    }
    img.src = base64
  }

  // 获取鼠标/触摸位置
  const getPosition = (e: MouseEvent | TouchEvent) => {
    if (!canvasRef.value) return { x: 0, y: 0 }

    const rect = canvasRef.value.getBoundingClientRect()
    let clientX = 0
    let clientY = 0

    if (e instanceof MouseEvent) {
      clientX = e.clientX
      clientY = e.clientY
    } else if (e instanceof TouchEvent && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  // 开始绘制
  const startDrawing = (e: MouseEvent | TouchEvent) => {
    isDrawing = true
    const pos = getPosition(e)
    lastX = pos.x
    lastY = pos.y
  }

  // 绘制中
  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing || !ctx) return

    e.preventDefault() // 防止触摸滚动

    const pos = getPosition(e)

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    lastX = pos.x
    lastY = pos.y
  }

  // 结束绘制
  const stopDrawing = () => {
    if (isDrawing) {
      isDrawing = false
      saveCanvas()
    }
  }

  // 保存画布内容为 base64
  const saveCanvas = () => {
    if (!canvasRef.value) return

    const base64 = canvasRef.value.toDataURL('image/png')
    emit('update:modelValue', base64)
  }

  // 清空画布
  const clearCanvas = () => {
    if (!canvasRef.value || !ctx) return

    const canvas = canvasRef.value
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    emit('update:modelValue', '')
  }

  onMounted(() => {
    initCanvas()

    if (!canvasRef.value) return

    const canvas = canvasRef.value

    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    // 触摸事件（移动端支持）
    canvas.addEventListener('touchstart', startDrawing, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stopDrawing)
  })

  onBeforeUnmount(() => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value

    // 移除事件监听
    canvas.removeEventListener('mousedown', startDrawing)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', stopDrawing)
    canvas.removeEventListener('mouseout', stopDrawing)
    canvas.removeEventListener('touchstart', startDrawing)
    canvas.removeEventListener('touchmove', draw)
    canvas.removeEventListener('touchend', stopDrawing)
  })
</script>

<style lang="scss" scoped>
  .drawing-board {
    width: 100%;

    .board-container {
      position: relative;
      width: 100%;
      height: 400px;
      border: 2px solid #5d87ff;
      border-radius: 8px;
      overflow: hidden;
      background-color: #ffffff;

      .canvas {
        display: block;
        cursor: crosshair;
      }

      .toolbar {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
      }
    }
  }
</style>
