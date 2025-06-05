import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
}

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEmployee: (employee: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    status: 'active' | 'inactive';
  }) => void;
}

const AddEmployeeDialog = ({ open, onOpenChange, onAddEmployee }: AddEmployeeDialogProps) => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
  });

  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    if (!formData.name || formData.name.length < 2 || formData.name.length > 50) {
      newErrors.name = 'Name must be between 2 and 50 characters';
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }

    if (!formData.role || !['P1', 'P2', 'P3', 'P4'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role';
    }

    if (!formData.department || formData.department.length < 2 || formData.department.length > 50) {
      newErrors.department = 'Department must be between 2 and 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddEmployee({
        ...formData,
        status: 'active' as const,
      });
      setFormData({ name: '', email: '', password: '', role: '', department: '' });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error) {
        const errorData = JSON.parse(error.message);
        if (errorData.errors) {
          setErrors(errorData.errors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter employee name"
              required
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter employee email"
              required
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter temporary password"
              required
              minLength={8}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
              required
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 - High Priority</SelectItem>
                <SelectItem value="P2">P2 - Medium Priority</SelectItem>
                <SelectItem value="P3">P3 - Low Priority</SelectItem>
                <SelectItem value="P4">P4 - Standard</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="Enter department"
              required
              className={errors.department ? 'border-red-500' : ''}
            />
            {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Employee & Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog; 