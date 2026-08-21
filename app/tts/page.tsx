'use client'

import { useEffect, useState } from 'react'
import Header from '../../components/Header'

export default function TTSPage() {
  const [text, setText] =
    useState(
      '안녕하세요. 브라우저에서 텍스트를 음성으로 읽어봅니다.'
    )

  const [voices, setVoices] =
    useState<SpeechSynthesisVoice[]>([])

  const [voiceIndex, setVoiceIndex] =
    useState(0)

  const [rate, setRate] =
    useState(1)

  const [pitch, setPitch] =
    useState(1)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices =
        window.speechSynthesis.getVoices()

      setVoices(availableVoices)
    }

    loadVoices()

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      loadVoices
    )

    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        loadVoices
      )
    }
  }, [])

  const speak = () => {
    if (!text.trim()) return

    window.speechSynthesis.cancel()

    const utterance =
      new SpeechSynthesisUtterance(text)

    const selectedVoice =
      voices[voiceIndex]

    if (selectedVoice) {
      utterance.voice =
        selectedVoice

      utterance.lang =
        selectedVoice.lang
    } else {
      utterance.lang =
        'ko-KR'
    }

    utterance.rate = rate
    utterance.pitch = pitch

    window.speechSynthesis.speak(
      utterance
    )
  }

  const stop = () => {
    window.speechSynthesis.cancel()
  }

  return (
    <main
      style={{
        padding: '30px',
      }}
    >
      <Header />

      <h1>
        🔊 텍스트 → 음성 테스트
      </h1>

      <textarea
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        rows={6}
        style={{
          width: '100%',
          maxWidth: '700px',
          padding: '15px',
          fontSize: '16px',
        }}
      />

      <div
        style={{
          marginTop: '20px',
          maxWidth: '700px',
        }}
      >

        {/* 음성 */}
        <div
          style={{
            marginBottom: '20px',
          }}
        >
          <label>
            목소리
          </label>

          <select
            value={voiceIndex}
            onChange={(e) =>
              setVoiceIndex(Number(e.target.value))
            }
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '8px',
            }}
          >
            {voices
              .filter((voice) =>
                voice.lang.toLowerCase().startsWith('ko')
              )
              .map((voice) => {
                const index =
                  voices.indexOf(voice)

                return (
                  <option
                    key={`${voice.name}-${index}`}
                    value={index}
                  >
                    {voice.name}
                    {' — '}
                    {voice.lang}
                    {voice.localService
                      ? ' — 로컬'
                      : ' — 네트워크'}
                  </option>
                )
              })}
          </select>
        </div>


        {/* 속도 */}
        <div
          style={{
            marginBottom: '20px',
          }}
        >
          <label>
            속도: {rate.toFixed(1)}
          </label>

          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) =>
              setRate(
                Number(e.target.value)
              )
            }
            style={{
              width: '100%',
            }}
          />
        </div>


        {/* 음높이 */}
        <div
          style={{
            marginBottom: '20px',
          }}
        >
          <label>
            음높이: {pitch.toFixed(1)}
          </label>

          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) =>
              setPitch(
                Number(e.target.value)
              )
            }
            style={{
              width: '100%',
            }}
          />
        </div>


        {/* 버튼 */}
        <button
          onClick={speak}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
          }}
        >
          🔊 읽어주기
        </button>

        <button
          onClick={stop}
          style={{
            padding: '10px 20px',
          }}
        >
          ⏹ 중지
        </button>

      </div>
    </main>
  )
}