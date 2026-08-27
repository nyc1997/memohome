'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import DigitalDigit from '../../../components/DigitalDigit'

const MIN_WIDTH = 360
const MIN_HEIGHT = 220

function Colon() {
  return (
    <div className="segment-colon">
      <span />
      <span />
    </div>
  )
}

export default function TimerWindow() {
  const searchParams = useSearchParams()

  const type = searchParams.get('type')
  const id = searchParams.get('id')

  const isAlarm = type === 'alarm'

  // 기본 설정 시간: 25분
  const [setHours, setSetHours] = useState(0)
  const [setMinutes, setSetMinutes] = useState(25)
  const [setSeconds, setSetSeconds] = useState(0)

  const [remainingSeconds, setRemainingSeconds] =
    useState(25 * 60)

  const [running, setRunning] =
    useState(false)

  const [inverted, setInverted] =
    useState(false)

  const [alarmOn, setAlarmOn] =
    useState(false)

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const alarmIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null)

  /*
   * 팝업 최소 크기
   */
  useEffect(() => {
    const enforceMinimumSize = () => {
      const width = window.outerWidth
      const height = window.outerHeight

      if (
        width < MIN_WIDTH ||
        height < MIN_HEIGHT
      ) {
        window.resizeTo(
          Math.max(width, MIN_WIDTH),
          Math.max(height, MIN_HEIGHT)
        )
      }
    }

    enforceMinimumSize()

    window.addEventListener(
      'resize',
      enforceMinimumSize
    )

    return () => {
      window.removeEventListener(
        'resize',
        enforceMinimumSize
      )
    }
  }, [])

  /*
   * AudioContext 준비
   *
   * 브라우저의 자동재생 제한 때문에
   * 사용자가 시작 버튼을 누른 순간 준비한다.
   */
  const prepareAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext
          }
        ).webkitAudioContext

      if (AudioContextClass) {
        audioContextRef.current =
          new AudioContextClass()
      }
    }

    if (
      audioContextRef.current?.state ===
      'suspended'
    ) {
      audioContextRef.current.resume()
    }
  }

  /*
   * 알람음 1회 재생
   */
  const playBeep = () => {
    const audio =
      audioContextRef.current

    if (!audio) return

    const oscillator =
      audio.createOscillator()

    const gain =
      audio.createGain()

    oscillator.type = 'square'
    oscillator.frequency.value = 880

    gain.gain.setValueAtTime(
      0.0001,
      audio.currentTime
    )

    gain.gain.exponentialRampToValueAtTime(
      0.25,
      audio.currentTime + 0.02
    )

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + 0.35
    )

    oscillator.connect(gain)
    gain.connect(audio.destination)

    oscillator.start()

    oscillator.stop(
      audio.currentTime + 0.35
    )
  }

  /*
   * 종료 알람 시작
   */
  const startAlarm = () => {
    setAlarmOn(true)

    playBeep()

    if (alarmIntervalRef.current) {
      clearInterval(
        alarmIntervalRef.current
      )
    }

    alarmIntervalRef.current =
      setInterval(() => {
        playBeep()
      }, 1000)
  }

  /*
   * 종료 알람 끄기
   */
  const stopAlarm = () => {
    setAlarmOn(false)

    if (alarmIntervalRef.current) {
      clearInterval(
        alarmIntervalRef.current
      )

      alarmIntervalRef.current = null
    }
  }

  /*
   * 컴포넌트 종료 시 알람 정리
   */
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(
          alarmIntervalRef.current
        )
      }

      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  /*
   * 타이머
   */
  useEffect(() => {
    if (!running) return

    const endTime =
      Date.now() +
      remainingSeconds * 1000

    const interval =
      setInterval(() => {
        const left = Math.max(
          0,
          Math.ceil(
            (endTime - Date.now()) /
              1000
          )
        )

        setRemainingSeconds(left)

        if (left <= 0) {
          setRunning(false)
          clearInterval(interval)

          startAlarm()
        }
      }, 200)

    return () =>
      clearInterval(interval)

  }, [running])

  /*
   * 시간 설정
   */
  const applyTime = () => {
    const hours =
      Math.max(
        0,
        Math.min(
          23,
          Number(setHours) || 0
        )
      )

    const minutes =
      Math.max(
        0,
        Math.min(
          59,
          Number(setMinutes) || 0
        )
      )

    const seconds =
      Math.max(
        0,
        Math.min(
          59,
          Number(setSeconds) || 0
        )
      )

    const totalSeconds =
      hours * 3600 +
      minutes * 60 +
      seconds

    if (totalSeconds <= 0) {
      return
    }

    stopAlarm()

    setRunning(false)
    setRemainingSeconds(
      totalSeconds
    )

    setSetHours(hours)
    setSetMinutes(minutes)
    setSetSeconds(seconds)
  }

  /*
   * 시작 / 일시정지
   */
  const toggleRunning = () => {
    prepareAudio()

    if (alarmOn) {
      stopAlarm()
    }

    if (
      !running &&
      remainingSeconds > 0
    ) {
      setRunning(true)
    } else {
      setRunning(false)
    }
  }

  /*
   * 초기화
   */
  const reset = () => {
    stopAlarm()
    setRunning(false)

    const totalSeconds =
      setHours * 3600 +
      setMinutes * 60 +
      setSeconds

    setRemainingSeconds(
      totalSeconds
    )
  }

  /*
   * 시:분:초 계산
   */
  const hours = Math.floor(
    remainingSeconds / 3600
  )

  const minutes = Math.floor(
    (remainingSeconds % 3600) / 60
  )

  const seconds =
    remainingSeconds % 60

  /*
   * 표시용 시간
   *
   * 예:
   * 00:25:00
   */
  const timeText =
    String(hours).padStart(2, '0') +
    ':' +
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0')

  return (
    <main
      className={
        inverted
          ? 'timer-window inverted'
          : 'timer-window'
      }
    >

      <h1>
        {isAlarm
          ? '🔔 알람'
          : '⏱️ 타이머'}{' '}
        {id}
      </h1>


      {/* =========================
          Digital Display
          ========================= */}

      <div className="digital-display">

        {timeText
          .split('')
          .map((char, index) => {

            if (char === ':') {
              return (
                <Colon
                  key={index}
                />
              )
            }

            return (
              <DigitalDigit
                key={index}
                value={char}
                activeColor={
                  inverted
                    ? '#000'
                    : '#fff'
                }
                offColor={
                  inverted
                    ? '#e5e5e5'
                    : '#151515'
                }
              />
            )
          })}

      </div>


      {/* =========================
          종료 알람
          ========================= */}

      {alarmOn && (
        <div className="timer-alarm">

          <div className="timer-alarm-message">
            🔔 시간 종료
          </div>

          <button
            className="action-button alarm-stop-button"
            onClick={stopAlarm}
          >
            알람 끄기
          </button>

        </div>
      )}


      {/* =========================
          Controls
          ========================= */}

      {!isAlarm && !alarmOn && (
        <>
          <div className="timer-controls">

            <button
              className="action-button"
              onClick={
                toggleRunning
              }
            >
              {running
                ? '일시정지'
                : '시작'}
            </button>


            <button
              className="action-button"
              onClick={reset}
            >
              초기화
            </button>


            <button
              className="action-button"
              onClick={() =>
                setInverted(
                  (prev) => !prev
                )
              }
            >
              {inverted
                ? '백흑'
                : '흑백'}
            </button>

          </div>


          {/* =========================
              시간 설정
              ========================= */}

          <div className="timer-settings">

            <span className="timer-settings-title">
              시간 설정
            </span>

            <div className="timer-inputs">

              <input
                type="number"
                min="0"
                max="99"
                value={setHours}
                onChange={(e) =>
                  setSetHours(
                    Math.max(
                      0,
                      Math.min(
                        99,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  )
                }
              />

              <span>:</span>

              <input
                type="number"
                min="0"
                max="59"
                value={setMinutes}
                onChange={(e) =>
                  setSetMinutes(
                    Math.max(
                      0,
                      Math.min(
                        59,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  )
                }
              />

              <span>:</span>

              <input
                type="number"
                min="0"
                max="59"
                value={setSeconds}
                onChange={(e) =>
                  setSetSeconds(
                    Math.max(
                      0,
                      Math.min(
                        59,
                        Number(
                          e.target.value
                        ) || 0
                      )
                    )
                  )
                }
                
              />

              <button
                className="action-button"
                onClick={applyTime}
              >
                설정
              </button>

            </div>

          </div>
        </>
      )}

    </main>
  )
}