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

  const [filter, setFilter] = useState('none')

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
  'environment'
  )

  const filters = [
    { name: '원본', value: 'none' },

    { name: '밝게', value: 'brightness(115%)' },
    { name: '어둡게', value: 'brightness(85%)' },
    { name: '선명', value: 'contrast(120%) saturate(115%)' },
    { name: '부드럽게', value: 'contrast(90%) brightness(105%)' },

    { name: '흑백', value: 'grayscale(100%)' },
    { name: '흑백 강하게', value: 'grayscale(100%) contrast(125%)' },

    { name: '세피아', value: 'sepia(100%)' },
    { name: '빈티지', value: 'sepia(35%) contrast(95%) saturate(85%)' },
    { name: '레트로', value: 'sepia(25%) contrast(110%) saturate(80%)' },

    { name: '따뜻하게', value: 'sepia(15%) saturate(125%) brightness(105%)' },
    { name: '차갑게', value: 'hue-rotate(15deg) saturate(90%)' },

    { name: '강한 색감', value: 'saturate(150%) contrast(115%)' },
    { name: '저채도', value: 'saturate(65%) contrast(105%)' },

    { name: '드라마', value: 'contrast(135%) saturate(110%)' },
    { name: '페이드', value: 'contrast(85%) brightness(110%) saturate(80%)' },

    { name: '필름', value: 'contrast(110%) sepia(12%) saturate(90%)' },
    { name: '골든', value: 'sepia(25%) saturate(135%) brightness(105%)' },

    { name: '차분', value: 'saturate(75%) brightness(105%) contrast(95%)' },
    { name: '야간', value: 'brightness(75%) contrast(115%) saturate(90%)' },

    { name: '네거티브', value: 'invert(100%)' },
  ]

  async function startCamera() {

    try {

      setError('')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode
        },
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

    ctx.filter = filter

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

  async function switchCamera() {

    // 기존 카메라 끄기
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop())

      streamRef.current = null
    }

    // 카메라 방향 변경
    const newMode =
      facingMode === 'user'
        ? 'environment'
        : 'user'

    setFacingMode(newMode)

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newMode
        },
        audio: false
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

    } catch (error) {

      console.error(error)

      setError(
        '카메라를 전환할 수 없습니다.'
      )
    }
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
            style={{
              filter: filter
            }}
          />

        </div>


          <canvas
      ref={canvasRef}
      style={{ display: 'none' }}
    />

    <div className="filter-buttons">

      {filters.map((item) => (

        <button
          key={item.value}
          type="button"
          className={`filter-button ${
            filter === item.value ? 'active' : ''
          }`}
          onClick={() => setFilter(item.value)}
        >
          {item.name}
        </button>

      ))}

    </div>
    

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
          <>

            <div className="filter-buttons">

            {filters.map((item) => (

              <button
                key={item.value}
                type="button"
                className={`filter-button ${
                  filter === item.value ? 'active' : ''
                }`}
                onClick={() => setFilter(item.value)}
              >
                {item.name}
              </button>

            ))}

          </div>

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
                onClick={switchCamera}
              >
                🔄 카메라 전환
              </button>

              <button
                type="button"
                className="action-button"
                onClick={stopCamera}
              >
                카메라 끄기
              </button>

            </div>
          </>
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