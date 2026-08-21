'use client'

import { useState } from 'react'

export default function AttachmentImage({
  src,
}: {
  src: string
}) {
  const [error, setError] =
    useState(false)

  if (error) {
    return (
      <div className="file-error">
        ⚠️ 파일을 찾을 수 없습니다.
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="첨부 이미지"
      onError={() =>
        setError(true)
      }
    />
  )
}