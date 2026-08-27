'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'

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

function Dot() {
  return (
    <div className="segment-dot">
      <span />
    </div>
  )
}

/*
 * 밀리초를 00:00:00.00 형태로 변환
 */
function formatTime(totalMilliseconds: number) {
  const hours = Math.floor(
    totalMilliseconds / 3600000
  )

  const minutes = Math.floor(
    (totalMilliseconds % 3600000) / 60000
  )

  const seconds = Math.floor(
    (totalMilliseconds % 60000) / 1000
  )

  const centiseconds = Math.floor(
    (totalMilliseconds % 1000) / 10
  )

  return (
    String(hours).padStart(2, '0') +
    ':' +
    String(minutes).padStart(2, '0') +
    ':' +
    String(seconds).padStart(2, '0') +
    '.' +
    String(centiseconds).padStart(2, '0')
  )
}

function TimerWindowContent() {
  const searchParams = useSearchParams()

  const type = searchParams.get('type')
  const id = searchParams.get('id')

  const isAlarm = type === 'alarm'

  /*
   * =====================================================
   * 타이머 상태
   * =====================================================
   */

  const [setHours, setSetHours] =
    useState(0)

  const [setMinutes, setSetMinutes] =
    useState(25)

  const [setSeconds, setSetSeconds] =
    useState(0)

  const [remainingSeconds, setRemainingSeconds] =
    useState(25 * 60)

  const [running, setRunning] =
    useState(false)

  const [alarmOn, setAlarmOn] =
    useState(false)

  /*
   * =====================================================
   * 공통
   * =====================================================
   */

  const [inverted, setInverted] =
    useState(false)

  /*
   * =====================================================
   * 스톱워치 상태
   * =====================================================
   */

  // 실제 표시 시간도 밀리초 단위
  const [stopwatchMilliseconds, setStopwatchMilliseconds] =
    useState(0)

  const [stopwatchRunning, setStopwatchRunning] =
    useState(false)

  const [stopwatchStarted, setStopwatchStarted] =
    useState(false)

  /*
   * 구간 기록
   *
   * 각각의 기록을 밀리초 단위로 저장
   */
  const [laps, setLaps] =
    useState<number[]>([])

  /*
   * 실제 누적 경과시간
   *
   * 일시정지 / 계속을 해도
   * 이전 시간이 유지된다.
   */
  const stopwatchElapsedRef =
    useRef(0)

  /*
   * 현재 실행 구간의 시작 시각
   */
  const stopwatchStartRef =
    useRef<number | null>(null)

  /*
   * 구간 기록 목록
   */
  const lapsRef =
    useRef<HTMLDivElement | null>(null)

  /*
   * =====================================================
   * 팝업 최소 크기
   * =====================================================
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
   * =====================================================
   * 타이머 AudioContext
   * =====================================================
   */

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const alarmIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null)

  /*
   * AudioContext 준비
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
   * =====================================================
   * 타이머 카운트다운
   * =====================================================
   */

  useEffect(() => {
    if (isAlarm) return
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

  }, [running, isAlarm])

  /*
   * =====================================================
   * 타이머 시간 설정
   * =====================================================
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
   * =====================================================
   * 타이머 시작 / 일시정지
   * =====================================================
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
   * =====================================================
   * 타이머 초기화
   * =====================================================
   */

  const resetTimer = () => {
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
   * =====================================================
   * 스톱워치 실행
   * =====================================================
   */

  useEffect(() => {
    if (!isAlarm) return
    if (!stopwatchRunning) return

    /*
     * 현재 실행 구간 시작
     */
    stopwatchStartRef.current =
      Date.now()

    const interval =
      setInterval(() => {
        if (
          stopwatchStartRef.current ===
          null
        ) {
          return
        }

        /*
         * 누적된 이전 시간 +
         * 현재 실행 구간 시간
         */
        const elapsed =
          stopwatchElapsedRef.current +
          (
            Date.now() -
            stopwatchStartRef.current
          )

        /*
         * 밀리초 그대로 저장
         */
        setStopwatchMilliseconds(
          elapsed
        )
      }, 50)

    return () => {
      clearInterval(interval)
    }

  }, [
    stopwatchRunning,
    isAlarm
  ])

  /*
   * =====================================================
   * 스톱워치 시작 / 계속
   * =====================================================
   */

  const startStopwatch = () => {
    if (
      stopwatchStartRef.current ===
      null
    ) {
      stopwatchStartRef.current =
        Date.now()
    }

    setStopwatchStarted(true)
    setStopwatchRunning(true)
  }

  /*
   * =====================================================
   * 스톱워치 중지
   * =====================================================
   */

  const stopStopwatch = () => {
    if (
      stopwatchStartRef.current !==
      null
    ) {
      stopwatchElapsedRef.current +=
        Date.now() -
        stopwatchStartRef.current

      stopwatchStartRef.current = null
    }

    /*
     * 중지한 순간의 정확한 시간 표시
     */
    setStopwatchMilliseconds(
      stopwatchElapsedRef.current
    )

    setStopwatchRunning(false)
  }

  /*
   * =====================================================
   * 구간 기록
   * =====================================================
   */

  const recordLap = () => {
    if (!stopwatchRunning) {
      return
    }

    let currentElapsed =
      stopwatchElapsedRef.current

    if (
      stopwatchStartRef.current !==
      null
    ) {
      currentElapsed +=
        Date.now() -
        stopwatchStartRef.current
    }

    /*
     * 버튼을 누른 순간의
     * 밀리초 단위 시간을 저장
     */
    setLaps((prev) => [
      ...prev,
      currentElapsed
    ])
  }

  /*
   * =====================================================
   * 스톱워치 초기화
   * =====================================================
   */

  const resetStopwatch = () => {
    setStopwatchRunning(false)
    setStopwatchStarted(false)

    setStopwatchMilliseconds(0)

    setLaps([])

    stopwatchElapsedRef.current = 0
    stopwatchStartRef.current = null
  }

  /*
   * =====================================================
   * 최신 구간 기록으로 자동 이동
   * =====================================================
   */

  useEffect(() => {
    if (!isAlarm) return

    const element =
      lapsRef.current

    if (!element) return

    element.scrollTop =
      element.scrollHeight
  }, [laps, isAlarm])

  /*
   * =====================================================
   * 타이머 표시
   * =====================================================
   */

  const timerHours = Math.floor(
    remainingSeconds / 3600
  )

  const timerMinutes = Math.floor(
    (remainingSeconds % 3600) / 60
  )

  const timerSeconds =
    remainingSeconds % 60

  const timerText =
    String(timerHours).padStart(2, '0') +
    ':' +
    String(timerMinutes).padStart(2, '0') +
    ':' +
    String(timerSeconds).padStart(2, '0')

  /*
   * =====================================================
   * 스톱워치 표시
   * =====================================================
   */

  const stopwatchText =
    formatTime(
      stopwatchMilliseconds
    )

  /*
   * =====================================================
   * Digital Display
   * =====================================================
   */

  const renderDigitalTime = (
    timeText: string
  ) => {
    return timeText
      .split('')
      .map((char, index) => {

        /*
         * 콜론
         */
        if (char === ':') {
          return (
            <Colon
              key={index}
            />
          )
        }

        /*
         * 소수점
         */
        if (char === '.') {
          return (
            <Dot
              key={index}
            />
          )
        }

        /*
         * 숫자
         */
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
                ? '#f5f5f5'
                : '#151515'
            }
          />
        )
      })
  }

  /*
   * =====================================================
   * 스톱워치 버튼 상태
   * =====================================================
   */

  const stopwatchInitial =
    !stopwatchStarted &&
    !stopwatchRunning

  const stopwatchRunningNow =
    stopwatchRunning

  const stopwatchStopped =
    stopwatchStarted &&
    !stopwatchRunning

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

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
          ? '⏱️ 스톱워치'
          : '⏱️ 타이머'}{' '}
        {id}
      </h1>


      {/* =================================================
          STOPWATCH
          ================================================= */}

      {isAlarm ? (

        <>
          {/* 메인 시간 */}

          <div className="digital-display stopwatch-main-display">
            {renderDigitalTime(stopwatchText)}
          </div>


          {/* 기록 + 버튼 영역 */}

          <div className="stopwatch-content">

            {/* 구간 기록 */}

            <div
              ref={lapsRef}
              className="stopwatch-laps"
            >
              {laps.map((lap, index) => (
                <div
                  className="stopwatch-lap"
                  key={index}
                >
                  <span>
                    구간 {index + 1}
                  </span>

                  <span className="stopwatch-lap-time">
                    {formatTime(lap)}
                  </span>
                </div>
              ))}
            </div>


            {/* 오른쪽 버튼 */}

            <div className="stopwatch-side-controls">

              {stopwatchInitial && (
                <>
                  <button
                    className="action-button"
                    disabled
                  >
                    구간기록
                  </button>

                  <button
                    className="action-button"
                    onClick={startStopwatch}
                  >
                    시작
                  </button>
                </>
              )}

              {stopwatchRunningNow && (
                <>
                  <button
                    className="action-button"
                    onClick={recordLap}
                  >
                    구간기록
                  </button>

                  <button
                    className="action-button"
                    onClick={stopStopwatch}
                  >
                    중지
                  </button>
                </>
              )}

              {stopwatchStopped && (
                <>
                  <button
                    className="action-button"
                    onClick={resetStopwatch}
                  >
                    초기화
                  </button>

                  <button
                    className="action-button"
                    onClick={startStopwatch}
                  >
                    계속
                  </button>
                </>
              )}

              {/* 흑백 */}

              <button
                className="action-button stopwatch-invert-button"
                onClick={() =>
                  setInverted((prev) => !prev)
                }
              >
                {inverted ? '백흑' : '흑백'}
              </button>

            </div>

          </div>
        </>

      ) : (

        /* =================================================
           TIMER
           ================================================= */

        <>

          {/* Digital Display */}

          <div className="digital-display">

            {renderDigitalTime(
              timerText
            )}

          </div>


          {/* 종료 알람 */}

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


          {/* Controls */}

          {!alarmOn && (
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
                  onClick={
                    resetTimer
                  }
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


              {/* 시간 설정 */}

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
                    onClick={
                      applyTime
                    }
                  >
                    설정
                  </button>

                </div>

              </div>

            </>
          )}

        </>
      )}

    </main>
  )
}

export default function TimerWindow() {
  return (
    <Suspense fallback={null}>
      <TimerWindowContent />
    </Suspense>
  )
}