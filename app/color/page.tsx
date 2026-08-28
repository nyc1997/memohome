'use client'

import { useState } from 'react'
import Header from '../../components/Header'

declare global {
  interface Window {
    EyeDropper?: new () => {
      open: () => Promise<{
        sRGBHex: string
      }>
    }
  }
}

function rgbToCmyk(
  r: number,
  g: number,
  b: number
) {
  const r1 = r / 255
  const g1 = g / 255
  const b1 = b / 255

  const k =
    1 - Math.max(r1, g1, b1)

  if (k === 1) {
    return {
      c: 0,
      m: 0,
      y: 0,
      k: 100,
    }
  }

  const c =
    (1 - r1 - k) /
    (1 - k)

  const m =
    (1 - g1 - k) /
    (1 - k)

  const y =
    (1 - b1 - k) /
    (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

export default function ColorPage() {
  const [color, setColor] =
    useState('#4285F4')

  const [hex, setHex] =
    useState('#4285F4')

  const [rgb, setRgb] =
    useState('66, 133, 244')

  // 컬러 피커 / 스포이드에서 색상 변경
  const handleColorChange = (
    value: string
  ) => {
    const upper =
      value.toUpperCase()

    setColor(upper)
    setHex(upper)

    const r = parseInt(
      upper.slice(1, 3),
      16
    )

    const g = parseInt(
      upper.slice(3, 5),
      16
    )

    const b = parseInt(
      upper.slice(5, 7),
      16
    )

    setRgb(
      `${r}, ${g}, ${b}`
    )
  }

  // HEX 입력 중에는 색상을 변경하지 않음
  const handleHexChange = (
    value: string
  ) => {
    setHex(value)
  }

  // HEX 입력 완료
  const applyHex = () => {
    const clean =
      hex
        .trim()
        .replace(/^#/, '')

    // 3자리 HEX
    if (
      /^[0-9A-Fa-f]{3}$/.test(
        clean
      )
    ) {
      const expanded =
        clean[0] + clean[0] +
        clean[1] + clean[1] +
        clean[2] + clean[2]

      handleColorChange(
        `#${expanded}`
      )

      return
    }

    // 6자리 HEX
    if (
      /^[0-9A-Fa-f]{6}$/.test(
        clean
      )
    ) {
      handleColorChange(
        `#${clean}`
      )
    }
  }

  // 화면에서 색상 추출
  const pickFromScreen =
    async () => {
      if (!window.EyeDropper) {
        alert(
          '현재 브라우저에서는 화면 색상 추출을 지원하지 않습니다.'
        )

        return
      }

      try {
        const eyeDropper =
          new window.EyeDropper()

        const result =
          await eyeDropper.open()

        handleColorChange(
          result.sRGBHex
        )
      } catch {
        // ESC로 취소
      }
    }

  // 현재 HEX → CMYK
  const r = parseInt(
    color.slice(1, 3),
    16
  )

  const g = parseInt(
    color.slice(3, 5),
    16
  )

  const b = parseInt(
    color.slice(5, 7),
    16
  )

  const cmyk =
    rgbToCmyk(r, g, b)

  // 축약 HEX
  const shortHex =
    /^#([0-9A-Fa-f])\1([0-9A-Fa-f])\2([0-9A-Fa-f])\3$/.test(
      color
    )
      ? `#${color[1]}${color[3]}${color[5]}`
      : null

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
        컬러
      </h1>

      {/* 색상 미리보기 */}
      <div
        style={{
          width: '100%',
          height: '220px',
          backgroundColor: color,
          borderRadius: '12px',
          border: '1px solid #ddd',
          marginBottom: '24px',
        }}
      />

      {/* 컬러 피커 + 스포이드 */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding:
              '10px 14px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          🎨 색상 선택

          <input
            type="color"
            value={color}
            onChange={e =>
              handleColorChange(
                e.target.value
              )
            }
            style={{
              width: '45px',
              height: '32px',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </label>

        <button
          onClick={
            pickFromScreen
          }
          style={{
            padding:
              '10px 14px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          🖌️ 화면에서 색상 추출
        </button>
      </div>

      {/* HEX */}
      <div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          HEX
        </div>

        <input
          type="text"
          value={hex}
          onChange={e =>
            handleHexChange(
              e.target.value
            )
          }
          onBlur={applyHex}
          onKeyDown={e => {
            if (
              e.key === 'Enter'
            ) {
              applyHex()
            }
          }}
          spellCheck={false}
          placeholder="#4285F4"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px',
            fontSize: '18px',
            fontFamily:
              'monospace',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
          }}
        />

        {shortHex && (
          <div
            style={{
              marginTop: '8px',
              fontSize: '14px',
              color: '#666',
              fontFamily:
                'monospace',
            }}
          >
            축약 HEX&nbsp;&nbsp;
            {shortHex}
          </div>
        )}
      </div>

      {/* RGB */}
      <div
        style={{
          marginTop: '18px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          RGB
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <input
            type="text"
            value={rgb}
            readOnly
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              boxSizing: 'border-box',
              padding: '13px',
              fontSize: '18px',
              fontFamily: 'monospace',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#f8f8f8',
            }}
          />

          <div
            style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              lineHeight: 1.6,
              color: '#000',
            }}
          >
            <span>
              R(
              <span style={{ color: '#FF0000' }}>
                red
              </span>
              ){' '}
            </span>

            <span>
              G(
              <span style={{ color: '#008000' }}>
                green
              </span>
              ){' '}
            </span>

            <span>
              B(
              <span style={{ color: '#0000FF' }}>
                blue
              </span>
              )
            </span>
          </div>
        </div>
      </div>

      {/* CMYK */}
      <div
        style={{
          marginTop: '18px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          CMYK
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <input
            type="text"
            value={`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`}
            readOnly
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              boxSizing: 'border-box',
              padding: '13px',
              fontSize: '18px',
              fontFamily: 'monospace',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: '#f8f8f8',
            }}
          />

          <div
            style={{
              fontSize: '11px',
              whiteSpace: 'nowrap',
              lineHeight: 1.6,
              color: '#000',
            }}
          >
            <span>
              C(
              <span style={{ color: '#00AEEF' }}>
                cyan
              </span>
              ){' '}
            </span>

            <span>
              M(
              <span style={{ color: '#EC008C' }}>
                magenta
              </span>
              ){' '}
            </span>

            <span>
              Y(
              <span style={{ color: '#D8C900' }}>
                yellow
              </span>
              ){' '}
            </span>

            <span>
              K(
              <span style={{ color: '#111' }}>
                black
              </span>
              )
            </span>
          </div>
          
        </div>
      </div>
    </main>
  )
}