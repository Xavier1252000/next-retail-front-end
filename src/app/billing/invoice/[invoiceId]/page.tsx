import InvoiceById from '@/components/billing/invoiceById'
import React from 'react'

async function page({params}:{params:Promise<{invoiceId:string}>}) {
  const invoiceId = (await params).invoiceId
  return (<>
    <InvoiceById invoiceId={invoiceId} />
    </>
  )
}

export default page