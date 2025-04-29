import ClientDetailsForm from '@/components/users/addClientDetails/addClientDetails'
import React from 'react'

async function page({params}:{params:Promise<{userId: string}>}) {
    const userId = (await params).userId
  return (
    
    <div>
      <h1><ClientDetailsForm  userId={userId} /></h1>
    </div>
  )
}

export default page
