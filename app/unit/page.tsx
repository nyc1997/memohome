'use client'

import { useState } from 'react'
import Header from '../../components/Header'

type Unit = {
  name: string
  symbol: string
  factor?: number
}

type Category = {
  name: string
  defaultUnit: string
  units: Unit[]
}

const categories: Category[] = [
  {
    name: '길이',
    defaultUnit: 'm',
    units: [
      { name: '밀리미터', symbol: 'mm', factor: 0.001 },
      { name: '센티미터', symbol: 'cm', factor: 0.01 },
      { name: '미터', symbol: 'm', factor: 1 },
      { name: '킬로미터', symbol: 'km', factor: 1000 },
      { name: '인치', symbol: 'inch', factor: 0.0254 },
      { name: '피트', symbol: 'ft', factor: 0.3048 },
      { name: '야드', symbol: 'yd', factor: 0.9144 },
      { name: '마일', symbol: 'mile', factor: 1609.344 },
    ],
  },
  {
    name: '무게',
    defaultUnit: 'kg',
    units: [
      { name: '밀리그램', symbol: 'mg', factor: 0.000001 },
      { name: '그램', symbol: 'g', factor: 0.001 },
      { name: '킬로그램', symbol: 'kg', factor: 1 },
      { name: '톤', symbol: 't', factor: 1000 },
      { name: '온스', symbol: 'oz', factor: 0.028349523125 },
      { name: '파운드', symbol: 'lb', factor: 0.45359237 },
    ],
  },
  {
    name: '부피',
    defaultUnit: 'L',
    units: [
      { name: '밀리리터', symbol: 'mL', factor: 0.001 },
      { name: '리터', symbol: 'L', factor: 1 },
      { name: '갤런(미국)', symbol: 'gal', factor: 3.785411784 },
      { name: '쿼트(미국)', symbol: 'qt', factor: 0.946352946 },
      { name: '파인트(미국)', symbol: 'pt', factor: 0.473176473 },
      { name: '컵(미국)', symbol: 'cup', factor: 0.2365882365 },
      { name: '액량 온스(미국)', symbol: 'fl oz', factor: 0.0295735295625 },
    ],
  },
  {
    name: '온도',
    defaultUnit: '°C',
    units: [
      { name: '섭씨', symbol: '°C' },
      { name: '화씨', symbol: '°F' },
      { name: '켈빈', symbol: 'K' },
    ],
  },
  {
    name: '면적',
    defaultUnit: 'm²',
    units: [
      { name: '제곱밀리미터', symbol: 'mm²', factor: 0.000001 },
      { name: '제곱센티미터', symbol: 'cm²', factor: 0.0001 },
      { name: '제곱미터', symbol: 'm²', factor: 1 },
      { name: '제곱킬로미터', symbol: 'km²', factor: 1000000 },
      { name: '평', symbol: '평', factor: 3.305785 },
      { name: '제곱피트', symbol: 'ft²', factor: 0.09290304 },
      { name: '제곱야드', symbol: 'yd²', factor: 0.83612736 },
      { name: '에이커', symbol: 'acre', factor: 4046.8564224 },
    ],
  },
  {
    name: '시간',
    defaultUnit: 'h',
    units: [
      { name: '밀리초', symbol: 'ms', factor: 0.0000002777777778 },
      { name: '초', symbol: 's', factor: 0.0002777777778 },
      { name: '분', symbol: 'min', factor: 0.01666666667 },
      { name: '시간', symbol: 'h', factor: 1 },
      { name: '일', symbol: 'day', factor: 24 },
      { name: '주', symbol: 'week', factor: 168 },
    ],
  },
]

