'use client'

import { useEffect, useRef } from 'react'

type AudioVisualizerProps = {
  audioRef: React.RefObject<HTMLAudioElement | null>
}

export default function AudioVisualizer({
  audioRef,
}: AudioVisualizerProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null)

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const analyserRef =
    useRef<AnalyserNode | null>(null)

  const sourceRef =
    useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    const canvas = canvasRef.current

    if (!audio || !canvas) {
      return
    }

    const ctx =
      canvas.getContext('2d')

    if (!ctx) {
      return
    }

    // 이미 연결되어 있으면 다시 만들지 않는다.
    if (!audioContextRef.current) {
      const audioContext =
        new AudioContext()

      const analyser =
        audioContext.createAnalyser()

      analyser.fftSize = 2048

      const source =
        audioContext.createMediaElementSource(
          audio
        )

      source.connect(analyser)

      analyser.connect(
        audioContext.destination
      )

      audioContextRef.current =
        audioContext

      analyserRef.current =
        analyser

      sourceRef.current =
        source
    }

    /*
     * 여기서 analyser를 한 번 확정한다.
     * 이후 draw()에서는 이 activeAnalyser만 사용한다.
     */
    const activeAnalyser =
      analyserRef.current

    if (!activeAnalyser) {
      return
    }

    const bufferLength =
      activeAnalyser.frequencyBinCount

    let animationId = 0

    function draw() {
      animationId =
        requestAnimationFrame(draw)

      const currentCanvas =
        canvasRef.current

      if (!currentCanvas) {
        return
      }

      const currentCtx =
        currentCanvas.getContext('2d')

      if (!currentCtx) {
        return
      }

      // 시간 영역 데이터
      const timeData =
        new Uint8Array(bufferLength)

      const currentAnalyser =
        analyserRef.current

      if (!currentAnalyser) {
        return
      }

      currentAnalyser.getByteTimeDomainData(
        timeData
      )

      // 주파수 데이터
      const frequencyData =
        new Uint8Array(bufferLength)

      currentAnalyser.getByteFrequencyData(
        frequencyData
      )

      const width =
        currentCanvas.width

      const height =
        currentCanvas.height

      currentCtx.clearRect(
        0,
        0,
        width,
        height
      )

      // =================================
      // 위쪽 : 파형
      // =================================

      const waveformHeight =
        height * 0.55

      currentCtx.beginPath()

      const sliceWidth =
        width / bufferLength

      let x = 0

      for (
        let i = 0;
        i < bufferLength;
        i++
      ) {
        const v =
          timeData[i] / 128.0

        const y =
          (v * waveformHeight) / 2

        if (i === 0) {
          currentCtx.moveTo(
            x,
            y
          )
        } else {
          currentCtx.lineTo(
            x,
            y
          )
        }

        x += sliceWidth
      }

      currentCtx.stroke()

      // =================================
      // 아래쪽 : 이퀄라이저
      // =================================

      const eqTop =
        waveformHeight + 10

      const eqHeight =
        height - eqTop

      const barCount =
        64

      const gap = 3

      const barWidth =
        width / barCount - gap

      for (
        let i = 0;
        i < barCount;
        i++
      ) {
        const dataIndex =
          Math.floor(
            i *
            bufferLength /
            barCount
          )

        const value =
          frequencyData[dataIndex] / 255

        const barHeight =
          value * eqHeight

        const barX =
          i *
          (barWidth + gap)

        const barY =
          height - barHeight

        currentCtx.fillRect(
          barX,
          barY,
          barWidth,
          barHeight
        )
      }
    }

    function resumeAudio() {
      const audioContext =
        audioContextRef.current

      if (
        audioContext &&
        audioContext.state === 'suspended'
      ) {
        audioContext.resume()
      }
    }

    audio.addEventListener(
      'play',
      resumeAudio
    )

    draw()

    return () => {
      cancelAnimationFrame(
        animationId
      )

      audio.removeEventListener(
        'play',
        resumeAudio
      )
    }
  }, [audioRef])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      style={{
        width: '100%',
        height: '200px',
        display: 'block',
      }}
    />
  )
}