import React, { useMemo } from 'react';

export type ViewHeaderIndicator = 'neutral' | 'positive' | 'negative' | 'warning';

type ViewHeaderView = 'dashboard' | 'projects' | 'clients' | 'invoices' | 'all-tasks';

interface ViewHeaderStat {
  label: string;
  value: number | string;
  tone?: 'neutral' | 'info' | 'warning' | 'success';
}

interface ContextPill {
  label: string;
  value?: string;
  helper?: string;
  indicator?: ViewHeaderIndicator;
  tone?: 'neutral' | 'info' | 'warning' | 'success';
}

interface ViewHeaderMetaItem {
  label: string;
  value: string;
  helper?: string;
  indicator?: ViewHeaderIndicator;
}

interface ViewHeaderProps {
  title: string;
  description?: string;
  view?: ViewHeaderView | string;
  icon?: React.ReactNode;
  accentColorClass?: string;
  contextPill?: ContextPill;
  meta?: ViewHeaderMetaItem[];
  stats?: ViewHeaderStat[];
  actions?: React.ReactNode;
  isOnline?: boolean;
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

const metaIndicatorClasses: Record<ViewHeaderIndicator, string> = {
  neutral: 'border-border text-muted-foreground',
  positive: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-300',
  warning: 'border-amber-500/30 text-amber-600 dark:text-amber-300',
  negative: 'border-rose-500/30 text-rose-600 dark:text-rose-300',
};

const getToneClass = <T extends { tone?: 'neutral' | 'info' | 'warning' | 'success' }>(
  map: Record<'neutral' | 'info' | 'warning' | 'success', string>,
  item?: T,
) => {
  const tone = item?.tone ?? 'neutral';
  return map[tone];
};

const VIEW_PRESETS: Record<ViewHeaderView, { icon: React.ReactNode; accent: string }> = {
  dashboard: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13h4l3 6 4-16 3 10h4" />
      </svg>
    ),
    accent: 'bg-primary/10 text-primary border border-primary/20',
  },
  projects: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7v10l-9 4-9-4V7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l9-4 9 4" />
      </svg>
    ),
    accent: 'bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:text-sky-300',
  },
  clients: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20H4v-2a3 3 0 015.356-1.857" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
    accent: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-300',
  },
  invoices: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11h6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15h3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h9l3 3v15H6z" />
      </svg>
    ),
    accent: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-300',
  },
  'all-tasks': {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
      </svg>
    ),
    accent: 'bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:text-violet-300',
  },
};

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  description,
  view,
  icon,
  accentColorClass,
  contextPill,
  meta,
  stats,
  actions,
  isOnline,
  className = '',
}) => {
  const { resolvedIcon, resolvedAccent } = useMemo(() => {
    const preset = (view && VIEW_PRESETS[view as ViewHeaderView]) || null;
    return {
      resolvedIcon: icon ?? preset?.icon ?? null,
      resolvedAccent: accentColorClass ?? preset?.accent ?? 'bg-primary/10 text-primary border border-primary/10',
    };
  }, [accentColorClass, icon, view]);

  const showConnectionState = typeof isOnline === 'boolean';

  return (
    <section
      className={`mb-6 rounded-[--radius] border border-border/60 bg-card/70 shadow-sm backdrop-blur ${className}`.trim()}
      aria-labelledby="view-heading"
    >
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {resolvedIcon && (
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${resolvedAccent}`} aria-hidden>
                {resolvedIcon}
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 id="view-heading" className="text-2xl font-semibold text-foreground">
                  {title}
                </h1>
                {contextPill && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getToneClass(
                      pillToneClasses,
                      contextPill,
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden></span>
                    {contextPill.label}
                    {contextPill.value && <span className="font-normal normal-case text-[11px]">{contextPill.value}</span>}
                  </span>
                )}
              </div>
              {description && <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>}
              {contextPill?.helper && <p className="text-xs text-muted-foreground/80">{contextPill.helper}</p>}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            {showConnectionState && (
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
            )}
          </div>
        </div>

        {meta && meta.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {meta.map(item => (
              <div
                key={item.label}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/80 p-4 shadow-sm"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-foreground">{item.value}</span>
                  {item.indicator && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase ${
                        metaIndicatorClasses[item.indicator]
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden></span>
                      {item.indicator === 'positive'
                        ? 'Stable'
                        : item.indicator === 'negative'
                        ? 'Critical'
                        : item.indicator === 'warning'
                        ? 'Attention'
                        : 'Normal'}
                    </span>
                  )}
                </div>
                {item.helper && <p className="text-xs text-muted-foreground">{item.helper}</p>}
              </div>
            ))}
          </div>
        )}

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {stats.map(stat => (
              <div
                key={stat.label}
                className={`flex min-w-[140px] flex-col rounded-lg px-3 py-2 text-sm shadow-sm ${getToneClass(statToneClasses, stat)}`}
              >
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">{stat.label}</span>
                <span className="text-lg font-semibold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
