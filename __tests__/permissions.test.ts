import { can } from '../permissions';

describe('permissions.can', () => {
  it('allows super_admin to do anything', () => {
    expect(can('super_admin' as any, 'delete' as any, 'task' as any)).toBe(true);
  });

  it('allows company_admin to manage tasks', () => {
    expect(can('company_admin' as any, 'create' as any, 'task' as any)).toBe(true);
    expect(can('company_admin' as any, 'delete' as any, 'task' as any)).toBe(true);
  });

  it('denies operative deleting tasks', () => {
    expect(can('operative' as any, 'delete' as any, 'task' as any)).toBe(false);
  });
});


