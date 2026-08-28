'use client'

import { useState } from 'react'
import Header from '../../components/Header'

const languages = [
  { code: 'KO', name: '한국어' },
  { code: 'EN', name: '영어' },
  { code: 'JA', name: '일본어' },
  { code: 'ZH', name: '중국어' },
]

export default function TranslatePage() {
  const [sourceLang, setSourceLang] =
    useState('KO')

  const [targetLang, setTargetLang] =
    useState('EN')

  const [text, setText] =
    useState('')

  const [result, setResult] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const translate = async () => {
    if (!text.trim()) {
      return
    }

    if (sourceLang === targetLang) {
      setError(
        '출발 언어와 번역 언어가 같습니다.'
      )
      return
    }

    setLoading(true)
    setError('')

    try {
      const response =
        await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            text,
            sourceLang,
            targetLang,
          }),
        })

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            '번역에 실패했습니다.'
        )
      }

      setResult(data.result || '')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '번역에 실패했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)

    if (result) {
      setText(result)
      setResult(text)
    }
  }

  const copyResult = async () => {
    if (!result) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        result
      )
    } catch {
      // 복사 실패는 별도 처리하지 않음
    }
  }

  return (
    <main
      style={{
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        padding:
          '32px 20px 60px',
        boxSizing: 'border-box',
      }}
    >
      <Header/>
      <br/>
      <h1
        style={{
          fontSize: '28px',
          marginBottom: '24px',
        }}
      >
        🌐 번역기
      </h1>

      {/* 언어 선택 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <select
          value={sourceLang}
          onChange={e =>
            setSourceLang(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
          }}
        >
          {languages.map(lang => (
            <option
              key={lang.code}
              value={lang.code}
            >
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          style={{
            width: '44px',
            height: '44px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            fontSize: '20px',
            cursor: 'pointer',
          }}
          title="언어 교환"
        >
          ⇄
        </button>

        <select
          value={targetLang}
          onChange={e =>
            setTargetLang(
              e.target.value
            )
          }
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
          }}
        >
          {languages.map(lang => (
            <option
              key={lang.code}
              value={lang.code}
            >
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* 입력 */}
      <textarea
        value={text}
        onChange={e =>
          setText(e.target.value)
        }
        placeholder="번역할 문장을 입력하세요."
        style={{
          width: '100%',
          minHeight: '180px',
          padding: '16px',
          boxSizing: 'border-box',
          resize: 'vertical',
          border:
            '1px solid #ddd',
          borderRadius: '12px',
          fontSize: '16px',
          lineHeight: 1.6,
          outline: 'none',
        }}
      />

      {/* 번역 버튼 */}
      <button
        onClick={translate}
        disabled={
          loading ||
          !text.trim()
        }
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px',
          border: 'none',
          borderRadius: '10px',
          background:
            loading || !text.trim()
              ? '#aaa'
              : '#222',
          color: 'white',
          fontSize: '16px',
          cursor:
            loading || !text.trim()
              ? 'default'
              : 'pointer',
        }}
      >
        {loading
          ? '번역 중...'
          : '번역'}
      </button>

      {/* 오류 */}
      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '8px',
            background: '#fff0f0',
            color: '#d00',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* 결과 */}
      <div
        style={{
          marginTop: '20px',
          position: 'relative',
        }}
      >
        <textarea
          value={result}
          readOnly
          placeholder="번역 결과가 여기에 표시됩니다."
          style={{
            width: '100%',
            minHeight: '180px',
            padding: '16px',
            paddingBottom: '52px',
            boxSizing: 'border-box',
            resize: 'vertical',
            border:
              '1px solid #ddd',
            borderRadius: '12px',
            fontSize: '16px',
            lineHeight: 1.6,
            background: '#f8f8f8',
          }}
        />

        <button
          onClick={copyResult}
          disabled={!result}
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            padding:
              '8px 12px',
            border:
              '1px solid #ddd',
            borderRadius: '7px',
            background: 'white',
            cursor: result
              ? 'pointer'
              : 'default',
            color: result
              ? '#222'
              : '#aaa',
          }}
        >
          📋 복사
        </button>
      </div>
    </main>
  )
}