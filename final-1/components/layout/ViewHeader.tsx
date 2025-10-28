import React from 'react';
import { View } from '../../types';
import { viewMetadata } from '../../utils/viewAccess';

export type ViewHeaderIndicator = 'neutral' | 'positive' | 'warning' | 'negative';

export interface ViewHeaderMetaItem {
  label: string;
  value: string;
  helper?: string;
  indicator?: ViewHeaderIndicator;
}

interface ViewHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: ViewHeaderMetaItem[];
  breadcrumbs?: Array<{ label: string; onClick?: () => void; view?: View }>;
  view?: View;
  className?: string;
}

const indicatorClasses: Record<ViewHeaderIndicator, string> = {
  neutral: 'border-border bg-muted/30 text-muted-foreground',
  positive: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  negative: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  meta,
  breadcrumbs,
  view,
  className = '',
}) => {
  const resolvedTitle = title ?? (view ? viewMetadata[view]?.title : undefined);
  const resolvedDescription = description ?? (view ? viewMetadata[view]?.description : undefined);

  return (
    <section
      className={`relative overflow-hidden rounded-[--radius] border border-border bg-card/80 p-6 shadow-sm backdrop-blur ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent dark:from-primary/60" />
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          {icon ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {icon}
            </div>
          ) : null}
          <div>
            {breadcrumbs?.length ? (
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.label}>
                    {index > 0 && <span className="opacity-60">/</span>}
                    {crumb.onClick ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className="font-semibold text-muted-foreground transition-colors hover:text-primary"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span>{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : null}
            {resolvedTitle ? <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{resolvedTitle}</h1> : null}
            {resolvedDescription ? (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{resolvedDescription}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-3 text-sm">{actions}</div> : null}
      </div>

      {meta?.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meta.map((item) => (
            <div
              key={`${item.label}-${item.value}`}
              className={`rounded-lg border px-4 py-3 text-sm shadow-sm transition-colors ${
                indicatorClasses[item.indicator ?? 'neutral']
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-75">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
              {item.helper ? <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

