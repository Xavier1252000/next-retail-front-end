import AddUnitMaster from '@/components/masters/unitMaster/addUnitMaster';
import React from 'react'

async function page({params}:{params:Promise<{unitMasterId:string}>}) {
    const unitMasterId = (await params).unitMasterId;
  return (
    <div>
      <AddUnitMaster unitMasterId={unitMasterId} />
    </div>
  )
}

export default page
