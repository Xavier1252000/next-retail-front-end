// /app/masters/taxMaster/addTaxMaster/page.tsx (App Router)

'use client';

import AddTaxMasterForm from '@/components/masters/taxMaster/addTaxMaster/addTaxMaster';
import { useSearchParams } from 'next/navigation';
import React from 'react';

function Page() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  return (
    <div>
      <h1 className="text-xl font-bold">Add Tax Master</h1>
      <AddTaxMasterForm />
    </div>
  );
}

export default Page;
