'use client';
import React from 'react';
import { useAddUser } from './useAddUser'; // Adjust path if needed

const AddUserPage: React.FC = () => {
    const { formData, handleChange, handleSubmit, isSubmitting } = useAddUser();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Add New User</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="email"
                        name="emailId"
                        placeholder="Email"
                        value={formData.emailId}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="text"
                        name="mobileNo"
                        min={"5999999999"}
                        placeholder="Mobile Number"
                        value={formData.mobileNo}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoComplete='off'
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoComplete='new-password'
                        autoCorrect='false'
                        required
                    />

                    {/* Roles Dropdown */}
                    <select
                        name="roles"
                        value={formData.roles[0] || ""}
                        onChange={handleChange}
                        autoCapitalize='on'
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER ADMIN">Super Admin</option>
                    </select>




                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        {isSubmitting ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddUserPage;
