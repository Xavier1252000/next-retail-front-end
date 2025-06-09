import ClientDetailsForm from '@/components/users/addClientDetails/addClientDetails'
import AddUserPermissions from '@/components/users/manageUserPermissions/addUserPermissions/addUserPermissions'
import React from 'react'

async function ManageUser({params}:{params:Promise<{userId: string}>}) {
    const userId = (await params).userId
  return (
    <div>
      <AddUserPermissions userId={userId}/>
    </div>
  )
}

export default ManageUser