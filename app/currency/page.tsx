'use client'

import { useEffect, useState } from 'react'
import Header from '../../components/Header'

type Rates = {
  [key: string]: number
}

const currencies = [
  {
    code: 'USD',
    name: '미국 달러',
    symbol: '$',
  },
  {
    code: 'KRW',
    name: '대한민국 원',
    symbol: '₩',
  },
  {
    code: 'JPY',
    name: '일본 엔',
    symbol: '¥',
  },
  {
    code: 'EUR',
    name: '유로',
    symbol: '€',
  },
  {
    code: 'CNY',
    name: '중국 위안',
    symbol: '¥',
  },
  {
    code: 'GBP',
    name: '영국 파운드',
    symbol: '£',
  },
]

export default function CurrencyPage() {
  const [base, setBase] =
    useState('USD')

  const [amount, setAmount] =
    useState('1')

  const [rates, setRates] =
    useState<Rates>({})

  const [date, setDate] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  // 환율 가져오기
  useEffect(() => {
    const fetchRates =
      async () => {
        try {
          setLoading(true)
          setError('')

          const response =
            await fetch(
              `https://api.frankfurter.dev/v1/latest?base=${base}`
            )

          if (!response.ok) {
            throw new Error(
              '환율 정보를 가져오지 못했습니다.'
            )
          }

          const data =
            await response.json()

          setRates(data.rates)
          setDate(data.date)
        } catch {
          setError(
            '환율 정보를 가져오지 못했습니다.'
          )
        } finally {
          setLoading(false)
        }
      }

    fetchRates()
  }, [base])

  const numericAmount =
    Number(amount) || 0

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
        환율
      </h1>

      {/* 기준 통화 */}
      <div
        style={{
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          기준 통화
        </div>

        <select
          value={base}
          onChange={e =>
            setBase(e.target.value)
          }
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px',
            fontSize: '17px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
          }}
        >
          {currencies.map(
            currency => (
              <option
                key={currency.code}
                value={
                  currency.code
                }
              >
                {currency.code} —{' '}
                {currency.name}
              </option>
            )
          )}
        </select>
      </div>

      {/* 금액 */}
      <div
        style={{
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '7px',
          }}
        >
          금액
        </div>

        <input
          type="number"
          value={amount}
          onChange={e =>
            setAmount(
              e.target.value
            )
          }
          min="0"
          step="any"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px',
            fontSize: '20px',
            border:
              '1px solid #ddd',
            borderRadius: '8px',
          }}
        />
      </div>

      {/* 결과 */}
      <div>
        {loading && (
          <div
            style={{
              padding: '20px 0',
              color: '#666',
            }}
          >
            환율 정보를 가져오는 중...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '20px 0',
              color: '#c00',
            }}
          >
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          currencies
            .filter(
              currency =>
                currency.code !==
                base
            )
            .map(currency => {
              const rate =
                rates[
                  currency.code
                ]

              if (
                rate === undefined
              ) {
                return null
              }

              const result =
                numericAmount *
                rate

              return (
                <div
                  key={
                    currency.code
                  }
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'space-between',
                    padding:
                      '16px 0',
                    borderBottom:
                      '1px solid #eee',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          '18px',
                        fontWeight:
                          600,
                      }}
                    >
                      {
                        currency.code
                      }
                    </div>

                    <div
                      style={{
                        fontSize:
                          '12px',
                        color:
                          '#888',
                        marginTop:
                          '3px',
                      }}
                    >
                      {
                        currency.name
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize:
                        '20px',
                      fontFamily:
                        'monospace',
                      textAlign:
                        'right',
                    }}
                  >
                    {result.toLocaleString(
                      'ko-KR',
                      {
                        maximumFractionDigits:
                          2,
                      }
                    )}
                  </div>
                </div>
              )
            })}
      </div>

      {/* 기준일 */}
      {!loading &&
        !error &&
        date && (
          <div
            style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#888',
              textAlign:
                'right',
            }}
          >
            기준일: {date}
          </div>
        )}
    </main>
  )
}