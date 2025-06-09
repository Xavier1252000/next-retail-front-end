import ItemDetails from '@/components/inventoryManagement/itemDetails/itemDetails';
import React from 'react'

async function page({params}:{params:Promise<{itemId:string}>}) {
    const itemId = (await params).itemId;
  return (
    <div>
      <ItemDetails itemId={itemId} />
    </div>
  )
}

export default page
