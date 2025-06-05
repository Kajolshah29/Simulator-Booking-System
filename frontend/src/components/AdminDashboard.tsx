
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManagerDashboard from '@/components/ManagerDashboard';
import AdminOverviewCards from '@/components/AdminOverviewCards';
import ActiveBookingsTab from '@/components/ActiveBookingsTab';
import OverrideRequestsTab from '@/components/OverrideRequestsTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import SettingsTab from '@/components/SettingsTab';

const AdminDashboard = () => {
  const [activeBookings] = useState([
    { id: '1', user: 'John Doe', priority: 'P1', time: '14:00-16:00', status: 'active' },
    { id: '2', user: 'Jane Smith', priority: 'P2', time: '16:30-18:00', status: 'upcoming' },
    { id: '3', user: 'Bob Johnson', priority: 'P3', time: '09:00-10:30', status: 'completed' },
  ]);

  const [overrideRequests] = useState([
    { id: '1', requester: 'Alice Brown', target: 'John Doe', priority: 'P1', time: '15:00-16:00', status: 'pending' },
  ]);

  const [analytics] = useState({
    totalBookings: 156,
    activeUsers: 23,
    utilizationRate: 78,
    averageSession: 85,
    earlyEndRate: 12
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500';
      case 'P2': return 'bg-orange-500';
      case 'P3': return 'bg-blue-500';
      case 'P4': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <AdminOverviewCards analytics={analytics} />

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Active Bookings</TabsTrigger>
          <TabsTrigger value="overrides">Override Requests</TabsTrigger>
          <TabsTrigger value="managers">Manager Dashboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <ActiveBookingsTab
            activeBookings={activeBookings}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="overrides" className="space-y-4">
          <OverrideRequestsTab overrideRequests={overrideRequests} />
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          <div className="animate-fade-in">
            <ManagerDashboard />
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
