'use client'

import { useRef, useState } from 'react'
import Header from '../../components/Header'

export default function CapturePage() {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const [captured, setCaptured] =
    useState<string | null>(null)

  const [isCapturing, setIsCapturing] =
    useState(false)

  const startCapture = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: 30,
          },
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

      setIsCapturing(true)

      const track =
        stream.getVideoTracks()[0]

      track.addEventListener(
        'ended',
        () => {
          stopCapture()
        }
      )
    } catch {
      // 사용자가 취소한 경우
    }
  }

  const stopCapture = () => {
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

    setIsCapturing(false)
  }

  const takeScreenshot = () => {
    const video =
      videoRef.current

    if (!video) return

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      alert(
        '화면이 아직 준비되지 않았습니다.'
      )
      return
    }

    const canvas =
      document.createElement('canvas')

    canvas.width =
      video.videoWidth

    canvas.height =
      video.videoHeight

    const context =
      canvas.getContext('2d')

    if (!context) return

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const image =
      canvas.toDataURL(
        'image/png'
      )

    setCaptured(image)
  }

  const downloadImage = () => {
    if (!captured) return

    const link =
      document.createElement('a')

    link.href = captured

    link.download =
      `screenshot-${Date.now()}.png`

    link.click()
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
        화면 캡처
      </h1>

      {/* 화면 선택 / 캡처 버튼 */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        {!isCapturing ? (
          <button
            onClick={startCapture}
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
            🖥️ 화면 선택
          </button>
        ) : (
          <>
            <button
              onClick={
                takeScreenshot
              }
              style={{
                padding:
                  '11px 16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                background:
                  'white',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              📸 캡처
            </button>

            <button
              onClick={
                stopCapture
              }
              style={{
                padding:
                  '11px 16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                background:
                  'white',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              ✕ 종료
            </button>
          </>
        )}
      </div>

      {/* 비디오 */}
      <div
        style={{
          display: isCapturing
            ? 'block'
            : 'none',
          width: '100%',
          background: '#111',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
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
          }}
        />
      </div>

      {/* 캡처 결과 */}
      {captured && (
        <div>
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
            src={captured}
            alt="캡처된 화면"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              border:
                '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '12px',
            }}
          />

          <button
            onClick={
              downloadImage
            }
            style={{
              padding:
                '11px 16px',
              border:
                '1px solid #ddd',
              borderRadius: '8px',
              background:
                'white',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            💾 PNG 저장
          </button>
        </div>
      )}
    </main>
  )
}