'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ApiResult = {
  data?: {
    ok: boolean;
    skills: string[];
    skillCount: number;
    yearsExperience: number;
    degreeLevel: string;
  };
};

export function ResumeUploader({
  currentSkills,
  currentYears,
  currentDegree,
  resumeUpdatedAt,
  profileCompletion,
}: {
  currentSkills: string[];
  currentYears: number | null;
  currentDegree: string;
  resumeUpdatedAt: Date | string | null;
  profileCompletion: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  async function upload(f: File) {
    const fd = new FormData();
    fd.append('file', f);
    startTransition(async () => {
      try {
        const res = await fetch('/api/me/resume', { method: 'POST', body: fd });
        // Try to parse JSON; if the server returned HTML (e.g. an
        // Nginx 502 or Vercel edge error page), the response isn't
        // JSON and res.json() throws. Catch that specifically and
        // surface a useful message.
        let json: ApiResult & { title?: string };
        try {
          json = (await res.json()) as typeof json;
        } catch {
          toast.error(`Upload failed: server returned ${res.status} ${res.statusText} (non-JSON)`);
          return;
        }
        if (!res.ok) {
          const title = json.title ?? `Upload failed (${res.status})`;
          toast.error(title);
          return;
        }
        if (json.data?.ok) {
          toast.success(`Resume parsed: ${json.data.skillCount} skills extracted`);
          router.refresh();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Network error: ${msg}`);
      }
    });
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      void upload(dropped);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Resume</CardTitle>
        <CardDescription>
          PDF, DOCX, or TXT · max 10MB. We parse it deterministically — no LLM — and auto-fill your
          profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label
          htmlFor="resume-upload"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          }`}
        >
          {pending ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Parsing your resume&hellip;</p>
            </>
          ) : file ? (
            <>
              <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB · parsing&hellip;
              </p>
            </>
          ) : (
            <>
              <Upload className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm font-medium">Drop your resume here or click to browse</p>
              <p className="text-xs text-muted-foreground">PDF · DOCX · TXT</p>
            </>
          )}
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx,.doc,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="sr-only"
            onChange={(e) => {
              const picked = e.target.files?.[0];
              if (picked) {
                setFile(picked);
                void upload(picked);
              }
            }}
          />
        </label>

        {currentSkills.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Detected skills ({currentSkills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentSkills.slice(0, 20).map((s) => (
                <Badge key={s} variant="secondary" className="font-normal">
                  {s}
                </Badge>
              ))}
              {currentSkills.length > 20 && (
                <span className="text-xs text-muted-foreground">
                  +{currentSkills.length - 20} more
                </span>
              )}
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Experience</dt>
            <dd className="mt-0.5 font-medium">
              {currentYears !== null && currentYears > 0 ? `${currentYears} years` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Education</dt>
            <dd className="mt-0.5 font-medium">{currentDegree !== 'NONE' ? currentDegree : '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Profile completion
            </dt>
            <dd className="mt-1.5">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <span className="font-mono text-xs">{profileCompletion}%</span>
              </div>
              {resumeUpdatedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Last parsed {new Date(resumeUpdatedAt).toLocaleString()}
                </p>
              )}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
