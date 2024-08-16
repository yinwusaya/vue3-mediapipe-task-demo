<script setup lang="ts">
// import { WebCam } from 'vue-web-cam'
import type { GestureRecognizerResult, Landmark } from '@mediapipe/tasks-vision'
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import useVideoFrames from '~/composables/videoFrame'

const webCameRef = ref()
const webCamCanvasRef = ref<HTMLCanvasElement | null>()
const webCamCanvasContextRef = ref<CanvasRenderingContext2D | null>()
const gestureRecognizerRef = ref<GestureRecognizer | null>(null)
const { videoRef, setVideo } = useVideoFrames((_) => {
  const video = unref(videoRef)
  const webcamTempCanvas = unref(webCamCanvasRef)
  const webcamTempCanvasContext = unref(webCamCanvasContextRef)
  const gestureRecognizer = unref(gestureRecognizerRef)
  if (!video || !webcamTempCanvas || !webcamTempCanvasContext || !gestureRecognizer || !video.videoWidth || !video.videoHeight) {
    return
  }
  if (webcamTempCanvas.width !== video.videoWidth || webcamTempCanvas.height !== video.videoHeight) {
    webcamTempCanvas.width = video.videoWidth
    webcamTempCanvas.height = video.videoHeight
  }
  // hack to get virtual cams processed by gestureRecognizer
  webcamTempCanvasContext.drawImage(video, 0, 0, webcamTempCanvas.width, webcamTempCanvas.height)
  const result = gestureRecognizer.recognize(webcamTempCanvas)
  onResult(result)
})
function onResult(result: GestureRecognizerResult) {
  console.log('__SOLA__', result)
}
function handleVideoStart(stream: MediaStream) {
  setVideo(webCameRef.value.video)
}
onMounted(async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  )
  gestureRecognizerRef.value = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '../models/gesture_recognizer.task',
    },
    runningMode: 'IMAGE',
    numHands: 2,
  })
  const tempCanvas = document.createElement('canvas')
  const tempContext = tempCanvas.getContext('2d') as CanvasRenderingContext2D
  webCamCanvasRef.value = tempCanvas
  webCamCanvasContextRef.value = tempContext
})

interface HandGestureData {
  handLandmarks: Landmark[]
  isLeftHand: boolean
}
</script>

<template>
  <div style="padding: 64px;">
    <WebCame1 ref="webCameRef" @started="handleVideoStart" />
  </div>
</template>

<style scoped></style>
