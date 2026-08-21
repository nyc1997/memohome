'use client'

import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DeleteButton({id}: {id: string}) {

  const router = useRouter()

  async function deleteNote() {

    const ok = confirm('삭제하시겠습니까?')

    if (!ok) return

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
    } else {
      alert('삭제 완료')
      router.push('/')
    }
  }


  return (
    <button onClick={deleteNote}  className="action-button">
      삭제
    </button>
  )
}