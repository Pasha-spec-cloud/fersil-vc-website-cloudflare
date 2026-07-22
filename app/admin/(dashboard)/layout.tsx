import { ReactNode } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-16 pt-10">
      <AdminNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
