'use client'

import { useState } from 'react'

import Header from '../../components/Header'

let timerCount = 0
let alarmCount = 0

export default function TimerPage() {
  const [message, setMessage] = useState('')

  const openTimer = () => {
    timerCount += 1

    const id = timerCount

    const popup = window.open(
      `/timer/window?type=timer&id=${id}`,
      `timer-${id}`,
      'width=430,height=500,resizable=yes'
    )

    if (!popup) {
      setMessage('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.')
    }
  }

  const openAlarm = () => {
    alarmCount += 1

    const id = alarmCount

    const popup = window.open(
      `/timer/window?type=alarm&id=${id}`,
      `alarm-${id}`,
      'width=430,height=500,resizable=yes'
    )

    if (!popup) {
      setMessage('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해주세요.')
    }
  }

  return (
    <main className="container">
      <Header />
      <br/>
      
      <h1>⏱️ 타이머 / 알람</h1>

      <div className="timer-menu">

        <button
          className="action-button"
          onClick={openTimer}
        >
          ⏱️ 타이머
        </button>

        <button
          className="action-button"
          onClick={openAlarm}
        >
          🔔 알람
        </button>

      </div>

      {message && (
        <p>{message}</p>
      )}

    </main>
  )
}