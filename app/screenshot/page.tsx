'use client'

import { useRef, useState } from 'react'
import Header from '../../components/Header'

type ImageFormat = 'png' | 'jpeg' | 'webp'

export default function ScreenshotPage() {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  const canvasRef =
    useRef<HTMLCanvasElement>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const [isSelecting, setIsSelecting] =
    useState(false)

  const [image, setImage] =
    useState<string | null>(null)

  const [format, setFormat] =
    useState<ImageFormat>('png')

  const [start, setStart] =
    useState<{
      x: number
      y: number
    } | null>(null)

  const [selection, setSelection] =
    useState<{
      x: number
      y: number
      width: number
      height: number
    } | null>(null)

  const startScreenshot = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })

      streamRef.current = stream

      const video =
        videoRef.current

      if (!video) {
        stream
          .getTracks()
          .forEach(track =>
            track.stop()
          )
        return
      }

      video.srcObject = stream

      await video.play()

      setIsSelecting(true)

      const track =
        stream.getVideoTracks()[0]

      track.addEventListener(
        'ended',
        () => {
          stopScreenshot()
        }
      )
    } catch {
      // 사용자가 취소한 경우
    }
  }

  const stopScreenshot = () => {
    streamRef.current
      ?.getTracks()
      .forEach(track =>
        track.stop()
      )

    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject =
        null
    }

    setIsSelecting(false)
    setStart(null)
    setSelection(null)
  }

  const getPoint = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      e.currentTarget.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const point = getPoint(e)

    setStart(point)

    setSelection({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    })
  }

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!start) return

    const point = getPoint(e)

    setSelection({
      x: Math.min(
        start.x,
        point.x
      ),
      y: Math.min(
        start.y,
        point.y
      ),
      width: Math.abs(
        point.x - start.x
      ),
      height: Math.abs(
        point.y - start.y
      ),
    })
  }

  const handleMouseUp = () => {
    if (
      !selection ||
      selection.width < 5 ||
      selection.height < 5
    ) {
      setStart(null)
      setSelection(null)
      return
    }

    captureSelection()
    setStart(null)
  }

  const captureSelection = () => {
    const video =
      videoRef.current

    const canvas =
      canvasRef.current

    if (!video || !canvas) {
      return
    }

    const displayWidth =
      video.clientWidth

    const displayHeight =
      video.clientHeight

    if (
      displayWidth === 0 ||
      displayHeight === 0
    ) {
      return
    }

    const scaleX =
      video.videoWidth /
      displayWidth

    const scaleY =
      video.videoHeight /
      displayHeight

    const sx =
      selection!.x * scaleX

    const sy =
      selection!.y * scaleY

    const sw =
      selection!.width * scaleX

    const sh =
      selection!.height * scaleY

    canvas.width = sw
    canvas.height = sh

    const context =
      canvas.getContext('2d')

    if (!context) return

    context.drawImage(
      video,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      sw,
      sh
    )

    const mime =
      format === 'png'
        ? 'image/png'
        : format === 'jpeg'
          ? 'image/jpeg'
          : 'image/webp'

    const quality =
      format === 'png'
        ? undefined
        : 0.92

    const result =
      canvas.toDataURL(
        mime,
        quality
      )

    setImage(result)
    setSelection(null)
  }

  const downloadImage = () => {
    if (!image) return

    const extension =
      format === 'jpeg'
        ? 'jpg'
        : format

    const link =
      document.createElement('a')

    link.href = image

    link.download =
      `screenshot-${Date.now()}.${extension}`

    link.click()
  }

  const copyToClipboard =
    async () => {
      if (!image) return

      try {
        const response =
          await fetch(image)

        const blob =
          await response.blob()

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ])

        alert(
          '클립보드에 복사했습니다.'
        )
      } catch {
        alert(
          '클립보드 복사를 지원하지 않는 브라우저입니다.'
        )
      }
    }

  return (
    <main
      style={{
        maxWidth: '720px',
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding:
          '32px 20px 60px',
      }}
    >
      <Header />

      <br />

      <h1
        style={{
          fontSize: '28px',
          marginBottom: '24px',
        }}
      >
        스크린샷
      </h1>

      {!isSelecting && (
        <button
          onClick={startScreenshot}
          style={{
            padding:
              '11px 16px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          📸 화면 캡처
        </button>
      )}

      {/* 비디오는 항상 DOM에 존재 */}
      <div
        style={{
          display: isSelecting
            ? 'block'
            : 'none',
          marginTop: '20px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: '#666',
            marginBottom: '10px',
          }}
        >
          마우스로 캡처할 영역을 드래그하세요.
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            background: '#111',
            overflow: 'hidden',
            borderRadius: '10px',
            cursor: 'crosshair',
            userSelect: 'none',
          }}
          onMouseDown={
            handleMouseDown
          }
          onMouseMove={
            handleMouseMove
          }
          onMouseUp={
            handleMouseUp
          }
        >
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              pointerEvents:
                'none',
            }}
          />

          {selection && (
            <div
              style={{
                position: 'absolute',
                left: selection.x,
                top: selection.y,
                width:
                  selection.width,
                height:
                  selection.height,
                border:
                  '2px solid white',
                boxSizing:
                  'border-box',
                background:
                  'rgba(255,255,255,0.08)',
                pointerEvents:
                  'none',
              }}
            />
          )}
        </div>

        <button
          onClick={
            stopScreenshot
          }
          style={{
            marginTop: '12px',
            padding:
              '9px 14px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          ✕ 취소
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: 'none',
        }}
      />

      {image && (
        <div
          style={{
            marginTop: '28px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            캡처 결과
          </div>

          <img
            src={image}
            alt="스크린샷 결과"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              border:
                '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '14px',
            }}
          />

          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems:
                'center',
              flexWrap: 'wrap',
            }}
          >
            <select
              value={format}
              onChange={e =>
                setFormat(
                  e.target
                    .value as ImageFormat
                )
              }
              style={{
                padding:
                  '10px 12px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                background:
                  'white',
                fontSize: '15px',
              }}
            >
              <option value="png">
                PNG
              </option>

              <option value="jpeg">
                JPG
              </option>

              <option value="webp">
                WebP
              </option>
            </select>

            <button
              onClick={
                downloadImage
              }
              style={{
                padding:
                  '10px 14px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                background:
                  'white',
                cursor: 'pointer',
              }}
            >
              💾 저장
            </button>

            <button
              onClick={
                copyToClipboard
              }
              style={{
                padding:
                  '10px 14px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                background:
                  'white',
                cursor: 'pointer',
              }}
            >
              📋 복사
            </button>
          </div>
        </div>
      )}
    </main>
  )
}