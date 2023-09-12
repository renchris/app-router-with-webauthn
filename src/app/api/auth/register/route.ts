import { NextResponse } from 'next/server'
import { User } from '@prisma/client'
import { getSession } from '@lib/session'
// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  try {
    const requestBody = await request.json()
    const { user }: { user: User } = requestBody
    const response = NextResponse.json({ message: 'ok' })

    const session = await getSession(request, response)

    session.userId = user.id

    await session.save()

    return response
  } catch (error: unknown) {
    console.error((error as Error).message)
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 })
  }
}
