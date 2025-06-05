
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface RoleAnalyticsTabProps {
  employees: Employee[];
}

const RoleAnalyticsTab = ({ employees }: RoleAnalyticsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm">P1 Critical Access</span>
              </div>
              <span className="text-sm font-medium">
                {employees.filter(e => e.role === 'P1').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-sm">P2 Experiment Access</span>
              </div>
              <span className="text-sm font-medium">
                {employees.filter(e => e.role === 'P2').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-sm">P3 Normal Access</span>
              </div>
              <span className="text-sm font-medium">
                {employees.filter(e => e.role === 'P3').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm">P4 Training Access</span>
              </div>
              <span className="text-sm font-medium">
                {employees.filter(e => e.role === 'P4').length} employees
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Department</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Research</span>
              <span className="text-sm font-medium">
                {employees.filter(e => e.department === 'Research').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Development</span>
              <span className="text-sm font-medium">
                {employees.filter(e => e.department === 'Development').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Testing</span>
              <span className="text-sm font-medium">
                {employees.filter(e => e.department === 'Testing').length} employees
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Training</span>
              <span className="text-sm font-medium">
                {employees.filter(e => e.department === 'Training').length} employees
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleAnalyticsTab;
