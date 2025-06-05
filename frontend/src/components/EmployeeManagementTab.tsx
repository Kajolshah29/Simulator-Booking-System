
import React from 'react';
import { Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface EmployeeManagementTabProps {
  employees: Employee[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  handleEditEmployee: (employee: Employee) => void;
}

const EmployeeManagementTab = ({ 
  employees, 
  getPriorityColor, 
  getStatusColor, 
  handleEditEmployee 
}: EmployeeManagementTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Role Management</CardTitle>
        <CardDescription>
          Manage employee access levels and monitor their simulator usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Weekly Hours</TableHead>
              <TableHead>Total Bookings</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
                  </div>
                </TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(employee.role)}>
                    {employee.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>{employee.weeklyHours}h</TableCell>
                <TableCell>{employee.totalBookings}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEmployee(employee)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeeManagementTab;
