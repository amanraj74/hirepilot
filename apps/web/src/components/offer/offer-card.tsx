import { Check, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
  SENT: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  ACCEPTED: 'bg-green-500/15 text-green-700 dark:text-green-400',
  REJECTED: 'bg-red-500/15 text-red-700 dark:text-red-400',
  EXPIRED: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  RESCINDED: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400',
};

export function OfferCard({
  offer,
  companyName,
  jobTitle,
}: {
  offer: {
    id: string;
    status: string;
    salaryAmount: number;
    salaryCurrency: string;
    joiningDate: Date | string;
    location: string | null;
    benefits: string[];
    bodyMarkdown: string | null;
    pdfUrl: string | null;
    expiresAt: Date | string | null;
    sentAt: Date | string;
  };
  candidateName?: string;
  companyName: string;
  jobTitle: string;
}) {
  const canRespond = offer.status === 'SENT';
  const salaryRange = formatMoney(offer.salaryAmount, offer.salaryCurrency);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">🎉 Offer from {companyName}</CardTitle>
            <CardDescription>
              For the {jobTitle} role · {salaryRange}/yr · starting {formatDate(offer.joiningDate)}
            </CardDescription>
          </div>
          <span
            className={cn(
              'inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold',
              STATUS_COLOR[offer.status] ?? 'bg-muted',
            )}
          >
            {offer.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {offer.benefits.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Benefits
            </p>
            <ul className="space-y-0.5 text-sm">
              {offer.benefits.slice(0, 4).map((b) => (
                <li key={b}>· {b}</li>
              ))}
              {offer.benefits.length > 4 && (
                <li className="text-xs text-muted-foreground">
                  +{offer.benefits.length - 4} more in the PDF
                </li>
              )}
            </ul>
          </div>
        )}
        {offer.expiresAt && offer.status === 'SENT' && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Offer expires {formatDate(offer.expiresAt)}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-end gap-2">
        {offer.pdfUrl && (
          <Button asChild variant="outline" size="sm">
            <a href={offer.pdfUrl} download={`offer-${jobTitle}.pdf`}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Download PDF
            </a>
          </Button>
        )}
        {canRespond ? (
          <>
            <form action={`/api/candidate/offers/${offer.id}/reject`} method="post">
              <Button type="submit" variant="outline" size="sm">
                <X className="h-4 w-4" aria-hidden="true" />
                Decline
              </Button>
            </form>
            <form action={`/api/candidate/offers/${offer.id}/accept`} method="post">
              <Button type="submit" size="sm">
                <Check className="h-4 w-4" aria-hidden="true" />
                Accept offer
              </Button>
            </form>
          </>
        ) : offer.status === 'ACCEPTED' ? (
          <Badge variant="secondary">Accepted — you&rsquo;re hired!</Badge>
        ) : offer.status === 'REJECTED' ? (
          <Badge variant="destructive">Declined</Badge>
        ) : (
          <Badge variant="outline">Closed</Badge>
        )}
      </CardFooter>
    </Card>
  );
}

function formatMoney(n: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
