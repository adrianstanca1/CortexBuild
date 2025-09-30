import React, { useMemo, useState } from 'react';
import { Company, CompanyAccessSummary } from '../../types';

interface TenantSwitcherProps {
  company: Company | null;
  companies: CompanyAccessSummary[];
  activeCompanyId: string | null;
  onSwitch: (companyId: string) => Promise<void>;
  onRefresh?: () => Promise<void> | void;
}

const formatMembershipLabel = (summary: CompanyAccessSummary) => {
  if (summary.membershipType === 'primary') {
    return 'Primary';
  }
  if (summary.membershipType === 'platform') {
    return 'Platform';
  }
  return 'Delegated';
};

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  company,
  companies,
  activeCompanyId,
  onSwitch,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const activeSummary = useMemo(() => {
    return companies.find(summary => summary.id === activeCompanyId) ?? null;
  }, [companies, activeCompanyId]);

  const activeName = activeSummary?.name || company?.name || 'Select tenant';

  const handleSelect = async (companyId: string) => {
    if (companyId === activeCompanyId) {
      setIsOpen(false);
      return;
    }
    try {
      setIsSwitching(true);
      await onSwitch(companyId);
      setIsOpen(false);
    } finally {
      setIsSwitching(false);
    }
  };

  const showDropdown = companies.length > 1;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => showDropdown && setIsOpen(prev => !prev)}
        className={`flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors ${
          showDropdown ? 'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40' : ''
        } ${(!showDropdown && isSwitching) ? 'opacity-60 cursor-wait' : ''}`}
        disabled={!showDropdown && isSwitching}
      >
        <span className="truncate max-w-[180px] text-left">{activeName}</span>
        {showDropdown && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        {isSwitching && (
          <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
      </button>
      {isOpen && showDropdown && (
        <div className="absolute z-20 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Tenants</span>
            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                className="rounded px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-primary hover:bg-primary/10"
              >
                Refresh
              </button>
            )}
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {companies.map(summary => {
              const isActive = summary.id === activeCompanyId;
              return (
                <li key={summary.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(summary.id)}
                    className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{summary.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatMembershipLabel(summary)} · {summary.subscriptionPlan}
                      </span>
                    </div>
                    {isActive && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                        Active
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
