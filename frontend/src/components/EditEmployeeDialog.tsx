
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface EditEmployeeDialogProps {
  selectedEmployee: Employee | null;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  getPriorityColor: (priority: string) => string;
}

const EditEmployeeDialog = ({ 
  selectedEmployee, 
  editDialogOpen, 
  setEditDialogOpen, 
  getPriorityColor 
}: EditEmployeeDialogProps) => {
  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee Role</DialogTitle>
          <DialogDescription>
            Modify employee access level and status
          </DialogDescription>
        </DialogHeader>
        {selectedEmployee && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Employee</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEmployee.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <div className="mt-1">
                <Badge className={getPriorityColor(selectedEmployee.role)}>
                  {selectedEmployee.role}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">New Role</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="P1">P1 - Critical Access</option>
                <option value="P2">P2 - Experiment Access</option>
                <option value="P3">P3 - Normal Access</option>
                <option value="P4">P4 - Training Access</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-lg">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
