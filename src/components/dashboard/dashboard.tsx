"use client";
import { deleteCookie } from "@/utils/helper";
import { useRouter } from "next/navigation";
import React from "react";

const Dashboard = () => {
    const router = useRouter();
    const handleLogout = () => {
        deleteCookie("access_token");
        localStorage.clear();
        router.push("/");
    };
    return (
        <div>
            {/* <button onClick={handleLogout}>Logout</button> */}
        </div>
    );
};

export default Dashboard;
