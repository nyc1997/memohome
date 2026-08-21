
/* edit / page.tsx */

import DeleteButton from './DeleteButton'
import { supabase } from '../../../lib/supabase'
import Header from '../../../components/Header'
import Link from 'next/link'

import AttachmentDeleteButton from '../edit/AttachmentDeleteButton'
import AttachmentImage from '../edit/AttachmentImage'

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const { id } = await params

  const { data: note, error } = await supabase
    .from('notes')
    .select(`
      *,
      categories!notes_category_id_fkey (
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return <div>오류: {error.message}</div>
  }

  const isImage = note.file_url?.match(
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i
  )

  return (

    <main className="container">

      <Header />

      <article className="note">

        <h1>{note.title}</h1>

        <div className="note-category">
          📁 {note.categories?.name}
        </div>

        <div className="note-content">
          {note.content}
        </div>

        {note.file_url && (
          <div className="note-file">

            {isImage ? (
              <AttachmentImage
                src={note.file_url}
              />
            ) : (
              <a
                href={note.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-attachment"
              >
                📎 첨부파일 열기
              </a>
            )}

            <div
              style={{
                marginTop: '10px',
              }}
            >
              <AttachmentDeleteButton
                id={id}
              />
            </div>

          </div>
        )}

        <div className="note-actions">

          <Link
            href={`/notes/edit/${id}`}
            className="action-button"
          >
            수정
          </Link>

          <DeleteButton />

          <Link
            href="/"
            className="action-button"
          >
            목록
          </Link>

        </div>

      </article>

    </main>
  )
}

