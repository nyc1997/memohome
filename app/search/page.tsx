
'use client'       /* search / page.tsx */

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import Header from '../../components/Header'
import NoteCard from '../../components/NoteCard'

export default function SearchPage() {

  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {

    async function getCategories() {

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id')

      if (error) {
        alert(error.message)
      } else {
        setCategories(data)
      }
    }

    getCategories()

  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    searchNotes()
  }

  async function searchNotes() {

    let query = supabase
      .from('notes')
      .select(`
        *,
        categories!notes_category_id_fkey (
          name
        )
      `)

    // 검색어가 있을 때만 제목/내용 검색
    if (keyword.trim()) {
      query = query.or(
        `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
      )
    }

    // 카테고리가 선택되어 있을 때만 카테고리 필터
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) {
      alert(error.message)
    } else {
      setResults(data || [])
      setSearched(true)
    }
  }

  return (

    <main className="container">

      <Header />


      <form className="search-box" onSubmit={handleSubmit}>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">전체 카테고리</option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        <div className="search-input-wrap">

          <input
            placeholder="검색어"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          {keyword && (
            <button
              type="button"
              className="clear-button"
              onClick={() => setKeyword('')}
            >
              ×
            </button>
          )}

        </div>

        <button type="submit">
          검색
        </button>

      </form>


      <hr />


     {!searched ? null : results.length === 0 ? (
        <p className="no-results">
          검색 결과가 없습니다.
        </p>
      ) : (
        results.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
          />
        ))
      )}

    </main>

  )
}

