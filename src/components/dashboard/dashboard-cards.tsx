import { Users, CreditCard, TrendingUp } from 'lucide-react';
import React from 'react'
import { Card, CardContent } from "@/components/ui/card";


function DashboardCards() {

    const stats = [
        {
          title: "Total Users",
          value: "1,240",
          icon: <Users className="text-blue-500" size={24} />,
        },
        {
          title: "Sales Today",
          value: "₹12,340",
          icon: <CreditCard className="text-green-500" size={24} />,
        },
        {
          title: "Monthly Revenue",
          value: "₹2,45,000",
          icon: <TrendingUp className="text-purple-500" size={400} />,
        },
        {
            title: "Monthly Revenue",
            value: "₹2,45,000",
            icon: <TrendingUp className="text-purple-500" size={400} />,
          },
          {
            title: "Monthly Revenue",
            value: "₹2,45,000",
            icon: <TrendingUp className="text-purple-500" size={400} />,
          },
          {
            title: "Monthly Revenue",
            value: "₹2,45,000",
            icon: <TrendingUp className="text-purple-500" size={400} />,
          },
      ];
      
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {stats.map((stat, index) => (
        <Card key={index} className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h3 className="text-xl font-bold">{stat.value}</h3>
            </div>
            <div className="bg-muted p-3 rounded-full">
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardCards
