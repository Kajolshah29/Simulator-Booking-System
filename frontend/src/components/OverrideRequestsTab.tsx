
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverrideRequest {
  id: string;
  requester: string;
  target: string;
  priority: string;
  time: string;
  status: string;
}

interface OverrideRequestsTabProps {
  overrideRequests: OverrideRequest[];
}

const OverrideRequestsTab = ({ overrideRequests }: OverrideRequestsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Override Requests</CardTitle>
        <CardDescription>
          Pending requests for booking overrides
        </CardDescription>
      </CardHeader>
      <CardContent>
        {overrideRequests.length > 0 ? (
          <div className="space-y-3">
            {overrideRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
              >
                <div>
                  <p className="font-medium">{request.requester} requests override</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Target: {request.target} • {request.time} • {request.priority}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending override requests</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverrideRequestsTab;
