'use client'

import { useEffect, useState } from 'react'
import Header from '../../components/Header'

type Tab = 'calculator' | 'date'
type CalcMode = 'basic' | 'scientific'
type AngleMode = 'DEG' | 'RAD'

export default function CalculatorPage() {
  const [tab, setTab] =
    useState<Tab>('calculator')

  const [calcMode, setCalcMode] =
    useState<CalcMode>('basic')

  const [angleMode, setAngleMode] =
    useState<AngleMode>('DEG')

  const [display, setDisplay] =
    useState('0')

  const [expression, setExpression] =
    useState('')

  // 날짜 계산
  const [startDate, setStartDate] =
    useState('')

  const [endDate, setEndDate] =
    useState('')

  const [baseDate, setBaseDate] =
    useState('')

  const [days, setDays] =
    useState('')

  const [dateMode, setDateMode] =
    useState<'add' | 'subtract'>('add')

  const [dateResult, setDateResult] =
    useState('')

  useEffect(() => {
    const today = new Date()

    const formatted =
      `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, '0')}-${String(
        today.getDate()
      ).padStart(2, '0')}`

    setStartDate(formatted)
    setEndDate(formatted)
    setBaseDate(formatted)
  }, [])

  // -------------------------
  // 계산기 입력
  // -------------------------

  const inputNumber = (
    value: string
  ) => {
    setDisplay(prev => {
      if (prev === '0') {
        return value
      }

      if (
        prev === 'Error'
      ) {
        return value
      }

      return prev + value
    })
  }

  const inputDecimal = () => {
    setDisplay(prev => {
      if (prev === 'Error') {
        return '0.'
      }

      const parts =
        prev.split(/[+\-*/%()]/)

      const current =
        parts[parts.length - 1]

      if (current.includes('.')) {
        return prev
      }

      if (
        current === '' ||
        /[+\-*/%()]$/.test(prev)
      ) {
        return prev + '0.'
      }

      return prev + '.'
    })
  }

  const inputOperator = (
    operator: string
  ) => {
    setDisplay(prev => {
      if (prev === 'Error') {
        return '0'
      }

      if (
        prev === '0' &&
        operator !== '-'
      ) {
        return prev
      }

      if (
        /[+\-*/%]$/.test(prev)
      ) {
        return (
          prev.slice(0, -1) +
          operator
        )
      }

      return prev + operator
    })
  }

  const inputParenthesis = (
    value: '(' | ')'
  ) => {
    setDisplay(prev => {
      if (prev === 'Error') {
        return value === '('
          ? '('
          : '0'
      }

      if (prev === '0') {
        return value === '('
          ? '('
          : prev
      }

      return prev + value
    })
  }

  const clearCalculator = () => {
    setDisplay('0')
    setExpression('')
  }

  const backspace = () => {
    setDisplay(prev => {
      if (
        prev === 'Error' ||
        prev.length <= 1
      ) {
        return '0'
      }

      const result =
        prev.slice(0, -1)

      return result || '0'
    })
  }

  // -------------------------
  // 공학 계산
  // -------------------------

  const toRadians = (
    value: number
  ) => {
    return angleMode === 'DEG'
      ? value * Math.PI / 180
      : value
  }

  const factorial = (
    value: number
  ) => {
    if (
      value < 0 ||
      !Number.isInteger(value) ||
      value > 170
    ) {
      throw new Error()
    }

    let result = 1

    for (
      let i = 2;
      i <= value;
      i++
    ) {
      result *= i
    }

    return result
  }

  const calculateScientific =
    (
      type: string
    ) => {
      try {
        const value =
          Number(display)

        if (
          !Number.isFinite(value)
        ) {
          throw new Error()
        }

        let result = 0
        let label = ''

        switch (type) {
          case 'sin':
            result =
              Math.sin(
                toRadians(value)
              )
            label =
              `sin(${display})`
            break

          case 'cos':
            result =
              Math.cos(
                toRadians(value)
              )
            label =
              `cos(${display})`
            break

          case 'tan':
            result =
              Math.tan(
                toRadians(value)
              )
            label =
              `tan(${display})`
            break

          case 'asin':
            result =
              angleMode === 'DEG'
                ? Math.asin(value) *
                  180 / Math.PI
                : Math.asin(value)

            label =
              `asin(${display})`
            break

          case 'acos':
            result =
              angleMode === 'DEG'
                ? Math.acos(value) *
                  180 / Math.PI
                : Math.acos(value)

            label =
              `acos(${display})`
            break

          case 'atan':
            result =
              angleMode === 'DEG'
                ? Math.atan(value) *
                  180 / Math.PI
                : Math.atan(value)

            label =
              `atan(${display})`
            break

          case 'sqrt':
            result =
              Math.sqrt(value)

            label =
              `√(${display})`
            break

          case 'square':
            result =
              value * value

            label =
              `(${display})²`
            break

          case 'inverse':
            result =
              1 / value

            label =
              `1/(${display})`
            break

          case 'log':
            result =
              Math.log10(value)

            label =
              `log(${display})`
            break

          case 'ln':
            result =
              Math.log(value)

            label =
              `ln(${display})`
            break

          case 'factorial':
            result =
              factorial(value)

            label =
              `${display}!`
            break

          default:
            return
        }

        if (
          !Number.isFinite(result)
        ) {
          throw new Error()
        }

        setExpression(label)

        setDisplay(
          Number.isInteger(result)
            ? String(result)
            : String(
                Number(
                  result.toFixed(12)
                )
              )
        )
      } catch {
        setExpression(
          '계산할 수 없습니다.'
        )

        setDisplay('Error')
      }
    }

  const insertConstant = (
    value: string
  ) => {
    setDisplay(value)
  }

  const calculate = () => {
    try {
      let formula =
        display

      if (
        !/^[0-9+\-*/%().\s]+$/.test(
          formula
        )
      ) {
        throw new Error()
      }

      const result =
        Function(
          `"use strict"; return (${formula})`
        )()

      if (
        typeof result !== 'number' ||
        !Number.isFinite(result)
      ) {
        throw new Error()
      }

      const formatted =
        Number.isInteger(result)
          ? String(result)
          : String(
              Number(
                result.toFixed(12)
              )
            )

      setExpression(
        `${display} =`
      )

      setDisplay(formatted)
    } catch {
      setExpression(
        '계산할 수 없습니다.'
      )

      setDisplay('Error')
    }
  }

  // -------------------------
  // 키보드
  // -------------------------

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        tab !== 'calculator'
      ) {
        return
      }

      const key = e.key

      // 숫자
      if (/^[0-9]$/.test(key)) {
        e.preventDefault()
        inputNumber(key)
        return
      }

      // 소수점
      if (key === '.') {
        e.preventDefault()
        inputDecimal()
        return
      }

      // = 키 → +
      if (key === '=') {
        e.preventDefault()
        inputOperator('+')
        return
      }

      // -
      if (key === '-') {
        e.preventDefault()
        inputOperator('-')
        return
      }

      // 곱하기
      if (
        key === '*' ||
        key === 'x' ||
        key === 'X' ||
        key === 'ㅌ'
      ) {
        e.preventDefault()
        inputOperator('*')
        return
      }

      // 나누기
      if (key === '/') {
        e.preventDefault()
        inputOperator('/')
        return
      }

      // %
      if (
        key === '%' &&
        e.shiftKey
      ) {
        e.preventDefault()
        inputOperator('%')
        return
      }

      // 괄호
      if (
        key === '(' &&
        e.shiftKey
      ) {
        e.preventDefault()
        inputParenthesis('(')
        return
      }

      if (
        key === ')' &&
        e.shiftKey
      ) {
        e.preventDefault()
        inputParenthesis(')')
        return
      }

      // Enter = 계산
      if (key === 'Enter') {
        e.preventDefault()
        calculate()
        return
      }

      // Delete = C
      if (key === 'Delete') {
        e.preventDefault()
        clearCalculator()
        return
      }

      // Backspace
      if (
        key === 'Backspace'
      ) {
        e.preventDefault()
        backspace()
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
  }, [
    tab,
    display,
    angleMode,
  ])

  // -------------------------
  // 날짜
  // -------------------------

  const calculateDateDifference =
    () => {
      if (
        !startDate ||
        !endDate
      ) {
        return
      }

      const start =
        new Date(
          `${startDate}T00:00:00`
        )

      const end =
        new Date(
          `${endDate}T00:00:00`
        )

      const difference =
        Math.round(
          (end.getTime() -
            start.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        )

      setDateResult(
        `${Math.abs(difference)}일`
      )
    }

  const calculateDateAddSubtract =
    () => {
      if (
        !baseDate ||
        !days
      ) {
        return
      }

      const date =
        new Date(
          `${baseDate}T00:00:00`
        )

      const amount =
        Number(days)

      if (
        !Number.isFinite(amount)
      ) {
        return
      }

      date.setDate(
        date.getDate() +
          (
            dateMode === 'add'
              ? amount
              : -amount
          )
      )

      const result =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}-${String(
          date.getDate()
        ).padStart(2, '0')}`

      setDateResult(result)
    }

  // -------------------------
  // 버튼 스타일
  // -------------------------

  const calcButtonStyle = {
    height: '54px',
    fontSize: '18px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
  }

  const sciButtonStyle = {
    height: '46px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#f8f8f8',
    cursor: 'pointer',
  }

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
          marginBottom: '20px',
        }}
      >
        🧮 계산기
      </h1>

      {/* 메인 탭 */}
      <div
        style={{
          display: 'flex',
          borderBottom:
            '1px solid #ddd',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() =>
            setTab('calculator')
          }
          style={{
            flex: 1,
            padding: '13px',
            border: 'none',
            borderBottom:
              tab === 'calculator'
                ? '3px solid #222'
                : '3px solid transparent',
            background: 'white',
            fontWeight:
              tab === 'calculator'
                ? 700
                : 400,
            cursor: 'pointer',
          }}
        >
          계산기
        </button>

        <button
          onClick={() =>
            setTab('date')
          }
          style={{
            flex: 1,
            padding: '13px',
            border: 'none',
            borderBottom:
              tab === 'date'
                ? '3px solid #222'
                : '3px solid transparent',
            background: 'white',
            fontWeight:
              tab === 'date'
                ? 700
                : 400,
            cursor: 'pointer',
          }}
        >
          날짜 계산기
        </button>
      </div>

      {tab === 'calculator' && (
        <>
          {/* 계산기 모드 */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '14px',
            }}
          >
            <button
              onClick={() =>
                setCalcMode('basic')
              }
              style={{
                flex: 1,
                padding: '10px',
                border:
                  calcMode === 'basic'
                    ? '2px solid #222'
                    : '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              기본
            </button>

            <button
              onClick={() =>
                setCalcMode('scientific')
              }
              style={{
                flex: 1,
                padding: '10px',
                border:
                  calcMode === 'scientific'
                    ? '2px solid #222'
                    : '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              공학
            </button>
          </div>

          {/* 표시창 */}
          <div
            style={{
              background: '#f5f5f5',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '14px',
              textAlign: 'right',
              minHeight: '100px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: '#888',
                minHeight: '20px',
              }}
            >
              {expression}
            </div>

            <div
              style={{
                fontSize: '32px',
                fontFamily: 'monospace',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                marginTop: '10px',
              }}
            >
              {display}
            </div>
          </div>

          {calcMode === 'scientific' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                gap: '7px',
                marginBottom: '10px',
              }}
            >
              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'sin'
                  )
                }
              >
                sin
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'cos'
                  )
                }
              >
                cos
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'tan'
                  )
                }
              >
                tan
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'sqrt'
                  )
                }
              >
                √
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'asin'
                  )
                }
              >
                asin
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'acos'
                  )
                }
              >
                acos
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'atan'
                  )
                }
              >
                atan
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'square'
                  )
                }
              >
                x²
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'log'
                  )
                }
              >
                log
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'ln'
                  )
                }
              >
                ln
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'inverse'
                  )
                }
              >
                1/x
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  calculateScientific(
                    'factorial'
                  )
                }
              >
                x!
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  insertConstant(
                    String(Math.PI)
                  )
                }
              >
                π
              </button>

              <button
                style={sciButtonStyle}
                onClick={() =>
                  insertConstant(
                    String(Math.E)
                  )
                }
              >
                e
              </button>

              <button
                style={{
                  ...sciButtonStyle,
                  gridColumn: 'span 2',
                }}
                onClick={() =>
                  setAngleMode(
                    angleMode === 'DEG'
                      ? 'RAD'
                      : 'DEG'
                  )
                }
              >
                {angleMode}
              </button>
            </div>
          )}

          {/* 기본 버튼 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, 1fr)',
              gap: '8px',
            }}
          >
            <button
              onClick={
                clearCalculator
              }
              style={calcButtonStyle}
            >
              C
            </button>

            <button
              onClick={backspace}
              style={calcButtonStyle}
            >
              ⌫
            </button>

            <button
              onClick={() =>
                inputParenthesis('(')
              }
              style={calcButtonStyle}
            >
              (
            </button>

            <button
              onClick={() =>
                inputParenthesis(')')
              }
              style={calcButtonStyle}
            >
              )
            </button>

            {[
              '7',
              '8',
              '9',
              '/',
              '4',
              '5',
              '6',
              '*',
              '1',
              '2',
              '3',
              '-',
              '0',
              '.',
              '%',
              '+',
            ].map(value => (
              <button
                key={value}
                onClick={() => {
                  if (
                    /^[0-9]$/.test(
                      value
                    )
                  ) {
                    inputNumber(
                      value
                    )
                  } else if (
                    value === '.'
                  ) {
                    inputDecimal()
                  } else {
                    inputOperator(
                      value
                    )
                  }
                }}
                style={calcButtonStyle}
              >
                {value === '*'
                  ? '×'
                  : value}
              </button>
            ))}

            <button
              onClick={calculate}
              style={{
                ...calcButtonStyle,
                gridColumn:
                  'span 4',
                background: '#222',
                color: 'white',
                border:
                  '1px solid #222',
              }}
            >
              =
            </button>
          </div>

          <div
            style={{
              marginTop: '14px',
              fontSize: '13px',
              color: '#888',
              textAlign: 'center',
            }}
          >
            숫자 · + · - · x · ㅌ · / · Enter ·
            Delete · Backspace
          </div>
        </>
      )}

      {tab === 'date' && (
        <section>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '18px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '18px',
              }}
            >
              날짜 차이
            </h2>

            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '7px',
              }}
            >
              시작일
            </label>

            <input
              type="date"
              value={startDate}
              onChange={e =>
                setStartDate(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                fontSize: '16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            />

            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '7px',
              }}
            >
              종료일
            </label>

            <input
              type="date"
              value={endDate}
              onChange={e =>
                setEndDate(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                fontSize: '16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            />

            <button
              onClick={
                calculateDateDifference
              }
              style={{
                width: '100%',
                padding: '13px',
                border:
                  '1px solid #222',
                borderRadius: '8px',
                background: '#222',
                color: 'white',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              계산
            </button>
          </div>

          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '18px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                marginTop: 0,
                marginBottom: '18px',
              }}
            >
              날짜 더하기 / 빼기
            </h2>

            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '7px',
              }}
            >
              기준일
            </label>

            <input
              type="date"
              value={baseDate}
              onChange={e =>
                setBaseDate(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                fontSize: '16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <button
                onClick={() =>
                  setDateMode('add')
                }
                style={{
                  flex: 1,
                  padding: '11px',
                  border:
                    dateMode === 'add'
                      ? '2px solid #222'
                      : '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                더하기
              </button>

              <button
                onClick={() =>
                  setDateMode(
                    'subtract'
                  )
                }
                style={{
                  flex: 1,
                  padding: '11px',
                  border:
                    dateMode ===
                    'subtract'
                      ? '2px solid #222'
                      : '1px solid #ddd',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                빼기
              </button>
            </div>

            <input
              type="number"
              value={days}
              onChange={e =>
                setDays(
                  e.target.value
                )
              }
              placeholder="일수 입력"
              min="0"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                fontSize: '16px',
                border:
                  '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '14px',
              }}
            />

            <button
              onClick={
                calculateDateAddSubtract
              }
              style={{
                width: '100%',
                padding: '13px',
                border:
                  '1px solid #222',
                borderRadius: '8px',
                background: '#222',
                color: 'white',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              계산
            </button>
          </div>

          {dateResult && (
            <div
              style={{
                marginTop: '18px',
                padding: '18px',
                background: '#f5f5f5',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '26px',
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {dateResult}
            </div>
          )}
        </section>
      )}
    </main>
  )
}