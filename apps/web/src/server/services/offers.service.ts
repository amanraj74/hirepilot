import { createElement } from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/server/db';
import { OfferLetterDocument, type OfferLetterData } from '@/server/pdf/offer-letter';

export class OfferError extends Error {
  constructor(
    public readonly status: 403 | 404 | 409 | 422,
    message: string,
  ) {
    super(message);
    this.name = 'OfferError';
  }
}

type RecruiterCtx = { userId: string; companyId: string | null };

export async function generateOfferPdf(data: OfferLetterData): Promise<Buffer> {
  // .ts file — cast to ReactElement<any> because react-pdf's typing is narrower
  // than React.createElement's return type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(OfferLetterDocument, { data }) as any;
  const buffer = await renderToBuffer(element);
  return buffer;
}

export async function sendOffer(
  ctx: RecruiterCtx,
  input: {
    applicationId: string;
    salaryAmount: number;
    salaryCurrency: string;
    joiningDate: Date;
    expiresAt?: Date;
    location?: string;
    benefits: string[];
    bodyMarkdown?: string;
  },
) {
  const application = await prisma.application.findUnique({
    where: { id: input.applicationId },
    include: {
      job: {
        include: {
          company: { select: { id: true, name: true, website: true } },
          postedBy: { select: { id: true, name: true, email: true } },
        },
      },
      candidate: { select: { id: true, name: true, email: true } },
    },
  });
  if (!application) throw new OfferError(404, 'Application not found');

  const isOwner = application.job.postedById === ctx.userId;
  const isCompanyJob = ctx.companyId !== null && application.job.companyId === ctx.companyId;
  if (!isOwner && !isCompanyJob)
    throw new OfferError(403, 'You do not have access to this application');

  // Refuse if application is at a terminal stage that doesn't fit an offer.
  if (application.stage === 'REJECTED' || application.stage === 'HIRED') {
    throw new OfferError(
      409,
      `Cannot send an offer: application is already ${application.stage.toLowerCase()}.`,
    );
  }

  // One active offer per application.
  const existing = await prisma.offerLetter.findFirst({
    where: {
      applicationId: application.id,
      status: { notIn: ['REJECTED', 'EXPIRED', 'RESCINDED'] },
    },
  });
  if (existing) {
    throw new OfferError(
      409,
      'An offer is already active for this candidate. Rescind the current one first.',
    );
  }

  const candidateName =
    application.candidate.name ?? application.candidate.email.split('@')[0] ?? 'Candidate';
  const senderName =
    application.job.postedBy.name ?? application.job.postedBy.email.split('@')[0] ?? 'Hiring team';
  const expiresAt = input.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Build the PDF.
  const pdfData: OfferLetterData = {
    candidateName,
    roleTitle: application.job.title,
    companyName: application.job.company.name,
    location: input.location ?? application.job.location,
    workMode: application.job.workMode,
    salaryAmount: input.salaryAmount,
    salaryCurrency: input.salaryCurrency,
    joiningDate: input.joiningDate,
    expiresAt,
    benefits: input.benefits,
    bodyMarkdown: input.bodyMarkdown?.trim() || undefined,
    senderName,
    senderTitle: 'Hiring Manager',
    companyWebsite: application.job.company.website,
    generatedAt: new Date(),
  };

  const pdfBuffer = await generateOfferPdf(pdfData);

  // In dev we don't persist to S3 — store the PDF as a data URL placeholder.
  // In prod the service would upload to Cloudinary and store the URL.
  const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

  const offer = await prisma.$transaction(async (tx) => {
    const row = await tx.offerLetter.create({
      data: {
        applicationId: application.id,
        candidateId: application.candidateId,
        companyId: application.job.companyId,
        candidateNameSnapshot: candidateName,
        roleSnapshot: application.job.title,
        salaryAmount: input.salaryAmount,
        salaryCurrency: input.salaryCurrency,
        joiningDate: input.joiningDate,
        location: input.location ?? application.job.location,
        benefits: input.benefits,
        templateUsed: 'standard-v1',
        bodyMarkdown: input.bodyMarkdown?.trim() ?? '',
        pdfUrl: pdfDataUrl,
        status: 'SENT',
        sentAt: new Date(),
        expiresAt,
      },
    });

    // Move application to OFFER stage.
    await tx.application.update({
      where: { id: application.id },
      data: { stage: 'OFFER', updatedAt: new Date() },
    });

    // Pipeline history entry.
    const history = Array.isArray(application.stageHistory)
      ? (application.stageHistory as unknown[])
      : [];
    await tx.application.update({
      where: { id: application.id },
      data: {
        stageHistory: [
          ...history,
          { from: application.stage, to: 'OFFER', by: ctx.userId, at: new Date().toISOString() },
        ] as unknown as object,
      },
    });

    // Notify the candidate.
    await tx.notification.create({
      data: {
        userId: application.candidateId,
        type: 'OFFER_RECEIVED',
        title: 'You received an offer',
        message: `${senderName} at ${application.job.company.name} sent you an offer for ${application.job.title}.`,
        link: '/applications',
      },
    });

    return row;
  });

  return { offer, pdfBuffer };
}

export async function candidateAcceptOffer(userId: string, offerId: string) {
  const offer = await prisma.offerLetter.findUnique({
    where: { id: offerId },
    include: {
      application: { select: { id: true, candidateId: true, stage: true } },
    },
  });
  if (!offer) throw new OfferError(404, 'Offer not found');
  if (offer.application.candidateId !== userId) {
    throw new OfferError(403, 'This offer is not for you');
  }
  if (offer.status !== 'SENT') {
    throw new OfferError(409, `Offer is ${offer.status.toLowerCase()} — cannot accept`);
  }
  if (offer.expiresAt && offer.expiresAt.getTime() < Date.now()) {
    throw new OfferError(409, 'This offer has expired');
  }

  await prisma.$transaction([
    prisma.offerLetter.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED', respondedAt: new Date() },
    }),
    prisma.application.update({
      where: { id: offer.application.id },
      data: { stage: 'HIRED', decidedAt: new Date() },
    }),
  ]);

  return { ok: true };
}

export async function candidateRejectOffer(userId: string, offerId: string) {
  const offer = await prisma.offerLetter.findUnique({
    where: { id: offerId },
    include: { application: { select: { id: true, candidateId: true } } },
  });
  if (!offer) throw new OfferError(404, 'Offer not found');
  if (offer.application.candidateId !== userId) {
    throw new OfferError(403, 'This offer is not for you');
  }
  if (offer.status !== 'SENT') {
    throw new OfferError(409, `Offer is ${offer.status.toLowerCase()} — cannot reject`);
  }

  await prisma.$transaction([
    prisma.offerLetter.update({
      where: { id: offerId },
      data: { status: 'REJECTED', respondedAt: new Date() },
    }),
    prisma.application.update({
      where: { id: offer.application.id },
      data: { stage: 'REJECTED', decidedAt: new Date() },
    }),
  ]);

  return { ok: true };
}
