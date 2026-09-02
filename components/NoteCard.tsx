import Link from 'next/link'
import AttachmentImage from '../app/notes/edit/AttachmentImage'

type NoteCardProps = {
  note: any
  number: number
}

function LinkifyText({
  text,
}: {
  text: string
}) {
  const urlRegex =
    /(https?:\/\/[^\s]+)/g

  const parts = text.split(urlRegex)

  return (
    <>
      {parts.map((part, index) => {

        if (
          part.startsWith('http://') ||
          part.startsWith('https://')
        ) {
          const match =
            part.match(/^(.+?)([.,!?;:)]*)$/)

          const url = match?.[1] || part
          const punctuation =
            match?.[2] || ''

          return (
            <span key={index}>
              🔗{' '}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {url}
              </a>
              {punctuation}
            </span>
          )
        }

        return (
          <span key={index}>
            {part}
          </span>
        )
      })}
    </>
  )
}

export default function NoteCard({
  note,
  number,
}: NoteCardProps) {

  const isImage =
    note.file_url?.match(
      /\.(jpg|jpeg|png|gif|webp|bmp)$/i
    )

  return (
    <article className="note-card">

      {/* 이미지 */}
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

      {/* 제목 */}
      <h2>
        <Link href={`/notes/${note.id}`}>
          {number}. {note.title}
        </Link>
      </h2>

      {/* 카테고리 */}
      <div className="note-category">
        📁 {note.categories?.name}
      </div>

      {/* 내용 - 최대 7줄 */}
      <p className="note-preview">
        <LinkifyText
          text={note.content || ''}
        />
      </p>

      {/* 작성일 */}
      <small>
        {new Date(
          note.created_at
        ).toLocaleString()}
      </small>

    </article>
  )
}