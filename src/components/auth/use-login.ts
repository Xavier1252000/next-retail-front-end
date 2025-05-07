import { useState } from "react";
import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

interface FormDataType {
    username?: string;
    password?: string;
}

export const useLogin = () => {
    const [formData, setFormData] = useState<FormDataType | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isLoggedIn, setIsLoggedIn } = useAuth();


    const { showToast } = useToast();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const { response, status } = await BackendRequest("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if(status === 200){
            localStorage.setItem("userId", response.response.data.user.id);
            setIsLoggedIn(true);
        }

        setIsSubmitting(false);
        if (status === 200 && response?.response?.statusCode === 200) {
            showToast("Login success", "success");
            // bakeCookie(
            //     "access_token",
            //     response?.response?.data?.token,
            //     new Date(response?.response?.data?.expirationDate).toUTCString()
            // );
            router.push("/dashboard");
        } else {
            showToast("Invalid Credentials", "error");
        }
    };

    return {
        formData,
        showPassword,
        isSubmitting,
        handleChange,
        handleSubmit,
        togglePasswordVisibility,
    };
};
