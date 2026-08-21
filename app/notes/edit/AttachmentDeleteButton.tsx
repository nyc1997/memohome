'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AttachmentDeleteButton({
  id,
}: {
  id: string
}) {
  const router = useRouter()

  const [deleting, setDeleting] =
    useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        '이 첨부파일을 삭제하시겠습니까?'
      )
    ) {
      return
    }

    setDeleting(true)

    try {
      const response =
        await fetch(
          `/api/notes/${id}/attachment`,
          {
            method: 'DELETE',
          }
        )

      if (!response.ok) {
        throw new Error(
          '첨부파일 삭제에 실패했습니다.'
        )
      }

      router.refresh()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '삭제에 실패했습니다.'
      )

      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="action-button"
    >
      {deleting
        ? '삭제 중...'
        : '첨부파일 삭제'}
    </button>
  )
}