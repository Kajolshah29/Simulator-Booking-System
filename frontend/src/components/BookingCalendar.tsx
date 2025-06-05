import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

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

interface BookingCalendarProps {
  currentUser: any; // Assuming currentUser includes user ID for fetching personal bookings
}

const BookingCalendar = ({ currentUser }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [duration, setDuration] = useState<string>('60');
  const [bookings, setBookings] = useState<Booking[]>([]); // State to store fetched bookings
  const [isLoadingBookings, setIsLoadingBookings] = useState(false); // Loading state for bookings

  const priorities = [
    { value: 'P1', label: 'Critical Deadline Work', color: 'bg-red-500', description: 'Same-day booking allowed' },
    { value: 'P2', label: 'Ongoing Experiment', color: 'bg-orange-500', description: 'Same-day booking allowed' },
    { value: 'P3', label: 'Normal Work', color: 'bg-blue-500', description: '7 days advance booking required' },
    { value: 'P4', label: 'Practice/Training', color: 'bg-green-500', description: '7 days advance booking required' },
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  // Function to fetch bookings for the selected date
  const fetchBookings = async (date: Date) => {
    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Format the date for the API request (e.g., YYYY-MM-DD)
      const formattedDate = date.toISOString().split('T')[0];

      const response = await fetch(`http://localhost:5000/api/bookings?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookingsData: Booking[] = await response.json();
      // Filter bookings to show only current user's bookings on their dashboard
      const userBookings = bookingsData.filter(booking => booking.createdBy.email === currentUser?.email);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch bookings when selectedDate changes or component mounts
  useEffect(() => {
    if (selectedDate) {
      fetchBookings(selectedDate);
    }
  }, [selectedDate, currentUser]); // Add currentUser to dependency array

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedPriority || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all booking details.",
        variant: "destructive",
      });
      return;
    }

    // Validate booking rules
    const today = new Date();
    const daysDifference = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if ((selectedPriority === 'P3' || selectedPriority === 'P4') && daysDifference < 7) {
      toast({
        title: "Booking Restriction",
        description: `${selectedPriority} bookings require 7 days advance notice.`,
        variant: "destructive",
      });
      return;
    }

    // Calculate end time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + parseInt(duration));

    // Get simulator - assuming a default or selection mechanism exists elsewhere
    // For now, let's use a placeholder. You might need to adjust this part.
    const simulator = 'SIM1'; // TODO: Replace with actual simulator selection

    const bookingData = {
      // You might need a title and description field in the UI
      title: `Session on ${selectedDate.toDateString()}`,
      description: '',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      simulator: simulator,
      priority: selectedPriority,
      // Participants can be added later if needed
      participants: [], 
      // Department might need to be fetched from the current user or selected
      department: 'default' // TODO: Replace with actual department
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to book a session",
          variant: "destructive"
        });
        return;
      }

      setIsLoadingBookings(true); // Use the existing loading state

      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book session');
      }

      const newBooking = await response.json();
      console.log('Booking created successfully:', newBooking);

      toast({
        title: "Booking Confirmed!",
        description: `Your ${newBooking.priority} session on ${new Date(newBooking.startTime).toLocaleString()} has been booked.`, 
      });

      // Reset form
      setSelectedTime('');
      setSelectedPriority('');
      setDuration('60');

      // After successful booking, refetch bookings for the selected date
      if (selectedDate) {
         fetchBookings(selectedDate);
      }

    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking Error",
        description: error instanceof Error ? error.message : 'Failed to book session', 
        variant: "destructive"
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    const daysDifference = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // For P3/P4, disable dates less than 7 days in advance
    if (selectedPriority === 'P3' || selectedPriority === 'P4') {
      return daysDifference < 7;
    }
    
    // For P1/P2, allow same-day booking
    return daysDifference < 0;
  };

  return (
    <div className="space-y-6">
      {/* Priority Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Select Priority Level</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {priorities.map((priority) => (
            <Card
              key={priority.value}
              className={`cursor-pointer transition-all border-2 hover:shadow-md ${
                selectedPriority === priority.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedPriority(priority.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                  <div className="flex-1">
                    <h4 className="font-medium">{priority.label}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{priority.description}</p>
                  </div>
                  {selectedPriority === priority.value && (
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Select Date</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred session date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
             {isLoadingBookings && <p>Loading bookings...</p>}
            {!isLoadingBookings && bookings.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2">Bookings on this date:</h4>
                <ul className="space-y-2">
                  {bookings.map(booking => (
                    <li key={booking._id} className="p-2 border rounded-md text-sm">
                      {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()} ({booking.title}) - {booking.status}
                    </li>
                  ))}
                </ul>
              </div>
            )}
             {!isLoadingBookings && bookings.length === 0 && selectedDate && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No bookings on this date.</p>
            )}
          </CardContent>
        </Card>

        {/* Time & Duration Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Time & Duration</span>
            </CardTitle>
            <CardDescription>
              Select your session time and duration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value}>
                      {dur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTime && duration && selectedDate && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium">Session Summary:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  On {selectedDate.toDateString()}, from {selectedTime} for {duration} minutes.
                </p>
              </div>
            )}

            <Button 
              onClick={handleBooking} 
              className="w-full"
              disabled={!selectedDate || !selectedTime || !selectedPriority || isLoadingBookings}
            >
               {isLoadingBookings ? 'Loading...' : 'Book Session'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Booking Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Booking Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Badge variant="outline">Daily Limit</Badge>
              <p className="text-gray-600 dark:text-gray-400">Maximum 2 hours per day</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">Weekly Limit</Badge>
              <p className="text-gray-600 dark:text-gray-400">Maximum 6 hours per week</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">Gaps Required</Badge>
              <p className="text-gray-600 dark:text-gray-400">15-minute gap between bookings</p>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">Active Bookings</Badge>
              <p className="text-gray-600 dark:text-gray-400">One active booking at a time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
