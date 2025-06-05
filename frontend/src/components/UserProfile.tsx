import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, KeyRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface UserProfileProps {
  currentUser: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

const UserProfile = ({ currentUser }: UserProfileProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalWeeklyUsageMinutes: 0,
    weeklyLimitMinutes: 360, // Defaulting to 6 hours
    activeBookingsCount: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!currentUser) {
        setIsStatsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Handle not logged in - maybe redirect or show message
          setIsStatsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/auth/me/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user stats');
        }

        const data = await response.json();
        setUserStats(data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast({
          title: "Error",
          description: "Failed to load user statistics.",
          variant: "destructive",
        });
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [currentUser]); // Refetch stats if currentUser changes

  const handleChangePassword = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User not logged in.",
        variant: "destructive",
      });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    // Basic password strength check (can be enhanced)
    if (newPassword.length < 8) {
       toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to change password.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });

      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to change password', 
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format minutes into hours and minutes
  const formatMinutesToHoursAndMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>User Profile</span>
          </CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{currentUser?.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{currentUser?.email}</p>
            </div>
          </div>
          
          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Weekly Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {isStatsLoading ? (
                  <div className="text-2xl font-bold animate-pulse">Loading...</div>
                ) : (
                  <div className="text-2xl font-bold">{formatMinutesToHoursAndMinutes(userStats.totalWeeklyUsageMinutes)} / {formatMinutesToHoursAndMinutes(userStats.weeklyLimitMinutes)}</div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                 {isStatsLoading ? (
                  <div className="text-2xl font-bold animate-pulse">Loading...</div>
                ) : (
                  <div className="text-2xl font-bold">{userStats.activeBookingsCount}</div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming sessions</p>
              </CardContent>
            </Card>
          </div>

          {/* Change Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5" />
                <span>Change Password</span>
              </CardTitle>
              <CardDescription>
                Update your account password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword} disabled={isLoading}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile; 
