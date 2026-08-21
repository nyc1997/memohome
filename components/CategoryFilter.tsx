
'use client'

import { useRouter } from 'next/navigation'

type Category = {
  id: number
  name: string
}

type Props = {
  categories: Category[]
  currentCategory: string
}

export default function CategoryFilter({
  categories,
  currentCategory,
}: Props) {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const category = e.target.value

    if (category) {
      router.push(`/?category=${category}`)
    } else {
      router.push('/')
    }
  }

  return (
    <select
      value={currentCategory}
      onChange={handleChange}
    >
      <option value="">전체 카테고리</option>

      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  )
}

