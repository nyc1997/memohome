import { NextResponse } from 'next/server'
import { supabase } from '../../../../../lib/supabase'

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  const { id } = await params

  // 현재 첨부파일 URL 가져오기
  const { data: note, error } =
    await supabase
      .from('notes')
      .select('file_url')
      .eq('id', id)
      .single()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }

  if (!note.file_url) {
    return NextResponse.json({
      success: true,
    })
  }


  // Storage 파일 경로 추출
  const marker =
    '/storage/v1/object/public/attachments/'

  const markerIndex =
    note.file_url.indexOf(marker)

  if (markerIndex !== -1) {
    const filePath =
      note.file_url.substring(
        markerIndex + marker.length
      )

    // 실제 Storage 파일 삭제
    const { error: storageError } =
      await supabase.storage
        .from('attachments')
        .remove([filePath])

    if (storageError) {
      console.error(
        'Storage 삭제 오류:',
        storageError
      )
    }
  }


  // DB의 file_url 제거
  const { error: updateError } =
    await supabase
      .from('notes')
      .update({
        file_url: null,
      })
      .eq('id', id)

  if (updateError) {
    return NextResponse.json(
      {
        error:
          updateError.message,
      },
      {
        status: 500,
      }
    )
  }

  return NextResponse.json({
    success: true,
  })
}