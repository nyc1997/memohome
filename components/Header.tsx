'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  // ESC로 메뉴 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [])

  // 메뉴 클릭하면 닫기
  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* 상단 Header */}
      <header className="header">

        <button
          className="menu-button"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="메뉴 열기"
        >
          ☰
        </button>

        <Link
          href="/"
          className="site-title"
        >
          My personal home
        </Link>

      </header>


      {/* 어두운 배경 */}
      <div
        className={`sidebar-overlay ${
          isOpen ? 'show' : ''
        }`}
        onClick={closeMenu}
      />


      {/* Sidebar */}
      <aside
        className={`sidebar ${
          isOpen ? 'open' : ''
        }`}
      >

        <div className="sidebar-header">

          <span>
            메뉴
          </span>

          <button
            className="close-button"
            onClick={closeMenu}
            aria-label="메뉴 닫기"
          >
            ✕
          </button>

        </div>


        <nav className="sidebar-nav">

          <Link
            href="/"
            onClick={closeMenu}
          >
            🏠 홈
          </Link>

          <Link
            href="/write"
            onClick={closeMenu}
          >
            📝 새 기록
          </Link>

          <Link
            href="/search"
            onClick={closeMenu}
          >
            🔎 검색
          </Link>


          <div className="menu-divider" />


          <Link
            href="/camera"
            onClick={closeMenu}
          >
            📷 카메라
          </Link>

          <Link
            href="/map"
            onClick={closeMenu}
          >
            📍 지도
          </Link>

          <Link
            href="/write2"
            onClick={closeMenu}
          >
            🗺️ write2
          </Link>

          <Link
            href="/maplibre"
            onClick={closeMenu}
          >
            🗺️ MapLibre
          </Link>


          <div className="menu-divider" />
          
          <Link
            href="/timer"
            onClick={closeMenu}
          >
            ⏱️ 타이머
          </Link>

          <Link
            href="/music"
            onClick={closeMenu}
          >
            🎵 Music
          </Link>

          <Link
            href="/hls"
            onClick={closeMenu}
          >
            🎵 HLS
          </Link>

          <Link
            href="/youtube"
            onClick={closeMenu}
          >
            📺 YouTube
          </Link>


          <div className="menu-divider" />


          <Link
            href="/webrtc"
            onClick={closeMenu}
          >
            📡 WebRTC
          </Link>

          <Link
            href="/three"
            onClick={closeMenu}
          >
            🧊 Three.js
          </Link>

          <Link
            href="/tts"
            onClick={closeMenu}
          >
            🔊 TTS
          </Link>

        </nav>

      </aside>
    </>
  )
}