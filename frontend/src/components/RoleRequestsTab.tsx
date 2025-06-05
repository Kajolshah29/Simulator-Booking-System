
import React from 'react';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RoleRequest {
  id: string;
  employee: string;
  currentRole: string;
  requestedRole: string;
  reason: string;
  requestDate: string;
  status: string;
}

interface RoleRequestsTabProps {
  roleRequests: RoleRequest[];
  getPriorityColor: (priority: string) => string;
  handleApproveRequest: (requestId: string) => void;
  handleRejectRequest: (requestId: string) => void;
}

const RoleRequestsTab = ({ 
  roleRequests, 
  getPriorityColor, 
  handleApproveRequest, 
  handleRejectRequest 
}: RoleRequestsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Change Requests</CardTitle>
        <CardDescription>
          Review and approve employee role elevation requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {roleRequests.length > 0 ? (
          <div className="space-y-4">
            {roleRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{request.employee}</h4>
                      <Badge className={getPriorityColor(request.currentRole)}>
                        {request.currentRole}
                      </Badge>
                      <span className="text-gray-500">→</span>
                      <Badge className={getPriorityColor(request.requestedRole)}>
                        {request.requestedRole}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requested on {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending role change requests</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleRequestsTab;
