// @ts-nocheck - Test file with type issues
import { describe, expect, it, vi } from 'vitest';

const createMockLocalStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  } as Storage;
};

const importApi = async () => {
  vi.resetModules();
  (globalThis as any).localStorage = createMockLocalStorage();
  const module = await import('./mockApi');
  return module.api;
};

describe('mockApi financial aggregations', () => {
  it('derives KPIs from stored invoices and expenses', async () => {
    const api = await importApi();

    const kpis = await api.getFinancialKPIsForCompany('1');

    expect(kpis.currency).toBe('GBP');
    expect(kpis.cashFlow).toBeCloseTo(114850, 2);
    expect(kpis.profitability).toBeCloseTo(99.9, 1);
    expect(kpis.projectMargin).toBeCloseTo(11.3, 1);
  });

  it('summarises monthly revenue and profit signals', async () => {
    const api = await importApi();

    const monthly = await api.getMonthlyFinancials('1');

    expect(monthly).toHaveLength(1);
    expect(monthly[0].month.toLowerCase()).toContain('jan');
    expect(monthly[0].revenue).toBeCloseTo(115000, 2);
    expect(monthly[0].profit).toBeCloseTo(114850, 2);
  });

  it('builds a cost breakdown grouped by category', async () => {
    const api = await importApi();

    const breakdown = await api.getCostBreakdown('1');

    expect(breakdown).toEqual([
      {
        category: 'Other',
        amount: 150,
      },
    ]);
  });
});
