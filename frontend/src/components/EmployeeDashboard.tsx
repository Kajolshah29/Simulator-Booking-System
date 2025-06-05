import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import RoleRequestDialog from './RoleRequestDialog';
import BookingCalendar from './BookingCalendar';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  roleRequest?: string;
  roleRequestStatus?: 'pending' | 'approved' | 'rejected';
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleRequestDialogOpen, setRoleRequestDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.name}</CardTitle>
            <CardDescription>
              {user.department} Department • {user.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.roleRequest && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Role Change Request Status
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You have requested to change your role to {user.roleRequest}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Status: {user.roleRequestStatus}
                  </p>
                </div>
              )}
              {!user.roleRequest && (
                <Button
                  onClick={() => setRoleRequestDialogOpen(true)}
                  variant="outline"
                >
                  Request Role Change
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bookings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              View and manage your simulator bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingCalendar currentUser={user} />
          </CardContent>
        </Card>
      </div>

      <RoleRequestDialog
        open={roleRequestDialogOpen}
        onOpenChange={setRoleRequestDialogOpen}
        currentRole={user.role}
      />
    </div>
  );
};

export default EmployeeDashboard; 