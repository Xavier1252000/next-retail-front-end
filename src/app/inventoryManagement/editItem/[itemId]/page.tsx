import EditItem from '@/components/inventoryManagement/editItem/editItem'
import React from 'react'

async function page({params}:{params:Promise<{itemId:string}>}) {
  const itemId = (await params).itemId
  return (
    <div>
      <EditItem itemId={itemId} />
    </div>
  )
}

export default page
