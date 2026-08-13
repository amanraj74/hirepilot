'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type QuestionType = 'MCQ' | 'CODE' | 'SQL' | 'DEBUG';

type QuestionDraft = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctAnswer: string;
};

export function AssessmentBuilder({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(60);
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: crypto.randomUUID(),
      type: 'MCQ',
      prompt: '',
      options: ['', '', '', ''],
      correctAnswer: '',
    },
  ]);
  const [submitting, setSubmitting] = useState(false);

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        prompt: '',
        options: type === 'MCQ' ? ['', '', '', ''] : [],
        correctAnswer: '',
      },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, patch: Partial<QuestionDraft>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function submit() {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    const cleaned = questions
      .map((q) => {
        const opts = q.type === 'MCQ' ? q.options.map((o) => o.trim()).filter(Boolean) : [];
        return {
          type: q.type,
          prompt: q.prompt.trim(),
          options: q.type === 'MCQ' ? opts : undefined,
          solution: q.correctAnswer.trim() || undefined,
          points: 10,
          orderIndex: 0,
        };
      })
      .filter((q) => q.prompt.length > 0);

    if (cleaned.length === 0) {
      toast.error('Add at least one question with a prompt');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/recruiter/assessments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          durationMinutes: duration,
          passingScore,
          status: 'ACTIVE',
          questions: cleaned,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { title?: string };
        toast.error(j.title ?? 'Failed to create assessment');
        return;
      }
      toast.success('Assessment created');
      onSuccess();
      router.refresh();
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Full-Stack Engineer Screening"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What this assessment covers"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={240}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="passing">Passing score (%)</Label>
              <Input
                id="passing"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('MCQ')}>
              <Plus className="h-3 w-3" aria-hidden="true" /> MCQ
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('CODE')}>
              <Plus className="h-3 w-3" aria-hidden="true" /> Code
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('SQL')}>
              <Plus className="h-3 w-3" aria-hidden="true" /> SQL
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('DEBUG')}>
              <Plus className="h-3 w-3" aria-hidden="true" /> Debug
            </Button>
          </div>
        </div>

        <ol className="space-y-3">
          {questions.map((q, idx) => (
            <li key={q.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs">
                      {idx + 1}
                    </span>
                    {q.type}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(q.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Question prompt"
                    value={q.prompt}
                    onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                    rows={2}
                  />
                  {q.type === 'MCQ' && (
                    <>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Options (first option = correct)
                      </p>
                      <div className="space-y-1.5">
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {i + 1}.
                            </span>
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const opts = [...q.options];
                                opts[i] = e.target.value;
                                updateQuestion(q.id, { options: opts });
                              }}
                              placeholder={`Option ${i + 1}${i === 0 ? ' (correct)' : ''}`}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {q.type !== 'MCQ' && (
                    <div className="space-y-1.5">
                      <Label htmlFor={`correct-${q.id}`}>
                        Reference solution (for recruiter review)
                      </Label>
                      <Textarea
                        id={`correct-${q.id}`}
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        rows={9}
                        placeholder="Type your answer (recruiter-referenced)"
                        className="font-mono text-xs"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center justify-end">
        <Button size="lg" onClick={submit} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {submitting ? 'Creating…' : 'Create assessment'}
        </Button>
      </div>
    </div>
  );
}
