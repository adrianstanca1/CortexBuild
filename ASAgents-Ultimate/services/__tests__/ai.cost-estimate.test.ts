// @ts-nocheck - Test file with type issues
import { beforeEach, describe, expect, it } from 'vitest';
import { generateCostEstimate } from '../ai';

describe('generateCostEstimate', () => {
  beforeEach(() => {
    delete (process.env as Record<string, string | undefined>).VITE_GEMINI_API_KEY;
    delete (process.env as Record<string, string | undefined>).GEMINI_API_KEY;
  });

  it.skip('produces a deterministic fallback when Gemini is unavailable', async () => {
    const result = await generateCostEstimate({
      description: 'Refurbish 3-storey office with collaboration zones and cafe.',
      squareFootage: 4500,
      quality: 'standard',
    });

    expect(result.isFallback).toBe(true);
    expect(result.totalEstimate).toBeGreaterThan(0);
    expect(result.breakdown.length).toBeGreaterThanOrEqual(3);
    expect(result.metadata).toMatchObject({
      quality: 'standard',
      squareFootage: 4500,
      currency: 'GBP',
      isFallback: true,
    });
  });

  it('throws when required inputs are missing', async () => {
    await expect(
      generateCostEstimate({ description: ' ', squareFootage: 0, quality: 'basic' }),
    ).rejects.toThrow('Description and positive square footage are required to estimate costs.');
  });
});
