'use client'

import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import AudioVisualizer from './AudioVisualizer'
import Header from '../../components/Header'

export default function HlsPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    const url = '/music/summer/playlist.m3u8'

    if (Hls.isSupported()) {
      const hls = new Hls()

      hls.loadSource(url)
      hls.attachMedia(audio)

      return () => {
        hls.destroy()
      }
    }

    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = url
    }
  }, [])

  return (
    <main className="container">

      <Header />

      <div style={{ padding: '30px' }}>

        <h1>📡 HLS 스트리밍 테스트</h1>

        <audio
          ref={audioRef}
          controls
          style={{ width: '100%' }}
        />

        <AudioVisualizer
          audioRef={audioRef}
        />

      </div>

    </main>
  )
}