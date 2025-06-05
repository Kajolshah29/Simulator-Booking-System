
import React from 'react';
import { Users, UserCheck, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  weeklyHours: number;
  totalBookings: number;
}

interface RoleRequest {
  id: string;
  employee: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  requestDate: string;
  status: string;
}

interface ManagerOverviewCardsProps {
  employees: Employee[];
  roleRequests: RoleRequest[];
}

const ManagerOverviewCards = ({ employees, roleRequests }: ManagerOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
          </div>
          <p className="text-2xl font-bold">{employees.length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">P1 Priority Users</p>
          </div>
          <p className="text-2xl font-bold">{employees.filter(e => e.role === 'P1').length}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Requests</p>
          </div>
          <p className="text-2xl font-bold">{roleRequests.filter(r => r.status === 'pending').length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerOverviewCards;
