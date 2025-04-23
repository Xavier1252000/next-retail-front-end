
"use client";
import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard/dashboard";
import Sidebar from "@/components/side_bar/Sidebar";
import React from "react";
import DashboardCards from "@/components/dashboard/dashboard-cards";

const Page = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    console.log(token);
    if (token && userId) {
      setToken(token);
      setUserId(userId);
    }
  }, []);

  if (!token || !userId) return <div><Dashboard />
  <DashboardCards /> </div>;

  return (
    <>      
    </>
  );
};

export default Page;

