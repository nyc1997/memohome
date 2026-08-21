'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'

export default function CameraPage() {

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [started, setStarted] = useState(false)
  const [photo, setPhoto] = useState('')
  const [error, setError] = useState('')


  async function startCamera() {

    try {

      setError('')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setStarted(true)

    } catch (error) {

      console.error(error)

      setError(
        '카메라를 사용할 수 없습니다. 카메라 권한을 확인해주세요.'
      )
    }
  }


  function takePhoto() {

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const image = canvas.toDataURL('image/jpeg')

    setPhoto(image)
  }


  function stopCamera() {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setStarted(false)
  }


  useEffect(() => {

    return () => {
      stopCamera()
    }

  }, [])


  return (
    <main className="container">

      <Header />

      <section className="camera-page">

        <h1>📷 카메라 테스트</h1>

        <div className="camera-view">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />

        </div>


        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />


        {!started && (

          <button
            type="button"
            className="action-button"
            onClick={startCamera}
          >
            카메라 시작
          </button>

        )}


        {started && (

          <div className="camera-actions">

            <button
              type="button"
              className="action-button"
              onClick={takePhoto}
            >
              📸 촬영
            </button>

            <button
              type="button"
              className="action-button"
              onClick={stopCamera}
            >
              카메라 끄기
            </button>

          </div>

        )}


        {photo && (

          <div className="captured-photo">

            <h2>촬영한 사진</h2>

            <img
              src={photo}
              alt="촬영한 사진"
            />

          </div>

        )}


        {error && (
          <p className="camera-error">
            {error}
          </p>
        )}

      </section>

    </main>
  )
}