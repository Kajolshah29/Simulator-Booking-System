import React, { useState } from 'react';
import { Calendar, Clock, User, Settings, BarChart3, Bell, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BookingCalendar from '@/components/BookingCalendar';
import SessionManager from '@/components/SessionManager';
import AdminDashboard from '@/components/AdminDashboard';
import LoginPage from '@/components/LoginPage';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('book');
  const [darkMode, setDarkMode] = useState(false);

  const handleLogin = (userData: any) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Check if user is manager
  const isManager = currentUser?.role === 'manager';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Simulator Booking System</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                Welcome, {currentUser?.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-full"
              >
                {darkMode ? '☀️' : '🌙'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isManager ? 'grid-cols-4' : 'grid-cols-3'} lg:w-[${isManager ? '400px' : '300px'}]`}>
            <TabsTrigger value="book" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Book</span>
            </TabsTrigger>
            <TabsTrigger value="session" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Session</span>
            </TabsTrigger>
            {isManager && (
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
            )}
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="book" className="space-y-6">
            <div className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Book Simulator Session</span>
                  </CardTitle>
                  <CardDescription>
                    Select your preferred time slot and priority level for simulator access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingCalendar currentUser={currentUser} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="session" className="space-y-6">
            <div className="animate-fade-in">
              {currentUser ? (
                <SessionManager currentUser={currentUser} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Please log in to view sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Your session information will appear here after you log in.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {isManager && (
          <TabsContent value="admin" className="space-y-6">
            <div className="animate-fade-in">
              <AdminDashboard />
            </div>
          </TabsContent>
          )}

          <TabsContent value="profile" className="space-y-6">
            <div className="animate-fade-in">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Weekly Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.5 / 6 hours</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Active Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upcoming sessions</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
