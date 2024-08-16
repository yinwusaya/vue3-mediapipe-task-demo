<script setup lang="ts">
const props = withDefaults(defineProps<{
  width?: number | string
  height?: number | string
  autoplay?: boolean
  screenshotFormat?: string
  selectFirstDevice?: boolean
  deviceId?: string
  playsinline?: boolean
  resolution?: {
    height: number
    width: number
  }
}>(), {
  width: '100%',
  height: 500,
  autoplay: true,
  screenshotFormat: 'image/jpeg',
  selectFirstDevice: true,
  deviceId: '',
  playsinline: true,
})

const emits = defineEmits(['error', 'started'])
const deviceIdModel = defineModel<string>()
const videoRef = ref<HTMLVideoElement | null>(null)
const streamSourceRef = ref<string>('')
const camerasRef = ref<MediaDeviceInfo[]>([])
const camerasListEmittedRef = ref<boolean>(false)
watch(deviceIdModel, (id) => {
  if (id) {
    console.log('deviceIdModel watch', deviceIdModel.value)
    changeCamera(id)
  }
})
function changeCamera(id: string) {
  cameraStop()
  loadCamera(id)
}
function cameraStop() {

}
function loadCamera(id: string) {
  const constraints: MediaStreamConstraints = { video: { deviceId: { exact: id } } }

  const { resolution } = props
  if (resolution) {
    constraints.video = { ...constraints.video, height: resolution.height, width: resolution.width }
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => loadStream(stream))
}
function loadStream(stream: MediaStream) {
  if (videoRef.value) {
    if ('srcObject' in videoRef.value) {
      videoRef.value.srcObject = stream
    }
    else {
      // 防止在新的浏览器里使用它，因为它已经不再支持了
      videoRef.value.src = window.URL.createObjectURL(stream)
    }
  }
  else {
    onError(new Error('video标签未初始化成功'))
  }
  emits('started', stream)
}
function setupMedia() {
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }

  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = legacyGetUserMediaSupport()
  }

  testMediaAccess()
}
function legacyGetUserMediaSupport() {
  return (constraints: MediaStreamConstraints) => {
    // First get ahold of the legacy getUserMedia, if present
    const getUserMedia
      = navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia
      || navigator.oGetUserMedia

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(
        new Error('getUserMedia is not implemented in this browser'),
      )
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints, resolve, reject)
    })
  }
}
function testMediaAccess() {
  const constraints: MediaStreamConstraints = { video: true }

  if (props.resolution) {
    constraints.video = {}
    constraints.video.height = props.resolution.height
    constraints.video.width = props.resolution.width
  }
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      // Make sure to stop this MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => {
        track.stop()
      })
      loadCameras()
    })
    .catch(error => emits('error', error))
}
function loadCameras() {
  navigator.mediaDevices
    .enumerateDevices()
    .then((deviceInfos) => {
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i]
        if (deviceInfo.kind === 'videoinput') {
          camerasRef.value.push(deviceInfo)
        }
      }
    })
    .then(() => {
      deviceIdModel.value = camerasRef.value[0].deviceId
    })
    .catch(error => onError(error))
}
function onError(error: Error) {
  emits('error', error)
}

defineExpose({
  video: videoRef,
})
onMounted(() => {
  setupMedia()
})
</script>

<template>
  <video
    ref="videoRef" :width="width" :height="height" :src="streamSourceRef" :autoplay="autoplay"
    :playsinline="playsinline"
  />
</template>
