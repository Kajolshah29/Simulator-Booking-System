import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import ManagerDashboard from './components/ManagerDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  permissions: {
    canManageUsers: boolean;
    canManageBookings: boolean;
    canViewReports: boolean;
  };
  token: string;
}

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Check for stored token and user data
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (token && storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  const handleLogin = (data: UserData) => {
    setUserData(data);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userData', JSON.stringify(data));
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  if (!userData) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
