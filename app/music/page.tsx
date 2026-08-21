'use client'

import { useEffect, useRef, useState } from 'react'
import { parseBlob } from 'music-metadata-browser'
import AudioVisualizer from '../hls/AudioVisualizer'
import Header from '../../components/Header'

type TrackInfo = {
  title?: string
  artist?: string
  album?: string
  picture?: string
  lyrics?: string
}

export default function MusicPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [playlist, setPlaylist] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [trackInfo, setTrackInfo] = useState<TrackInfo>({})
  const [loadingInfo, setLoadingInfo] = useState(false)

  // =========================
  // M3U 읽기
  // =========================
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await fetch('/music/summer/test.m3u')

        if (!response.ok) {
          throw new Error('M3U 파일을 읽을 수 없습니다.')
        }

        const text = await response.text()

        const files = text
          .split(/\r?\n/)
          .map(line => line.replace(/^\uFEFF/, '').trim())
          .filter(line => line && !line.startsWith('#'))

        setPlaylist(files)
      } catch (error) {
        console.error('M3U 로드 오류:', error)
      }
    }

    loadPlaylist()
  }, [])

  // =========================
  // MP3 메타데이터 읽기
  // =========================
  useEffect(() => {
    if (playlist.length === 0) return

    const loadMetadata = async () => {
      setLoadingInfo(true)
      setTrackInfo({})

      try {
        const file = playlist[currentIndex]

        const url = `/music/summer/${encodeURIComponent(file)}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('MP3 파일을 읽을 수 없습니다.')
        }

        const blob = await response.blob()

        const metadata = await parseBlob(blob)

        const common = metadata.common

        // =========================
        // 깨진 문자열 검사
        // =========================
        const isValidText = (value?: string) => {
          if (!value) return false

          const text = value.trim()

          if (!text) return false

          // 대체 문자(�)가 들어 있으면
          // 인코딩이 깨진 것으로 판단
          if (text.includes('�')) return false

          // 제어문자가 많이 들어간 경우
          const controlCharacters = text.match(
            /[\x00-\x08\x0B\x0C\x0E-\x1F]/g
          )

          if (
            controlCharacters &&
            controlCharacters.length > 0
          ) {
            return false
          }

          return true
        }

        // =========================
        // 앨범아트
        // =========================
        let pictureUrl: string | undefined

        if (
          common.picture &&
          common.picture.length > 0
        ) {
          const picture = common.picture[0]

          const pictureBlob = new Blob(
            [picture.data],
            {
              type: picture.format
            }
          )

          pictureUrl =
            URL.createObjectURL(pictureBlob)
        }

        // =========================
        // 가사
        // =========================
        let lyricsText: string | undefined

        if (
          common.lyrics &&
          common.lyrics.length > 0
        ) {
          const text = common.lyrics
            .map(item => {
              if (typeof item === 'string') {
                return item
              }

              return item.text || ''
            })
            .filter(Boolean)
            .join('\n\n')

          if (isValidText(text)) {
            lyricsText = text
          }
        }

        // =========================
        // 메타데이터
        // =========================
        setTrackInfo({
          title: isValidText(common.title)
            ? common.title
            : undefined,

          artist: isValidText(common.artist)
            ? common.artist
            : undefined,

          album: isValidText(common.album)
            ? common.album
            : undefined,

          picture: pictureUrl,

          lyrics: lyricsText
        })

      } catch (error) {
        console.error(
          'MP3 메타데이터 읽기 오류:',
          error
        )

        setTrackInfo({})
      } finally {
        setLoadingInfo(false)
      }
    }

    loadMetadata()
  }, [playlist, currentIndex])

  // =========================
  // 현재 곡 재생
  // =========================
  useEffect(() => {
    const audio = audioRef.current

    if (!audio || playlist.length === 0) return

    const file = playlist[currentIndex]

    audio.src = `/music/summer/${encodeURIComponent(file)}`
    audio.load()
  }, [playlist, currentIndex])

  // =========================
  // 곡 선택
  // =========================
  const playSong = (index: number) => {
    setCurrentIndex(index)

    setTimeout(() => {
      audioRef.current?.play()
    }, 100)
  }

  // =========================
  // 다음 곡
  // =========================
  const nextSong = () => {
    if (playlist.length === 0) return

    setCurrentIndex(prev =>
      prev + 1 < playlist.length ? prev + 1 : 0
    )
  }

  // =========================
  // 이전 곡
  // =========================
  const previousSong = () => {
    if (playlist.length === 0) return

    setCurrentIndex(prev =>
      prev - 1 >= 0 ? prev - 1 : playlist.length - 1
    )
  }

  return (
    <main className="container">

      <Header />

      <div style={{ padding: '30px' }}>

        <h1>🎶 음악 플레이어</h1>

        {/* =========================
            앨범아트 / 음악 정보
           ========================= */}

        {(trackInfo.picture ||
          trackInfo.title ||
          trackInfo.artist ||
          trackInfo.album) && (

          <div
            style={{
              display: 'flex',
              gap: '25px',
              alignItems: 'center',
              margin: '25px 0',
              padding: '20px',
              borderRadius: '12px',
              background: '#f5f5f5'
            }}
          >

            {/* 앨범 이미지 */}
            {trackInfo.picture && (
              <img
                src={trackInfo.picture}
                alt={trackInfo.album || trackInfo.title || '앨범 이미지'}
                style={{
                  width: '220px',
                  height: '220px',
                  objectFit: 'cover',
                  borderRadius: '10px'
                }}
              />
            )}

            {/* 음악 정보 */}
            {(trackInfo.title ||
              trackInfo.artist ||
              trackInfo.album) && (

              <div>

                {trackInfo.title && (
                  <h2 style={{ margin: '0 0 10px 0' }}>
                    {trackInfo.title}
                  </h2>
                )}

                {trackInfo.artist && (
                  <div style={{ marginBottom: '6px' }}>
                    👤 {trackInfo.artist}
                  </div>
                )}

                {trackInfo.album && (
                  <div>
                    💿 {trackInfo.album}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* 메타데이터가 없는 경우 */}
        {loadingInfo && (
          <div style={{ margin: '15px 0' }}>
            음악 정보를 읽는 중...
          </div>
        )}

        {/* =========================
            플레이어
           ========================= */}

        <audio
          ref={audioRef}
          controls
          style={{ width: '100%' }}
          onEnded={nextSong}
        />

        <AudioVisualizer
          audioRef={audioRef}
        />

        {/* =========================
            버튼
           ========================= */}

        <div style={{ marginTop: '20px' }}>

          <button
            onClick={previousSong}
            style={{ marginRight: '10px' }}
          >
            ⏮ 이전
          </button>

          <button
            onClick={() => audioRef.current?.play()}
            style={{ marginRight: '10px' }}
          >
            ▶ 재생
          </button>

          <button
            onClick={() => audioRef.current?.pause()}
            style={{ marginRight: '10px' }}
          >
            ⏸ 일시정지
          </button>

          <button onClick={nextSong}>
            다음 ⏭
          </button>

        </div>

        {/* =========================
            현재 곡
           ========================= */}

        {playlist.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            현재 곡:{' '}
            <strong>
              {trackInfo.title || playlist[currentIndex]}
            </strong>
          </div>
        )}

        {/* =========================
            가사
           ========================= */}

        {trackInfo.lyrics && (
          <div
            style={{
              marginTop: '30px',
              padding: '25px',
              borderRadius: '12px',
              background: '#fafafa',
              border: '1px solid #ddd',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8'
            }}
          >
            <h2>📝 가사</h2>

            <div>
              {trackInfo.lyrics}
            </div>
          </div>
        )}

        {/* =========================
            재생목록
           ========================= */}

        <div style={{ marginTop: '30px' }}>

          <h3>재생목록</h3>

          {playlist.map((file, index) => (
            <div
              key={index}
              onClick={() => playSong(index)}
              style={{
                padding: '10px',
                marginBottom: '5px',
                cursor: 'pointer',
                background:
                  index === currentIndex
                    ? '#eee'
                    : 'transparent',
                borderRadius: '5px'
              }}
            >
              {index + 1}. {file}
            </div>
          ))}

        </div>

      </div>

    </main>
  )
}