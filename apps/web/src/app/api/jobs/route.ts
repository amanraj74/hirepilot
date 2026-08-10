// Public GET /api/jobs — list published jobs with optional filters.
// Supports full-text search on title + description (Postgres ILIKE for now;
// add pg_trgm/tsvector in Day 4 for real ranking).

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db';
import { jobListQuerySchema } from '@/lib/validations/jobs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = jobListQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      {
        type: 'about:blank',
        title: 'Invalid query parameters',
        status: 400,
        detail: parsed.error.flatten(),
      },
      { status: 400, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const { q, location, workMode, employmentType, experienceLevel, minSalary, page, limit } =
    parsed.data;

  const where: Prisma.JobWhereInput = {
    status: 'OPEN',
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(location ? { location: { contains: location, mode: 'insensitive' } } : {}),
    ...(workMode ? { workMode } : {}),
    ...(employmentType ? { employmentType } : {}),
    ...(experienceLevel ? { experienceLevel } : {}),
    ...(minSalary ? { salaryMax: { gte: minSalary } } : {}),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        company: { select: { id: true, name: true, slug: true, logoUrl: true, industry: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    data: jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}