function convertTemperature(
  value: number,
  from: string,
  to: string
) {
  let celsius = value

  if (from === '°F') {
    celsius = (value - 32) * 5 / 9
  } else if (from === 'K') {
    celsius = value - 273.15
  }

  if (to === '°C') {
    return celsius
  }

  if (to === '°F') {
    return celsius * 9 / 5 + 32
  }

  if (to === 'K') {
    return celsius + 273.15
  }

  return value
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '-'
  if (value === 0) return '0'

  const abs = Math.abs(value)

  if (abs >= 0.000001 && abs < 1000000000) {
    return Number(value.toPrecision(10)).toLocaleString(
      'en-US',
      {
        maximumFractionDigits: 10,
      }
    )
  }

  return value.toExponential(6)
}

export default function UnitPage() {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [input, setInput] = useState('1')

  const category = categories[categoryIndex]

  const defaultUnit =
    category.defaultUnit

  const [selectedUnit, setSelectedUnit] =
    useState(defaultUnit)

  const changeCategory = (
    index: number
  ) => {
    setCategoryIndex(index)

    setSelectedUnit(
      categories[index].defaultUnit
    )
  }

  const value = Number(input)

  const convert = (
    targetUnit: Unit
  ) => {
    if (
      input === '' ||
      Number.isNaN(value)
    ) {
      return '-'
    }

    if (category.name === '온도') {
      return formatNumber(
        convertTemperature(
          value,
          selectedUnit,
          targetUnit.symbol
        )
      )
    }

    const sourceUnit =
      category.units.find(
        unit =>
          unit.symbol === selectedUnit
      )

    if (!sourceUnit?.factor) {
      return '-'
    }

    const baseValue =
      value * sourceUnit.factor

    return formatNumber(
      baseValue /
      (targetUnit.factor ?? 1)
    )
  }

  return (

    <main
      style={{
        maxWidth: '720px',
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '32px 20px 60px',
        scrollbarGutter: 'stable',
      }}
    >
      <Header />
      <br/>

      <h1
        style={{
          marginBottom: '24px',
          fontSize: '28px',
        }}
      >
        단위변환
      </h1>

      {/* 카테고리 탭 */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '20px',
          borderBottom: '1px solid #ddd',
          scrollbarGutter: 'stable',
        }}
      >
        {categories.map((category, index) => (
          <button
            key={category.name}
            onClick={() => changeCategory(index)}
            style={{
              flex: '0 0 auto',
              padding: '10px 16px',
              border: 'none',
              borderBottom:
                categoryIndex === index
                  ? '3px solid #222'
                  : '3px solid transparent',
              background: 'none',
              fontSize: '16px',
              fontWeight:
                categoryIndex === index
                  ? 700
                  : 400,
              cursor: 'pointer',
            }}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '28px',
        }}
      >
        <input
          type="number"
          value={input}
          onChange={e =>
            setInput(e.target.value)
          }
          style={{
            flex: 1,
            minWidth: 0,
            padding: '14px',
            fontSize: '20px',
            textAlign: 'right',
          }}
        />

        <select
          value={selectedUnit}
          onChange={e =>
            setSelectedUnit(
              e.target.value
            )
          }
          style={{
            width: '130px',
            padding: '10px',
            fontSize: '16px',
          }}
        >
          {category.units.map(unit => (
            <option
              key={unit.symbol}
              value={unit.symbol}
            >
              {unit.symbol}
            </option>
          ))}
        </select>
      </div>

      {/* 결과 */}
      <section>
        {category.units.map(
          (unit, index) => (
            <div
              key={unit.symbol}
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                padding: '13px 4px',
                borderBottom:
                  '1px solid #e5e5e5',
                fontSize: '16px',
              }}
            >
              <span
                style={{
                  fontWeight:
                    unit.symbol ===
                    selectedUnit
                      ? 700
                      : 400,
                }}
              >
                {unit.symbol}
              </span>

              <span
                style={{
                  fontVariantNumeric:
                    'tabular-nums',
                }}
              >
                {convert(unit)}
              </span>
            </div>
          )
        )}
      </section>
    </main>
  )
}