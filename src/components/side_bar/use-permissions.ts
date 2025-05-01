import { useToast } from "@/context/toast-context";
import { BackendRequest } from "@/utils/request-Interceptor/Interceptor";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

export const usePermissions = () => {
    const { showToast } = useToast();
    const [response, setResponse] = useState<any>(null);
    const [status, setStatus] = useState<number | null>(null);
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        let userId = Cookies.get("userId"); // ✅ Read userId from cookies

        const fetchPermissions = async () => {
            const payload = {
                data: {
                    userId: userId
                }
            };

            try {
                const { response, status } = await BackendRequest("/api/permissions/getUserPermissions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    });

                setResponse(response);
                setStatus(status);

            } catch (error) {
                showToast("Failed to fetch permissions", "error");
                setStatus(500);
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, []);
    return { response, status, loading }
}

