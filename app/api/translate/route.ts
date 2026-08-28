import { NextResponse } from 'next/server'

const DEEPL_API_URL =
  'https://api-free.deepl.com/v2/translate'

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json()

    const {
      text,
      sourceLang,
      targetLang,
    } = body

    if (
      !text ||
      !sourceLang ||
      !targetLang
    ) {
      return NextResponse.json(
        {
          error:
            '번역할 내용을 입력해주세요.',
        },
        { status: 400 }
      )
    }

    const apiKey =
      process.env.DEEPL_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'DeepL API 키가 설정되지 않았습니다.',
        },
        { status: 500 }
      )
    }

    const response =
      await fetch(DEEPL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization':
            `DeepL-Auth-Key ${apiKey}`,
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body:
          new URLSearchParams({
            text,
            source_lang:
              sourceLang,
            target_lang:
              targetLang,
          }),
      })

    const data =
      await response.json()

    if (!response.ok) {
      console.error(
        'DeepL API Error:',
        data
      )

      return NextResponse.json(
        {
          error:
            data.message ||
            'DeepL 번역에 실패했습니다.',
        },
        {
          status:
            response.status,
        }
      )
    }

    const result =
      data?.translations?.[0]?.text

    if (!result) {
      return NextResponse.json(
        {
          error:
            '번역 결과가 없습니다.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      result,
    })
  } catch (error) {
    console.error(
      'Translation Error:',
      error
    )

    return NextResponse.json(
      {
        error:
          '번역 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}