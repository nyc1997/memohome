'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type Category = {
  id: number
  name: string
}

type Props = {
  categories: Category[]
}

export default function NoteSearch({ categories }: Props) {

  const router = useRouter()
  const searchParams = useSearchParams()

  const [keyword, setKeyword] = useState(
    searchParams.get('keyword') || ''
  )

  const [categoryId, setCategoryId] = useState(
    searchParams.get('category') || ''
  )


  function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    const params = new URLSearchParams()

    if (keyword.trim()) {
      params.set('keyword', keyword.trim())
    }

    if (categoryId) {
      params.set('category', categoryId)
    }

    router.push(
      params.toString()
        ? `/?${params.toString()}`
        : '/'
    )
  }


  function clearKeyword() {
    setKeyword('')
  }


  return (
    <form className="search-box" onSubmit={handleSubmit}>

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">
          전체 카테고리
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
            onClick={clearKeyword}
          >
            ×
          </button>
        )}

      </div>


      <button type="submit">
        검색
      </button>

    </form>
  )
}