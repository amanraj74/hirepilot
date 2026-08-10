'use client';

import { useTransition, useState } from 'react';
import { Copy, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { duplicateJobAction, deleteJobAction } from '../_actions';

export function JobActions({ jobId }: { jobId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dupPending, startDup] = useTransition();

  function onDuplicate() {
    startDup(async () => {
      try {
        await duplicateJobAction(jobId);
        toast.success('Job duplicated');
      } catch {
        toast.error('Failed to duplicate');
      }
    });
  }

  function onDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    startTransition(async () => {
      try {
        await deleteJobAction(jobId);
        toast.success('Job deleted');
      } catch {
        toast.error('Failed to delete');
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDuplicate}
        disabled={dupPending || pending}
      >
        {dupPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        Duplicate
      </Button>
      <Button
        type="button"
        variant={confirmDelete ? 'destructive' : 'outline'}
        size="sm"
        onClick={onDelete}
        disabled={pending || dupPending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
        {confirmDelete ? 'Confirm delete' : 'Delete'}
      </Button>
    </div>
  );
}
