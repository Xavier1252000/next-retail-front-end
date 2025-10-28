import AddDiscountMaster from '@/components/masters/discountMaster/addDiscountMaster'
import React from 'react'

async function page({params}:{params:Promise<{discountMasterId:string}>}) {
    const discountMasterId = (await params).discountMasterId;
  return (
    <AddDiscountMaster discountMasterId={discountMasterId} />
  )
}

export default page