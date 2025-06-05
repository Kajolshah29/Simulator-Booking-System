
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  user: string;
  priority: string;
  time: string;
  status: string;
}

interface ActiveBookingsTabProps {
  activeBookings: Booking[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

const ActiveBookingsTab = ({ 
  activeBookings, 
  getPriorityColor, 
  getStatusColor 
}: ActiveBookingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Bookings</CardTitle>
        <CardDescription>
          Overview of all simulator bookings and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getPriorityColor(booking.priority)}`} />
                <div>
                  <p className="font-medium">{booking.user}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{booking.time}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status}
                </Badge>
                <Badge variant="outline">{booking.priority}</Badge>
                <Button size="sm" variant="outline">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveBookingsTab;
