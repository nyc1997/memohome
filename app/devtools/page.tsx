
'use client'

import { useState } from 'react'
import Header from '../../components/Header'

export default function DevToolsPage() {
  const [jsonInput, setJsonInput] = useState('{\n  "name": "memohome",\n  "tools": ["JSON", "URL", "Base64"]\n}')
  const [jsonOutput, setJsonOutput] = useState('')
  const [jsonError, setJsonError] = useState('')

  const [activeTool, setActiveTool] = useState('json')
  const [urlInput, setUrlInput] = useState('안녕하세요? name=개발자&tool=MemoHome')
  const [urlOutput, setUrlOutput] = useState('')
  const [urlError, setUrlError] = useState('')

  const [base64Input, setBase64Input] = useState('안녕하세요, MemoHome!')
  const [base64Output, setBase64Output] = useState('')
  const [base64Error, setBase64Error] = useState('')

  const [diffOriginal, setDiffOriginal] = useState('const name = "MemoHome"\nconst version = 1')
  const [diffModified, setDiffModified] = useState('const name = "MemoHome"\nconst version = 2')
  const [diffResult, setDiffResult] = useState<{ type: 'same' | 'added' | 'removed'; text: string }[] | null>(null)

  function formatJson() {
    try {
      const parsed = JSON.parse(jsonInput)
      setJsonOutput(JSON.stringify(parsed, null, 2))
      setJsonError('')
    } catch (error) {
      setJsonOutput('')
      setJsonError(
        error instanceof Error ? error.message : 'JSON 형식이 올바르지 않습니다.'
      )
    }
  }

  async function copyOutput() {
    if (!jsonOutput) return

    try {
      await navigator.clipboard.writeText(jsonOutput)
    } catch {
      setJsonError('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.')
    }
  }

  function convertUrl(mode: 'encode' | 'decode') {
    try {
      const result =
        mode === 'encode'
          ? encodeURIComponent(urlInput)
          : decodeURIComponent(urlInput)

      setUrlOutput(result)
      setUrlError('')
    } catch {
      setUrlOutput('')
      setUrlError('URL 형식이 올바르지 않거나 잘못된 인코딩 문자열입니다.')
    }
  }

  async function copyUrlOutput() {
    if (!urlOutput) return

    try {
      await navigator.clipboard.writeText(urlOutput)
    } catch {
      setUrlError('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.')
    }
  }

  function convertBase64(mode: 'encode' | 'decode') {
    try {
      const result =
        mode === 'encode'
          ? btoa(
              Array.from(new TextEncoder().encode(base64Input))
                .map((byte) => String.fromCharCode(byte))
                .join('')
            )
          : new TextDecoder().decode(
              Uint8Array.from(
                atob(base64Input),
                (char) => char.charCodeAt(0)
              )
            )

      setBase64Output(result)
      setBase64Error('')
    } catch {
      setBase64Output('')
      setBase64Error('Base64 형식이 올바르지 않거나 디코딩할 수 없습니다.')
    }
  }

  async function copyBase64Output() {
    if (!base64Output) return

    try {
      await navigator.clipboard.writeText(base64Output)
    } catch {
      setBase64Error('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.')
    }
  }


  function getCharDiff(oldText: string, newText: string) {
    let prefix = 0

    // 공통으로 시작하는 부분만 찾기
    while (
      prefix < oldText.length &&
      prefix < newText.length &&
      oldText[prefix] === newText[prefix]
    ) {
      prefix++
    }

    let suffix = 0

    // 공통으로 끝나는 부분 찾기
    while (
      suffix < oldText.length - prefix &&
      suffix < newText.length - prefix &&
      oldText[oldText.length - 1 - suffix] ===
        newText[newText.length - 1 - suffix]
    ) {
      suffix++
    }

    return {
      oldPrefix: oldText.slice(0, prefix),
      oldChanged: oldText.slice(prefix, oldText.length - suffix),
      oldSuffix: suffix > 0 ? oldText.slice(-suffix) : '',
      newPrefix: newText.slice(0, prefix),
      newChanged: newText.slice(prefix, newText.length - suffix),
      newSuffix: suffix > 0 ? newText.slice(-suffix) : '',
    }
  }


  function compareText() {
    const originalLines = diffOriginal.split('\n')
    const modifiedLines = diffModified.split('\n')

    const m = originalLines.length
    const n = modifiedLines.length

    const dp = Array.from({ length: m + 1 }, () =>
      Array<number>(n + 1).fill(0)
    )

    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] =
          originalLines[i] === modifiedLines[j]
            ? dp[i + 1][j + 1] + 1
            : Math.max(dp[i + 1][j], dp[i][j + 1])
      }
    }

    const result: {
      type: 'same' | 'added' | 'removed'
      text: string
    }[] = []

    let i = 0
    let j = 0

    while (i < m && j < n) {
      if (originalLines[i] === modifiedLines[j]) {
        result.push({ type: 'same', text: originalLines[i] })
        i++
        j++
        continue
      }

      const removedLines: string[] = []
      const addedLines: string[] = []

      while (
        i < m &&
        j < n &&
        originalLines[i] !== modifiedLines[j]
      ) {
        if (dp[i + 1][j] >= dp[i][j + 1]) {
          removedLines.push(originalLines[i])
          i++
        } else {
          addedLines.push(modifiedLines[j])
          j++
        }
      }

      while (i < m && (j >= n || dp[i][j] === dp[i + 1][j])) {
        if (j < n && originalLines[i] === modifiedLines[j]) break
        removedLines.push(originalLines[i])
        i++
      }

      while (j < n && (i >= m || dp[i][j] === dp[i][j + 1])) {
        if (i < m && originalLines[i] === modifiedLines[j]) break
        addedLines.push(modifiedLines[j])
        j++
      }

      const pairedCount = Math.min(
        removedLines.length,
        addedLines.length
      )

      for (let k = 0; k < pairedCount; k++) {
        result.push({ type: 'removed', text: removedLines[k] })
        result.push({ type: 'added', text: addedLines[k] })
      }

      for (let k = pairedCount; k < removedLines.length; k++) {
        result.push({ type: 'removed', text: removedLines[k] })
      }

      for (let k = pairedCount; k < addedLines.length; k++) {
        result.push({ type: 'added', text: addedLines[k] })
      }
    }

    while (i < m) {
      result.push({ type: 'removed', text: originalLines[i] })
      i++
    }

    while (j < n) {
      result.push({ type: 'added', text: modifiedLines[j] })
      j++
    }

    setDiffResult(result)
  }


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Developer Toolbox
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            개발 도구
          </h1>
          <p className="mt-2 text-gray-500">
            자주 사용하는 개발 작업을 한곳에서 간편하게 처리하세요.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
           <div
            onClick={() => setActiveTool('json')}
            className={`cursor-pointer rounded-xl border p-4 ${
              activeTool === 'json'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="mb-3 text-2xl"> {'{ }'} </div>
            <h2 className="font-semibold">JSON 도구</h2>
            <p className="mt-1 text-sm text-gray-500">포맷 및 검증</p>
          </div>

          <div
              onClick={() => setActiveTool('url')}
              className={`cursor-pointer rounded-xl border p-4 ${
                activeTool === 'url'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-3 text-2xl">🔗</div>
              <h2 className="font-semibold">URL 도구</h2>
              <p className="mt-1 text-sm text-gray-500">인코딩 및 디코딩</p>
          </div>

          <div
              onClick={() => setActiveTool('base64')}
              className={`cursor-pointer rounded-xl border p-4 ${
                activeTool === 'base64'
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="mb-3 text-2xl">🔤</div>
              <h2 className="font-semibold">Base64</h2>
              <p className="mt-1 text-sm text-gray-500">텍스트 변환</p>
            </div>

          <div
            onClick={() => setActiveTool('diff')}
            className={`cursor-pointer rounded-xl border p-4 ${
              activeTool === 'diff'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="mb-3 text-2xl">⇄</div>
            <h2 className="font-semibold">텍스트 비교</h2>
            <p className="mt-1 text-sm text-gray-500">변경 내용 확인</p>
          </div>
        </div>

      {activeTool === 'json' && (

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">JSON 포맷터 · 검증기</h2>
              <p className="mt-1 text-sm text-gray-500">
                JSON을 보기 좋게 정리하고 문법 오류를 확인합니다.
              </p>
            </div>
            <button
              onClick={() => {
                setJsonInput('')
                setJsonOutput('')
                setJsonError('')
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              초기화
            </button>
          </div>

          <label className="mb-2 block text-sm font-semibold">
            입력 JSON
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck={false}
            placeholder='{"name":"example"}'
            className="min-h-52 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={formatJson}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            JSON 정리 및 검증
          </button>

          {jsonError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {jsonError}
            </p>
          )}

          {jsonOutput && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold">결과</label>
                <button
                  onClick={copyOutput}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  결과 복사
                </button>
              </div>
              <textarea
                readOnly
                value={jsonOutput}
                spellCheck={false}
                className="min-h-52 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm outline-none"
              />
              <p className="mt-2 text-sm text-green-700">
                JSON 형식이 올바릅니다.
              </p>
            </div>
          )}
        </section>
      )}

      {activeTool === 'url' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">URL 인코더 · 디코더</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">
            한글과 특수문자를 인코딩하거나 원래 문자열로 복원합니다.
          </p>

          <label className="mb-2 block text-sm font-semibold">
            입력 문자열
          </label>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            spellCheck={false}
            className="min-h-36 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => convertUrl('encode')}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              URL 인코딩
            </button>
            <button
              onClick={() => convertUrl('decode')}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold hover:bg-gray-50"
            >
              URL 디코딩
            </button>
            <button
              onClick={() => {
                setUrlInput('')
                setUrlOutput('')
                setUrlError('')
              }}
              className="rounded-xl border border-gray-300 px-5 py-3 hover:bg-gray-50"
            >
              초기화
            </button>
          </div>

          {urlError && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {urlError}
            </p>
          )}

          {urlOutput !== '' && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold">변환 결과</label>
                <button
                  onClick={copyUrlOutput}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  결과 복사
                </button>
              </div>
              <textarea
                readOnly
                value={urlOutput}
                spellCheck={false}
                className="min-h-36 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm outline-none"
              />
            </div>
          )}
        </section>
      )}

      {activeTool === 'base64' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">Base64 인코더 · 디코더</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">
            텍스트를 Base64로 변환하거나 원래 문자열로 복원합니다. 한글도 지원합니다.
          </p>

          <label className="mb-2 block text-sm font-semibold">
            입력 문자열
          </label>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            spellCheck={false}
            className="min-h-36 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => convertBase64('encode')}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Base64 인코딩
            </button>
            <button
              onClick={() => convertBase64('decode')}
              className="rounded-xl border border-gray-300 px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Base64 디코딩
            </button>
            <button
              onClick={() => {
                setBase64Input('')
                setBase64Output('')
                setBase64Error('')
              }}
              className="rounded-xl border border-gray-300 px-5 py-3 hover:bg-gray-50"
            >
              초기화
            </button>
          </div>

          {base64Error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {base64Error}
            </p>
          )}

          {base64Output !== '' && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold">변환 결과</label>
                <button
                  onClick={copyBase64Output}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  결과 복사
                </button>
              </div>
              <textarea
                readOnly
                value={base64Output}
                spellCheck={false}
                className="min-h-36 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm outline-none"
              />
            </div>
          )}
        </section>
      )}

      {activeTool === 'diff' && (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">텍스트 비교 (Diff)</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">
            두 텍스트를 비교해 추가·삭제·동일한 줄을 확인합니다.
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                원본 텍스트
              </label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                spellCheck={false}
                className="min-h-52 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                수정된 텍스트
              </label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                spellCheck={false}
                className="min-h-52 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={compareText}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              텍스트 비교
            </button>

            <button
              onClick={() => {
                setDiffOriginal('')
                setDiffModified('')
                setDiffResult(null)
              }}
              className="rounded-xl border border-gray-300 px-5 py-3 hover:bg-gray-50"
            >
              초기화
            </button>
          </div>

          {diffResult !== null && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">비교 결과</h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <div className="min-w-0 font-mono text-sm">
                  
                  {diffResult.map((line, index) => {
                    const nextLine = diffResult[index + 1]
                    const prevLine = diffResult[index - 1]

                    const isPairedChange =
                      (line.type === 'removed' && nextLine?.type === 'added') ||
                      (line.type === 'added' && prevLine?.type === 'removed')

                    const charDiff = isPairedChange
                      ? line.type === 'removed'
                        ? getCharDiff(line.text, nextLine!.text)
                        : getCharDiff(prevLine!.text, line.text)
                      : null

                    const prefix = charDiff
                      ? line.type === 'removed'
                        ? charDiff.oldPrefix
                        : charDiff.newPrefix
                      : ''

                    const changed = charDiff
                      ? line.type === 'removed'
                        ? charDiff.oldChanged
                        : charDiff.newChanged
                      : ''

                    const suffix = charDiff
                      ? line.type === 'removed'
                        ? charDiff.oldSuffix
                        : charDiff.newSuffix
                      : ''

                    return (
                      <div
                        key={index}
                        className={`whitespace-pre-wrap break-all px-4 py-2 ${
                          line.type === 'added'
                            ? 'bg-green-50 text-green-800'
                            : line.type === 'removed'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-white text-gray-700'
                        }`}
                      >
                        <span className="mr-3 inline-block w-4 select-none font-bold">
                          {line.type === 'added'
                            ? '+'
                            : line.type === 'removed'
                              ? '-'
                              : ' '}
                        </span>

                        {charDiff ? (
                          <>
                            {prefix}
                            <span
                              className={`rounded font-bold ${
                                line.type === 'added'
                                  ? 'bg-green-200 text-green-900'
                                  : 'bg-red-200 text-red-900'
                              }`}
                            >
                              
                              {changed}
                            </span>
                            {suffix}
                          </>
                        ) : (
                          line.text || ' '
                        )}
                      </div>
                    )
                  })}

                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <span className="text-green-700">+ 추가된 줄</span>
                <span className="text-red-700">− 삭제된 줄</span>
                <span className="text-gray-500">동일한 줄</span>
              </div>
            </div>
          )}
        </section>
      )}

        <p className="mt-6 text-center text-xs text-gray-400">
          JSON 처리는 브라우저에서 수행됩니다. 입력 내용은 별도로 서버에 전송하지 않습니다.
        </p>
      </div>
    </main>
  )
}
