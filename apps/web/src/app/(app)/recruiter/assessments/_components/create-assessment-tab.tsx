'use client';

// Client wrapper for AssessmentBuilder so the page (a Server
// Component) can pass an onSuccess event handler. Server Components
// can't pass functions to Client Components; this small wrapper
// holds the closure so the page stays a Server Component.

import { AssessmentBuilder } from '@/components/assessment/assessment-builder';

export function CreateAssessmentTab() {
  return (
    <AssessmentBuilder
      onSuccess={() => {
        window.location.href = '/recruiter/assessments';
      }}
    />
  );
}
