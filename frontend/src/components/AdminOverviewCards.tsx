import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Analytics {
  totalBookings: number;
  activeUsers: number;
  utilizationRate: number;
  averageSession: number;
  earlyEndRate: number;
}

interface AdminOverviewCardsProps {
  analytics: Analytics;
}

const AdminOverviewCards = ({ analytics }: AdminOverviewCardsProps) => {
  const [data, setData] = useState<Analytics>(analytics);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
          </div>
          <p className="text-2xl font-bold">{data.totalBookings}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <p className="text-2xl font-bold">{data.activeUsers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilization</p>
          </div>
          <p className="text-2xl font-bold">{data.utilizationRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Session</p>
          </div>
          <p className="text-2xl font-bold">{data.averageSession}m</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Early Ends</p>
          </div>
          <p className="text-2xl font-bold">{data.earlyEndRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewCards;
