import React from 'react';

interface ViewHeaderStat {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'info' | 'warning' | 'success';
}

interface ContextPill {
  label: string;
  value: string;
  helper?: string;
  indicator?: ViewHeaderIndicator;

  tone?: 'neutral' | 'info' | 'warning' | 'success';
}

interface ViewHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  accentColorClass?: string;
  contextPill?: ContextPill;
  stats?: ViewHeaderStat[];
  isOnline: boolean;
  className?: string;
}

const indicatorClasses: Record<ViewHeaderIndicator, string> = {
  neutral: 'border-border bg-muted/30 text-muted-foreground',
  positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  negative: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

const pillToneClasses: Record<Required<ContextPill>['tone'], string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
  warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
};

const statToneClasses: Record<Required<ViewHeaderStat>['tone'], string> = {
  neutral: 'bg-card/60 border border-border text-foreground',
  info: 'bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
};

const getToneClass = <T extends { tone?: 'neutral' | 'info' | 'warning' | 'success' }>(map: Record<'neutral' | 'info' | 'warning' | 'success', string>, item?: T) => {
  const tone = item?.tone ?? 'neutral';
  return map[tone];
};

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  description,
  icon,
  accentColorClass = 'bg-primary/10 text-primary border border-primary/10',
  contextPill,
  stats,
  isOnline,
  className = '',
}) => {
  return (
    <section className={`mb-6 rounded-[--radius] border border-border/60 bg-card/70 shadow-sm backdrop-blur ${className}`.trim()} aria-labelledby="view-heading">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accentColorClass}`} aria-hidden>
                {icon}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 id="view-heading" className="text-2xl font-semibold text-foreground">
                  {title}
                </h1>
                {contextPill && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getToneClass(pillToneClasses, contextPill)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                    {contextPill.label}
                  </span>
                )}
              </div>
              {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                isOnline
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}
                aria-hidden
              ></span>
              {isOnline ? 'Realtime sync' : 'Offline mode'}
            </span>
            {stats?.map(stat => (
              <div
                key={stat.label}
                className={`flex min-w-[140px] flex-col rounded-lg px-3 py-2 text-sm shadow-sm ${getToneClass(statToneClasses, stat)}`}
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">{stat.label}</span>
                <span className="text-lg font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
