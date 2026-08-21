
/* / page.tsx */

import { supabase } from '../lib/supabase'
import Link from 'next/link'
import Header from '../components/Header'
import NoteCard from '../components/NoteCard'
import NoteSearch from '../components/NoteSearch'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string
    page?: string
    keyword?: string
  }>
}) {
  const { category, page, keyword } = await searchParams

  const pageSize = 10
  const currentPage = Math.max(Number(page) || 1, 1)

  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('notes')
    .select(
      `
      *,
      categories!notes_category_id_fkey (
        name
      )
    `,
      { count: 'exact' }
    )

  if (category) {
    query = query.eq('category_id', Number(category))
  }

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,content.ilike.%${keyword}%`
    )
  }

  const {
    data: notes,
    error,
    count,
  } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('id')

  if (error) {
    return <div>오류: {error.message}</div>
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <main className="container">
      <Header />

      <NoteSearch
        categories={categories || []}
      />

      <hr />

      <div>
        total : {count}
      </div>

      {notes.map((note, index) => (
        <NoteCard
          key={note.id}
          note={note}
          number={from + index + 1}
        />
      ))}

  <div className="pagination">

    {currentPage > 1 && (
      <Link
        href={
          category
            ? `/?category=${category}&page=${currentPage - 1}`
            : `/?page=${currentPage - 1}`
        }
        className="action-button"
      >
        이전
      </Link>
    )}

    <div className="pagination-pages">

      {Array.from(
        { length: totalPages },
        (_, index) => index + 1
      ).map((pageNumber) => (

        <Link
          key={pageNumber}
          href={
            category
              ? `/?category=${category}&page=${pageNumber}`
              : `/?page=${pageNumber}`
          }
          className={
            pageNumber === currentPage
              ? 'pagination-current'
              : 'pagination-number'
          }
        >
          {pageNumber}.
        </Link>

      ))}

    </div>

    {currentPage < totalPages && (
      <Link
        href={
          category
            ? `/?category=${category}&page=${currentPage + 1}`
            : `/?page=${currentPage + 1}`
        }
        className="action-button"
      >
        다음
      </Link>
    )}

  </div>



    </main>
  )
}