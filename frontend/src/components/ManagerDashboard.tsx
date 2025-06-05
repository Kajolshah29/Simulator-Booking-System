import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BarChart3 } from 'lucide-react';
import AddEmployeeDialog from './AddEmployeeDialog';
import BookingCalendar from './BookingCalendar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import AdminOverviewCards from './AdminOverviewCards';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  roleRequest?: string;
  roleRequestStatus?: string;
}

interface Booking {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  simulator: string;
  status: string;
  priority: string;
  createdBy: {
    name: string;
    email: string;
  };
  participants: Array<{
    name: string;
    email: string;
  }>;
}

interface OverrideRequest {
  _id: string;
  bookingId: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface Analytics {
  totalBookings: number;
  activeUsers: number;
  utilizationRate: number;
  averageSession: number;
  earlyEndRate: number;
}

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<User[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [overrideRequests, setOverrideRequests] = useState<OverrideRequest[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalBookings: 0,
    activeUsers: 0,
    utilizationRate: 0,
    averageSession: 0,
    earlyEndRate: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch employees
        const employeesResponse = await fetch('http://localhost:5000/api/employee/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

        // Fetch active bookings
        const bookingsResponse = await fetch('http://localhost:5000/api/bookings?status=active', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const bookingsData = await bookingsResponse.json();
        setActiveBookings(bookingsData);

        // Fetch override requests
        const overrideResponse = await fetch('http://localhost:5000/api/bookings/override-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const overrideData = await overrideResponse.json();
        setOverrideRequests(overrideData);

        // Fetch analytics
        const analyticsResponse = await fetch('http://localhost:5000/api/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading dashboard data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/employee/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setEmployees([...employees, data.user]);
      setShowAddEmployee(false);
      setNewEmployee({
        name: '',
        email: '',
        password: '',
        role: '',
        department: ''
      });
      toast.success('Employee added successfully');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error instanceof Error ? error.message : 'Error adding employee');
    }
  };

  const handleApproveOverride = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/override-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve override request');
      }

      setOverrideRequests(overrideRequests.filter(req => req._id !== requestId));
      toast.success('Override request approved');
    } catch (error) {
      console.error('Error approving override:', error);
      toast.error('Error approving override request');
    }
  };

  const handleRejectOverride = async (requestId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/override-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject override request');
      }

      setOverrideRequests(overrideRequests.filter(req => req._id !== requestId));
      toast.success('Override request rejected');
    } catch (error) {
      console.error('Error rejecting override:', error);
      toast.error('Error rejecting override request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="bookings">Active Bookings</TabsTrigger>
          <TabsTrigger value="requests">Override Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <AdminOverviewCards analytics={analytics} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Simulator</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBookings.slice(0, 5).map(booking => (
                      <TableRow key={booking._id}>
                        <TableCell>{booking.title}</TableCell>
                        <TableCell>{booking.simulator}</TableCell>
                        <TableCell>{booking.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overrideRequests.slice(0, 5).map(request => (
                      <TableRow key={request._id}>
                        <TableCell>{request.requesterName}</TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>{request.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <Button onClick={() => setShowAddEmployee(true)}>Add New Employee</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.status}</TableCell>
                      <TableCell>
                        {employee.roleRequest && (
                          <div className="space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(employee._id)}
                              disabled={employee.roleRequestStatus === 'approved'}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectRequest(employee._id)}
                              disabled={employee.roleRequestStatus === 'rejected'}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Simulator</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking.title}</TableCell>
                      <TableCell>{booking.simulator}</TableCell>
                      <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(booking.endTime).toLocaleString()}</TableCell>
                      <TableCell>{booking.createdBy.name}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Override Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrideRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>{request.reason}</TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{request.status}</TableCell>
                      <TableCell>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveOverride(request._id)}
                            disabled={request.status !== 'pending'}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectOverride(request._id)}
                            disabled={request.status !== 'pending'}
                          >
                            Reject
                          </Button>
              </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
            <Card>
              <CardHeader>
              <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                <AdminOverviewCards analytics={analytics} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{employees.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Bookings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{activeBookings.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                      <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                      <p className="text-2xl font-bold">
                        {overrideRequests.filter(req => req.status === 'pending').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="settings">
            <Card>
              <CardHeader>
              <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                          <div>
                  <Label>Department Name</Label>
                  <Input defaultValue="Engineering" />
                          </div>
                <div>
                  <Label>Email Notifications</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Notifications</SelectItem>
                      <SelectItem value="important">Important Only</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                        </div>
                <Button>Save Settings</Button>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P1">P1</SelectItem>
                      <SelectItem value="P2">P2</SelectItem>
                      <SelectItem value="P3">P3</SelectItem>
                      <SelectItem value="P4">P4</SelectItem>
                    </SelectContent>
                  </Select>
      </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddEmployee(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Employee</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
