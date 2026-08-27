'use client'

type DigitalDigitProps = {
  value: string
  activeColor?: string
  offColor?: string
}

const SEGMENTS: Record<string, number[]> = {
  '0': [0, 1, 2, 4, 5, 6],
  '1': [1, 5],
  '2': [0, 1, 3, 4, 6],
  '3': [0, 1, 3, 5, 6],
  '4': [1, 2, 3, 5],
  '5': [0, 2, 3, 5, 6],
  '6': [0, 2, 3, 4, 5, 6],
  '7': [0, 1, 5],
  '8': [0, 1, 2, 3, 4, 5, 6],
  '9': [0, 1, 2, 3, 5, 6],
}

const PATHS = [
  {
    transform: undefined,
    d: `
      m178.52 60
      s-30.59 5.557-44.18 12.621
      c-12.6 6.555-33.13 26.824-33.13 26.824
      l104.14 48.915
      145.16-1.58
      55.22-80.469
      -227.21-6.311
      z
    `,
  },

  {
    transform: 'translate(178.52 60)',
    d: `
      m249.3 17.355
      l-58.38 86.785
      -9.47 219.32
      80.47 53.64
      20.52-20.51
      14.2-277.7
      s-7.29-24.26-17.63-36.46
      c-6.8-8.03-29.71-25.075-29.71-25.075
      z
    `,
  },

  {
    transform: 'translate(427.82 77.355)',
    d: `
      m-343.97 45.765
      l-18.932 290.32
      28.619 17.57
      75.519-45.97
      14.2-216.17
      -99.406-45.75
      z
    `,
  },

  {
    transform: 'translate(83.85 123.12)',
    d: `
      m108.45 277.69
      l-83.62 50.49
      69.42 34.72
      157.79 7.88
      92.68-33.54
      -87.92-58.71
      -148.35-0.84
      z
    `,
  },

  {
    transform: 'translate(192.3 400.81)',
    d: `
      m-100.5 73.38
      l-26.221 18.4
      -5.578 287.85
      100.97-47.97
      8.92-220.35
      -78.091-37.93
      z
    `,
  },

  {
    transform: 'translate(91.8 474.19)',
    d: `
      m359.69 3.93
      l-97.83 34.72
      -7.89 225.63
      52.07 83.62
      s31.57-18.32 41.03-33.13
      c9.33-14.63 12.62-50.49 12.62-50.49
      l11.04-244.57
      -11.04-15.78
      z
    `,
  },

  {
    transform: 'translate(451.49 478.12)',
    d: `
      m-127.01 274.97
      l-148.59 0.5
      -101.57 49.03
      c0.002 0 17.693 15.28 28 20.54
      9.68 4.94 31.04 9.98 31.04 9.98
      l243.15 0.99
      -52.03-81.04
      z
    `,
  },
]

export default function DigitalDigit({
  value,
  activeColor = '#fff',
  offColor = '#151515',
}: DigitalDigitProps) {
  const activeSegments = SEGMENTS[value] || []

  return (
    <svg
      className="digital-digit-svg"
      viewBox="0 0 535.15647 894.135"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {PATHS.map((path, index) => (
        <path
          key={index}
          d={path.d}
          transform={path.transform}
          fill={
            activeSegments.includes(index)
              ? activeColor
              : offColor
          }
          className={
            activeSegments.includes(index)
              ? 'digital-segment active'
              : 'digital-segment'
          }
        />
      ))}
    </svg>
  )
}