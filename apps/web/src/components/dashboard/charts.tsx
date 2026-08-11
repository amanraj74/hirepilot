'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const COLORS = {
  APPLIED: '#3b82f6', // blue
  RESUME_SCREENING: '#6366f1', // indigo
  SHORTLISTED: '#8b5cf6', // violet
  TECHNICAL_INTERVIEW: '#f59e0b', // amber
  HR_INTERVIEW: '#f97316', // orange
  OFFER: '#10b981', // green
  HIRED: '#059669', // emerald
  REJECTED: '#ef4444', // red
};

const STAGE_LABEL: Record<keyof typeof COLORS, string> = {
  APPLIED: 'Applied',
  RESUME_SCREENING: 'Resume screening',
  SHORTLISTED: 'Shortlisted',
  TECHNICAL_INTERVIEW: 'Tech interview',
  HR_INTERVIEW: 'HR interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

export function PipelineFunnelChart({ byStage }: { byStage: Record<string, number> }) {
  const data = (Object.keys(COLORS) as Array<keyof typeof COLORS>).map((stage) => ({
    name: STAGE_LABEL[stage],
    value: byStage[stage] ?? 0,
    color: COLORS[stage],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hiring funnel</CardTitle>
        <CardDescription>Active candidates by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function PipelineStageDistribution({ byStage }: { byStage: Record<string, number> }) {
  const data = (Object.keys(COLORS) as Array<keyof typeof COLORS>)
    .map((stage) => ({
      name: STAGE_LABEL[stage],
      value: byStage[stage] ?? 0,
      fill: COLORS[stage],
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stage distribution</CardTitle>
          <CardDescription>Proportion of active candidates by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-sm text-muted-foreground">
            No active candidates yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stage distribution</CardTitle>
        <CardDescription>Proportion of active candidates by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                label={(entry) => `${entry.name}: ${entry.value}`}
                labelLine={false}
                fontSize={11}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionRateChart({ byStage }: { byStage: Record<string, number> }) {
  const data = (Object.keys(COLORS) as Array<keyof typeof COLORS>).map((stage) => ({
    name: STAGE_LABEL[stage],
    value: byStage[stage] ?? 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate progression</CardTitle>
        <CardDescription>Number of candidates at each stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                angle={-30}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function JobStatusSummary({ byStatus }: { byStatus: Record<string, number> }) {
  const labels: Record<string, string> = {
    OPEN: 'Open',
    PAUSED: 'Paused',
    CLOSED: 'Closed',
    FILLED: 'Filled',
    DRAFT: 'Draft',
  };
  const statusColors: Record<string, string> = {
    OPEN: '#10b981',
    PAUSED: '#f59e0b',
    CLOSED: '#6b7280',
    FILLED: '#3b82f6',
    DRAFT: '#a78bfa',
  };
  const data = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: labels[k] ?? k,
      value: v,
      color: statusColors[k] ?? '#999',
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your job postings</CardTitle>
        <CardDescription>Active jobs by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                allowDecimals={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function cn_helper() {
  return cn;
}
