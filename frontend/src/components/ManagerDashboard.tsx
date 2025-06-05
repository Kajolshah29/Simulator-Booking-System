import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, StopCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

interface SessionHistoryProps {
  currentUser: {
    email: string;
    name: string;
  } | null;
}

const SessionHistory = ({ currentUser }: SessionHistoryProps) => {
  const [activeSession, setActiveSession] = useState<Booking | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<Booking[]>([]);
  const [historicalSessions, setHistoricalSessions] = useState<Booking[]>([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (activeSession) {
      timerInterval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [activeSession]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast({
          title: "Authentication Error",
          description: "Please log in to view your sessions",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          // Optionally redirect to login page
          return;
        }
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter sessions for current user and categorize by status
      const userSessions = data.filter((booking: Booking) => {
        const isCreator = booking.createdBy?.email === currentUser?.email;
        const isParticipant = booking.participants?.some(p => p.email === currentUser?.email);
        return isCreator || isParticipant;
      });

      const active = userSessions.find((session: Booking) => session.status === 'in-progress');
      const upcoming = userSessions
        .filter((session: Booking) => session.status === 'scheduled')
        .sort((a: Booking, b: Booking) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      const historical = userSessions
        .filter((session: Booking) => session.status === 'completed' || session.status === 'cancelled')
        .sort((a: Booking, b: Booking) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()); // Sort historical by most recent first

      setActiveSession(active || null);
      setUpcomingSessions(upcoming);
      setHistoricalSessions(historical);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast({
          title: "Connection Error",
          description: "Could not connect to the server. Please check if the backend server is running.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to load sessions",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (booking: Booking) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...booking,
          status: 'in-progress',
          startedAt: new Date()
        })
      });

      if (!response.ok) throw new Error('Failed to start session');

      setActiveSession({
        ...booking,
        status: 'in-progress',
        startedAt: new Date()
      });
      setSessionTimer(0);
      
      toast({
        title: "Session Started",
        description: `Your ${booking.priority} session has begun.`
      });

      fetchSessions();
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/bookings/${activeSession.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...activeSession,
          status: 'completed'
        })
      });

      if (!response.ok) throw new Error('Failed to end session');

      setActiveSession(null);
      setSessionTimer(0);
      
      toast({
        title: "Session Ended",
        description: "Your session has been completed."
      });

      fetchSessions();
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Active Session</span>
            </CardTitle>
            <CardDescription>
              Your current simulator session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{activeSession.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activeSession.startTime).toLocaleString()} - {new Date(activeSession.endTime).toLocaleString()}
                  </p>
                </div>
                <Badge className={getPriorityColor(activeSession.priority)}>
                  {activeSession.priority}
                </Badge>
              </div>
              
              <div className="text-center py-4">
                <div className="text-3xl font-mono">{formatTime(sessionTimer)}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Session Duration</p>
              </div>

              <Button 
                onClick={endSession}
                className="w-full"
                variant="destructive"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                End Session
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
              You can start a session when your booking time arrives
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

      {/* Session Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Upcoming Sessions Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Upcoming Sessions</span>
              </CardTitle>
              <CardDescription>
                Your scheduled simulator sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(session.priority)}>
                            {session.priority}
                          </Badge>
                          <span className="font-medium">{session.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Simulator: {session.simulator}
                        </p>
                      </div>
                      <Button
                        onClick={() => startSession(session)}
                        className="flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Start Session</span>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No upcoming sessions scheduled</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Session History</span>
              </CardTitle>
              <CardDescription>
                Your completed and cancelled simulator sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historicalSessions.length > 0 ? (
                <div className="space-y-4">
                  {historicalSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(session.priority)}>
                            {session.priority}
                          </Badge>
                          <span className="font-medium">{session.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Simulator: {session.simulator}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Status: {session.status}
                        </p>
                      </div>
                      {/* No buttons for historical sessions */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No historical sessions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionHistory; 
