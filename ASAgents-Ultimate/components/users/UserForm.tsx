import React, { useState } from 'react';
import { User, Role } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserFormProps {
  user?: User;
  onSubmit: (user: Partial<User>) => void;
  onCancel: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

const availablePermissions = [
  { id: 'read', label: 'Read', description: 'View data and reports' },
  { id: 'write', label: 'Write', description: 'Create and edit content' },
  { id: 'delete', label: 'Delete', description: 'Remove data and content' },
  { id: 'admin', label: 'Admin', description: 'Full administrative access' },
  { id: 'manage_users', label: 'Manage Users', description: 'Create and manage user accounts' },
  { id: 'manage_projects', label: 'Manage Projects', description: 'Create and manage projects' },
  { id: 'manage_finances', label: 'Manage Finances', description: 'Access financial data and reports' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Configure system settings' },
];

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  addToast,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    role: user?.role || 'user',
    permissions: user?.permissions || ['read'],
    isActive: user?.isActive ?? true,
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!user && !formData.password) {
      newErrors.password = 'Password is required for new users';
    }

    if (!user && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    const userData: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      role: formData.role,
      permissions: formData.permissions,
      isActive: formData.isActive,
    };

    onSubmit(userData);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRolePermissions = (role: Role): string[] => {
    switch (role) {
      case 'owner':
        return availablePermissions.map(p => p.id);
      case 'admin':
        return ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects', 'manage_finances'];
      case 'manager':
        return ['read', 'write', 'manage_projects'];
      case 'user':
        return ['read'];
      default:
        return ['read'];
    }
  };

  const handleRoleChange = (role: Role) => {
    const rolePermissions = getRolePermissions(role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="text-primary" size={24} />
          <h2 className="text-xl font-semibold">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.name ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    errors.email ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          {/* Password (for new users) */}
          {!user && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 pr-10 ${
                        errors.password ? 'border-red-500' : 'border-border'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Role and Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Role and Permissions</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as Role)}
                className="w-full border border-border rounded-lg px-3 py-2"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Permissions *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map(permission => (
                  <div key={permission.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={permission.id}
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                        {permission.label}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {permission.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.permissions && (
                <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Active User
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
