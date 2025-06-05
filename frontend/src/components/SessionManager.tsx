import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Calendar, AlertTriangle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface SessionManagerProps {
  currentUser: any;
}

interface Booking {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  simulator: string;
  department: string;
  createdBy: {
    name: string;
    email: string;
  };
  participants: Array<{
    name: string;
    email: string;
  }>;
  startedAt?: Date;
  actualStartTime?: string;
}

const SessionManager = ({ currentUser }: SessionManagerProps) => {
  const [activeSession, setActiveSession] = useState<Booking | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      console.log('Current user:', currentUser);

      // Retrieve token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found.');
        setIsLoading(false);
        // Optionally show a message to the user that they need to log in
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        // Check if the error is due to authentication (e.g., 401 or 403)
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Authentication Error",
            description: "You are not authorized to view bookings. Please log in again.",
            variant: "destructive"
          });
          // Optionally trigger a logout or redirect to login page
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch bookings. Please check the console for details.",
            variant: "destructive"
          });
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('All bookings:', data);

      // Filter bookings for current user and sort by start time
      const userBookings = data.filter((booking: Booking) => {
        const isCreator = booking.createdBy?.email === currentUser?.email;
        const isParticipant = booking.participants?.some(p => p.email === currentUser?.email);
        console.log('Booking:', {
          title: booking.title,
          creatorEmail: booking.createdBy?.email,
          participantEmails: booking.participants?.map(p => p.email),
          isCreator,
          isParticipant,
          currentUserEmail: currentUser?.email
        });
        return isCreator || isParticipant;
      }).sort((a: Booking, b: Booking) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      console.log('Filtered user bookings:', userBookings);
      setUpcomingBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // The toast for general fetch errors is already inside the !response.ok block now
      // This catch block will handle network errors or errors thrown by my code
      if (!error.message.includes('Failed to fetch bookings')) { // Avoid duplicate toast for API errors
         toast({
            title: "Network Error",
            description: "Could not connect to the server to fetch bookings.",
            variant: "destructive"
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = async (booking: Booking) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...booking,
          status: 'in-progress'
        }),
      });

      if (!response.ok) throw new Error('Failed to start session');

      setActiveSession({
        ...booking,
        status: 'in-progress',
        startedAt: new Date(),
        actualStartTime: new Date().toLocaleTimeString()
      });
      setSessionTimer(0);
      
      toast({
        title: "Session Started",
        description: `Your ${booking.priority} session has begun.`,
      });

      // Refresh bookings after starting session
      fetchBookings();
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive"
      });
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${activeSession.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...activeSession,
          status: 'completed'
        }),
      });

      if (!response.ok) throw new Error('Failed to end session');

      const currentTime = new Date();
      const [endHour, endMinute] = activeSession.endTime.split(':');
      const scheduledEndTime = new Date();
      scheduledEndTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const isEarlyEnd = currentTime < scheduledEndTime;
      
      if (isEarlyEnd) {
        const remainingMinutes = Math.round((scheduledEndTime.getTime() - currentTime.getTime()) / (1000 * 60));
        
        toast({
          title: "Early Session End",
          description: `Session ended ${remainingMinutes} minutes early. Early release notification will be sent.`,
        });

        // Simulate early release notification
        setTimeout(() => {
          toast({
            title: "Early Release Notification Sent",
            description: "Other users have been notified about the available time slot.",
          });
        }, 2000);
      } else {
        toast({
          title: "Session Completed",
          description: "Your session has ended as scheduled.",
        });
      }

      setActiveSession(null);
      setSessionTimer(0);

      // Refresh bookings after ending session
      fetchBookings();
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500';
      case 'P2': return 'bg-orange-500';
      case 'P3': return 'bg-blue-500';
      case 'P4': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'P1': return 'Critical Deadline';
      case 'P2': return 'Ongoing Experiment';
      case 'P3': return 'Normal Work';
      case 'P4': return 'Practice/Training';
      default: return priority;
    }
  };

  const getNextBookingTime = () => {
    if (upcomingBookings.length === 0) return null;
    const nextBooking = upcomingBookings[0];
    const startDate = new Date(nextBooking.startTime);
    return `${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Session */}
      {activeSession ? (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Play className="w-5 h-5" />
              <span>Active Session</span>
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Session in progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-green-800 dark:text-green-200">
                  {getPriorityLabel(activeSession.priority)} Session
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Started at {activeSession.actualStartTime}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Scheduled until {activeSession.endTime}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatTime(sessionTimer)}
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">Elapsed time</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={endSession}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <Square className="w-4 h-4" />
                <span>End Session</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>No Active Session</span>
            </CardTitle>
            <CardDescription>
              You can start a session when your booking time arrives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No session currently running</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Your Upcoming Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(booking.priority)}>
                        {booking.priority}
                      </Badge>
                      <span className="font-medium">{booking.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Simulator: {booking.simulator}
                    </p>
                  </div>
                  {booking.status === 'scheduled' && (
                    <Button
                      onClick={() => startSession(booking)}
                      className="flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Session</span>
                    </Button>
                  )}
                  {booking.status === 'in-progress' && (
                    <Badge variant="secondary">In Progress</Badge>
                  )}
                  {booking.status === 'completed' && (
                    <Badge variant="outline">Completed</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming sessions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManager;
