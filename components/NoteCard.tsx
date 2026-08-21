
import Link from 'next/link'

import AttachmentImage from '../app/notes/edit/AttachmentImage'

type NoteCardProps = {
  note: any
}

export default function NoteCard({ note }: NoteCardProps) {

  const isImage = note.file_url?.match(
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i
  )

  return (
    <article className="note-card">

      <h2>
        <Link href={`/notes/${note.id}`}>
          {note.title}
        </Link>
      </h2>

      <div className="note-category">
        📁 {note.categories?.name}
      </div>

      <p>
        {note.content}
      </p>

      {note.file_url && (
        <div className="note-attachment">

          {isImage ? (
            <AttachmentImage
              src={note.file_url}
            />
          ) : (
            <div className="file-attachment">
              📎 첨부파일
            </div>
          )}

        </div>
      )}

      <small>
        {new Date(note.created_at).toLocaleString()}
      </small>

    </article>
  )
}

