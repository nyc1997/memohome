'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Header from '../../../../components/Header'

type Category = {
  id: number
  name: string
}

export default function EditPage() {
  const params = useParams()
  const router = useRouter()

  const id = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [errorField, setErrorField] = useState('')
  const [toast, setToast] = useState('')

  function showToast(message: string) {
    setToast(message)

    setTimeout(() => {
      setToast('')
    }, 2000)
  }

  useEffect(() => {
    async function loadNote() {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        showToast(error.message)
        return
      }

      if (data) {
        setTitle(data.title)
        setContent(data.content)
        setCategory(data.category_id.toString())
      }
    }

    loadNote()
  }, [id])

  useEffect(() => {
    const getCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      if (error) {
        showToast(error.message)
      } else {
        setCategories(data || [])
      }
    }

    getCategories()
  }, [])

  async function updateNote() {
    setErrorField('')
    setToast('')

    if (!title.trim()) {
      setErrorField('title')
      showToast('제목을 입력해주세요.')
      return
    }

    if (!content.trim()) {
      setErrorField('content')
      showToast('내용을 입력해주세요.')
      return
    }

    if (!category) {
      setErrorField('category')
      showToast('카테고리를 선택해주세요.')
      return
    }

    const { error } = await supabase
      .from('notes')
      .update({
        title,
        content,
        category_id: Number(category),
      })
      .eq('id', id)

    if (error) {
      showToast(error.message)
      return
    }

    showToast('수정 완료')

    setTimeout(() => {
      router.push(`/notes/${id}`)
    }, 2500)
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
        <h1>수정</h1>

        <div className="form-group">
          <label>제목</label>

          <input
            className={errorField === 'title' ? 'input-error' : ''}
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

          <textarea
            className={errorField === 'content' ? 'input-error' : ''}
            placeholder="내용"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)

              if (errorField === 'content') {
                setErrorField('')
              }
            }}
          />
        </div>

        <div className="form-group">
          <label>카테고리</label>

          <select
            className={errorField === 'category' ? 'input-error' : ''}
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

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="write-actions">
          <button
            className="action-button"
            onClick={updateNote}
          >
            수정
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
    </main>
  )
}