'use client';

import DynamicAdminBodaPage from '../[slug]/admin/page';

export default function AdminBodaDefaultPage() {
  return <DynamicAdminBodaPage params={Promise.resolve({ slug: 'mirta-y-guillermo' })} />;
}
