'use client'     /* write / page.tsx */

import { useEffect, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import { useRouter } from 'next/navigation'


  type Category = {
    id: number
    name: string
  }
  
export default function WritePage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [errorField, setErrorField] = useState('')
  const [toast, setToast] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)

  // 필기창
  const [showHandwriting, setShowHandwriting] = useState(false)

  // 캔버스
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)


  async function saveNote() {

    if (saving) return

    setSaving(true)

    setErrorField('')
    setToast('')

    if (!title.trim()) {
      setErrorField('title')
      showToast('제목을 입력해주세요.')
      setSaving(false)
      return
    }

    if (!content.trim()) {
      setErrorField('content')
      showToast('내용을 입력해주세요.')
      setSaving(false)
      return
    }

    if (!category) {
      setErrorField('category')
      showToast('카테고리를 선택해주세요.')
      setSaving(false)
      return
    }

    let fileUrl = ''

    // =========================
    // 파일 업로드
    // =========================
    if (file) {

      // 원본 파일의 확장자만 가져온다.
      const extension =
        file.name.includes('.')
          ? file.name.split('.').pop()?.toLowerCase()
          : ''

      // Storage에는 한글/공백이 들어가지 않는
      // 안전한 파일명만 사용한다.
      const fileName = extension
        ? `${Date.now()}-${crypto.randomUUID()}.${extension}`
        : `${Date.now()}-${crypto.randomUUID()}`

      const {
        data: uploadData,
        error: uploadError
      } = await supabase
        .storage
        .from('attachments')
        .upload(fileName, file)

      if (uploadError) {
        console.error('파일 업로드 오류:', uploadError)
        showToast(uploadError.message)
        setSaving(false)
        return
      }

      console.log('업로드 결과:', uploadData)

      const {
        data: publicUrlData
      } = supabase
        .storage
        .from('attachments')
        .getPublicUrl(fileName)

      fileUrl = publicUrlData.publicUrl

      console.log('파일 URL:', fileUrl)
    }

    // =========================
    // 노트 저장
    // =========================

    const { error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        category_id: Number(category),
        file_url: fileUrl || null
      })

    if (error) {
      console.error('노트 저장 오류:', error)
      showToast(error.message)
      setSaving(false)
      return
    }

    setTitle('')
    setContent('')
    setCategory('')
    setFile(null)

    showToast('저장 완료')

    setTimeout(() => {
      router.push('/')
    }, 500)
  }


  function showToast(message: string) {
    setToast(message)

    setTimeout(() => {
      setToast('')
    }, 2000)
  }


  useEffect(() => {
    const getCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      setCategories(data || [])
    }

    getCategories()
  }, [])


  // 필기창이 열리면 캔버스 초기화
  useEffect(() => {

    if (!showHandwriting) return

    const canvas = canvasRef.current

    if (!canvas) return

    const rect = canvas.getBoundingClientRect()

    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

  }, [showHandwriting])


  function getCanvasPosition(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {

    const canvas = canvasRef.current

    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }


  function startDrawing(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {

    const canvas = canvasRef.current

    if (!canvas) return

    canvas.setPointerCapture(e.pointerId)

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { x, y } = getCanvasPosition(e)

    drawingRef.current = true

    ctx.beginPath()
    ctx.moveTo(x, y)
  }


  function draw(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {

    if (!drawingRef.current) return

    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { x, y } = getCanvasPosition(e)

    ctx.lineTo(x, y)
    ctx.stroke()
  }


  function stopDrawing() {

    drawingRef.current = false
  }


  function clearCanvas() {

    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const rect = canvas.getBoundingClientRect()

    ctx.clearRect(
      0,
      0,
      rect.width,
      rect.height
    )

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(
      0,
      0,
      rect.width,
      rect.height
    )

    ctx.strokeStyle = '#111111'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }


  async function confirmHandwriting() {

    const canvas = canvasRef.current

    if (!canvas) return

    try {

      setOcrLoading(true)

      showToast('손글씨를 인식하는 중...')

      // Canvas를 PNG 이미지로 변환
      const imageData = canvas.toDataURL('image/png')

      // Tesseract OCR Worker 생성
     // const worker = await createWorker('kor')
      const worker = await createWorker(['kor', 'eng'])

      // OCR 실행
      const result = await worker.recognize(imageData)

      const text = result.data.text.trim()

      // Worker 종료
      await worker.terminate()

      if (!text) {
        showToast('글씨를 인식하지 못했습니다.')
        return
      }

      // 기존 내용 뒤에 OCR 결과 추가
      setContent((prev) => {

        if (!prev.trim()) {
          return text
        }

        return `${prev}\n${text}`
      })

      setShowHandwriting(false)

      if (errorField === 'content') {
        setErrorField('')
      }

      showToast('손글씨 인식 완료')

    } catch (error) {

      console.error('OCR 오류:', error)

      showToast('손글씨 인식 중 오류가 발생했습니다.')

    } finally {

      setOcrLoading(false)

    }
  }


  return (
    <main className="container">

      <Header />

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}


      <section className="write-form">

        <h1>새 기록</h1>


        <div className="form-group">

          <label>제목</label>

          <input
            className={
              errorField === 'title'
                ? 'input-error'
                : ''
            }
            placeholder="제목"
            value={title}
            onChange={(e) => {

              setTitle(e.target.value)

              if (errorField === 'title') {
                setErrorField('')
              }

            }}
          />

        </div>


        <div className="form-group">

          <label>내용</label>

          <div className="content-input-wrap">

            <textarea
              className={
                errorField === 'content'
                  ? 'input-error'
                  : ''
              }
              placeholder="내용"
              value={content}
              onChange={(e) => {

                setContent(e.target.value)

                if (errorField === 'content') {
                  setErrorField('')
                }

              }}
            />

            <button
              type="button"
              className="handwriting-button"
              onClick={() => setShowHandwriting(true)}
              title="손글씨 입력"
            >
              ✍️
            </button>

          </div>

        </div>


        <div className="form-group">

          <label>카테고리</label>

          <select
            className={
              errorField === 'category'
                ? 'input-error'
                : ''
            }
            value={category}
            onChange={(e) => {

              setCategory(e.target.value)

              if (errorField === 'category') {
                setErrorField('')
              }

            }}
          >

            <option value="">
              카테고리 선택
            </option>

            {categories?.map((category: any) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>


          <label>파일</label>

          <input
            type="file"
            onChange={(e) => {
              setFile(
                e.target.files?.[0] || null
              )
            }}
          />

        </div>


        <div className="write-actions">

          <button
            className="action-button"
            onClick={saveNote}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장'}
          </button>


          <button
            type="button"
            className="action-button"
            onClick={() => router.back()}
          >
            취소
          </button>

        </div>

      </section>


      {/* 필기 모달 */}

      {showHandwriting && (

        <div className="handwriting-overlay">

          <div className="handwriting-modal">

            <h2>손글씨 입력</h2>

            <p className="handwriting-help">
              화면에 손가락이나 펜으로 글씨를 써보세요.
            </p>


            <canvas
              ref={canvasRef}
              className="handwriting-canvas"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onPointerLeave={stopDrawing}
            />


            <div className="handwriting-actions">

              <button
                type="button"
                className="action-button"
                onClick={clearCanvas}
              >
                전체 지우기
              </button>


              <div className="handwriting-actions-right">

                <button
                  type="button"
                  className="action-button"
                  onClick={() => setShowHandwriting(false)}
                >
                  취소
                </button>

                <button
                  type="button"
                  className="action-button"
                  onClick={confirmHandwriting}
                  disabled={ocrLoading}
                >
                  {ocrLoading ? '인식 중...' : '확인'}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  )
}