'use client';
import React from 'react';
import { useAllUsers, UserData } from './useAllUsers'; // Adjust path as needed
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { UserFormData } from './useAddUser';

const AllUsersPage: React.FC = () => {
  const router = useRouter();

 

  const {
    formData,
    users,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useAllUsers();

  const handleAddNewUser = () =>{
    router.push("/addUser")
  }

  function handleManageUser(user: UserData):void {
    router.push(`all-users/manage-user/${user.id}`)
  }

  return (

    
    <div className="p-4">
      <div className="relative p-4">
      {/* Button positioned in top right */}
      <button
      onClick={handleAddNewUser}
        className="absolute top-6 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        Add New User
      </button>

      {/* Rest of your page content */}
      <div className="mt-20">
        {/* Your user table, content, etc */}
        <h1 className="text-2xl font-bold">All Users</h1>
      </div>
    </div>


      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 mb-6 items-end">
        <input
          type="number"
          name="index"
          placeholder="Index"
          value={formData.index}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="itemPerIndex"
          placeholder="Items Per Index"
          value={formData.itemPerIndex}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="roles"
          placeholder="Roles (comma separated)"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="userIds"
          placeholder="User IDs (comma separated)"
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="fromDate"
          value={formData.fromDate ? formData.fromDate.split('T')[0] : ''}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="toDate"
          value={formData.toDate ? formData.toDate.split('T')[0] : ''}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
          Active
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {isSubmitting ? 'Filtering...' : 'Filter'}
        </button>
      </form>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">First Name</th>
            <th className="border px-4 py-2">Last Name</th>
            <th className="border px-4 py-2">Username</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Mobile</th>
            <th className="border px-4 py-2">Roles</th>
            <th className="border px-4 py-2">Created On</th>
            <th className="border px-4 py-2">Modified On</th>
            <th className="border px-4 py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map(user => (
              <tr key={user.id} onClick={() => handleManageUser(user)}>
                <td className="border px-4 py-2">{user.firstName}</td>
                <td className="border px-4 py-2">{user.lastName}</td>
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.emailId}</td>
                <td className="border px-4 py-2">{user.mobileNo}</td>
                <td className="border px-4 py-2">{user.roles.join(', ')}</td>
                <td className="border px-4 py-2">{new Date(user.createdOn).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{new Date(user.modifiedOn).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{user.active ? 'Yes' : 'No'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center p-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsersPage;
