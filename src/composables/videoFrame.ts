type VideoEventListenerMap = {
  [EventName in keyof HTMLMediaElementEventMap]?: EventListener;
}

/**
 * 允许开发者在每个视频帧被渲染到屏幕时执行特定的回调函数
 * 确保处理操作与视频播放同步
 * @see https://web.dev/requestvideoframecallback-rvfc/
 */
function useVideoFrames(frameCallback = (_: number) => { }): {
  videoRef: Ref<HTMLVideoElement | null>
  setVideo: (videoRef: HTMLVideoElement) => void
} {
  const video = ref<HTMLVideoElement | null>(null)
  const callbackRef = ref(frameCallback)
  // callbackRef.value = frameCallback

  function setVideo(videoRef: HTMLVideoElement) {
    video.value = videoRef
  }
  watch(video, () => {
    if (!video.value)
      return

    let frameId: number | null
    let requestFrame = requestAnimationFrame // 处理视频的兼容方法
    let cancelFrame = cancelAnimationFrame

    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const vid = video.value as HTMLVideoElement & {
        requestVideoFrameCallback: typeof requestAnimationFrame
        cancelVideoFrameCallback: typeof cancelAnimationFrame
      }
      requestFrame = vid.requestVideoFrameCallback.bind(vid)
      cancelFrame = vid.cancelVideoFrameCallback.bind(vid)
    }

    const callbackFrame = () => {
      const videoTime = video.value?.currentTime || 0
      callbackRef.value(videoTime)
      frameId = requestFrame(callbackFrame)
    }

    const eventListeners: VideoEventListenerMap = {
      loadeddata() {
        requestAnimationFrame(() => callbackRef.value(video.value?.currentTime || 0))
      },
      play() {
        frameId = requestFrame(callbackFrame)
      },
      pause() {
        cancelFrame(frameId ?? 0)
        frameId = null
      },
      timeupdate() {
        if (!frameId) {
          requestAnimationFrame(() => callbackRef.value(video.value?.currentTime || 0))
        }
      },
    }

    Object.keys(eventListeners).forEach((eventName) => {
      const eventListener = eventListeners[eventName as keyof HTMLMediaElementEventMap]
      if (eventListener != null) {
        video.value?.addEventListener(eventName, eventListener)
      }
    })

    return () => {
      cancelFrame(frameId ?? 0)

      Object.keys(eventListeners).forEach((eventName) => {
        const eventListener
          = eventListeners[eventName as keyof HTMLMediaElementEventMap]
        if (eventListener != null) {
          video.value?.removeEventListener(eventName, eventListener)
        }
      })
    }
  })

  return {
    videoRef: video,
    setVideo,
  }
}

export default useVideoFrames
