import { renderHook } from '@/tests/test-utils';
import useOrderTotals from '@/hooks/useOrderTotals';
import { describe, it, expect } from 'vitest';

describe('useOrderTotals', () => {
  it('should return initial zeros for empty items', () => {
    const { result } = renderHook(() => useOrderTotals([]));
    
    expect(result.current).toEqual({
      grossAmount: 0,
      totalDiscountAmount: 0,
      totalGstAmount: 0,
      finalAmount: 0,
    });
  });

  it('should calculate totals correctly with GST applicable', () => {
    const items = [
      {
        totalAmount: 100, // base
        discountAmount: 10,
        totalGstAmount: 16.2, // (100-10) * 0.18 for example
        finalAmount: 106.2,
      },
      {
        totalAmount: 200,
        discountAmount: 20,
        totalGstAmount: 32.4,
        finalAmount: 212.4,
      }
    ];

    const { result } = renderHook(() => useOrderTotals(items, true));

    expect(result.current.grossAmount).toBe(300);
    expect(result.current.totalDiscountAmount).toBe(30);
    expect(result.current.totalGstAmount).toBeCloseTo(48.6);
    expect(result.current.finalAmount).toBeCloseTo(318.6);
  });

  it('should ignore GST if gstApplicable is false', () => {
    const items = [
      {
        totalAmount: 100,
        discountAmount: 10,
        totalGstAmount: 18,
        finalAmount: 108,
      }
    ];

    const { result } = renderHook(() => useOrderTotals(items, false));

    expect(result.current.totalGstAmount).toBe(0);
    expect(result.current.grossAmount).toBe(100);
  });
});
