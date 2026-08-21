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

    const analyser =
      analyserRef.current

    if (!analyser) {
      return
    }

    const bufferLength =
      analyser.frequencyBinCount

    const dataArray =
      new Uint8Array(bufferLength)

    let animationId = 0

    /*  오실로 스코프
    function draw() {

      animationId =
        requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(
        dataArray
      )

      const width =
        canvas.width

      const height =
        canvas.height

      ctx.clearRect(
        0,
        0,
        width,
        height
      )

      ctx.beginPath()

      const sliceWidth =
        width / bufferLength

      let x = 0

      for (
        let i = 0;
        i < bufferLength;
        i++
      ) {

        const v =
          dataArray[i] / 128.0

        const y =
          (v * height) / 2

        if (i === 0) {

          ctx.moveTo(x, y)

        } else {

          ctx.lineTo(x, y)

        }

        x += sliceWidth
      }

      ctx.stroke()
    }
  */
    /*   막대그래프
    function draw() {

      animationId =
        requestAnimationFrame(draw)

      analyser.getByteFrequencyData(
        dataArray
      )

      const width =
        canvas.width

      const height =
        canvas.height

      ctx.clearRect(
        0,
        0,
        width,
        height
      )

      const barCount = 64

      const barWidth =
        width / barCount - 3

      for (
        let i = 0;
        i < barCount;
        i++
      ) {

        const index =
          Math.floor(
            i * bufferLength / barCount
          )

        const value =
          dataArray[index]

        const barHeight =
          (value / 255) * height

        const x =
          i * (barWidth + 3)

        const y =
          height - barHeight

        ctx.fillRect(
          x,
          y,
          barWidth,
          barHeight
        )
      }
    }
  */
    /*원형 파형
    function draw() {

      animationId =
        requestAnimationFrame(draw)

      analyser.getByteFrequencyData(
        dataArray
      )

      const width =
        canvas.width

      const height =
        canvas.height

      ctx.clearRect(
        0,
        0,
        width,
        height
      )

      const centerX =
        width / 2

      const centerY =
        height / 2

      const baseRadius =
        Math.min(width, height) * 0.28

      const pointCount = 128

      ctx.beginPath()

      for (
        let i = 0;
        i <= pointCount;
        i++
      ) {

        const angle =
          (i / pointCount) *
          Math.PI *
          2

        const dataIndex =
          Math.floor(
            i * bufferLength / pointCount
          )

        const value =
          dataArray[dataIndex] / 255

        const radius =
          baseRadius +
          value * 60

        const x =
          centerX +
          Math.cos(angle) * radius

        const y =
          centerY +
          Math.sin(angle) * radius

        if (i === 0) {

          ctx.moveTo(x, y)

        } else {

          ctx.lineTo(x, y)

        }
      }

      ctx.closePath()

      ctx.stroke()
    }
  */

function draw() {

  animationId =
    requestAnimationFrame(draw)

  // 시간 영역 데이터
  const timeData =
    new Uint8Array(bufferLength)

  analyser.getByteTimeDomainData(
    timeData
  )

  // 주파수 데이터
  const frequencyData =
    new Uint8Array(bufferLength)

  analyser.getByteFrequencyData(
    frequencyData
  )

  const width =
    canvas.width

  const height =
    canvas.height

  ctx.clearRect(
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

  ctx.beginPath()

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

      ctx.moveTo(
        x,
        y
      )

    } else {

      ctx.lineTo(
        x,
        y
      )

    }

    x += sliceWidth
  }

  ctx.stroke()


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

    ctx.fillRect(
      barX,
      barY,
      barWidth,
      barHeight
    )
  }
}

/*****************************************************/
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