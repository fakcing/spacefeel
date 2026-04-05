import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : null
  if (!name || name.length < 1 || name.length > 50) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ ok: true })
}
