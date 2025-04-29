"use client";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface UserFormData {
  firstName: string;
  lastName: string;
  emailId: string;
  mobileNo: string;
  password: string;
  username: string;
  roles: string[];  // Dropdown, multi-select
}

export interface AddUserResponse {
  createdOn: string;
  id: string;
  firstName: string;
  lastName: string;
  emailId: string;
  username: string;
  contactNo: string;
}

export const useAddUser = () => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    emailId: '',
    mobileNo: '',
    password: '',
    username: '',
    roles: [],
  });

  const [addedUser, setAddedUser] = useState<AddUserResponse | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();
  const router = useRouter();

  const addUser = async (user: UserFormData = formData) => {
    const payload = {
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        mobileNo: user.mobileNo,
        password: user.password,
        username: user.username,
        roles: user.roles,
      },
    };

    try {
      setIsSubmitting(true);
      const { response, status } = await BackendRequest("api/addNewUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (status === 201) {
        setAddedUser(response?.response?.data || null);
        showToast(response?.response?.message || "User created successfully!");
        const userId = response.response.data.id;
        if(response?.response?.data?.roles.includes("CLIENT")){                   //if client registered to to add client details else go to all users list
        router.push(`all-users/clients/addClientDetails/${userId}`)
        }else{
            router.push(`/all-users`)
        }
      } else {
        showToast(response.response.message || "Failed to create user.");
      }
    } catch (error) {
      showToast("Something went wrong while creating user!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
  
    setFormData((prev) => {
      if (name === "roles") {
        return {
          ...prev,
          [name]: value ? [value] : [], // Always array for roles
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUser(formData);
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isSubmitting,
    addedUser,
  };
};
