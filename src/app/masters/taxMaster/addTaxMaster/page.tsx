'use client';

import React, { Suspense } from 'react';
import AddTaxMasterForm from '@/components/masters/taxMaster/addTaxMaster/addTaxMaster';
import { useSearchParams } from 'next/navigation';

function AddTaxMasterContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get('storeId');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Add Tax Master</h1>
      <AddTaxMasterForm />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-muted-foreground">Loading tax master form...</div>}>
      <AddTaxMasterContent />
    </Suspense>
  );
}
