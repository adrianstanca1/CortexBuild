// 🏗️ User Management Dashboard
// Comprehensive user management with role-based permissions, company hierarchy, and access controls

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Building,
  Briefcase,
  Crown,
  Star,
  Award,
  Key,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react';

interface UserManagementDashboardProps {
  projectId: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  phone?: string;
  title: string;
  department: string;
  company: string;
  companyId: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  projects: ProjectAssignment[];
  preferences: UserPreferences;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  passwordLastChanged: Date;
  mustChangePassword: boolean;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1=Admin, 2=Manager, 3=User, 4=Viewer
  permissions: string[];
  isSystemRole: boolean;
  companyId?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  actions: string[]; // create, read, update, delete, approve, etc.
}

interface ProjectAssignment {
  projectId: string;
  projectName: string;
  role: string;
  permissions: string[];
  assignedAt: Date;
  assignedBy: string;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
}

interface Company {
  id: string;
  name: string;
  type: 'owner' | 'contractor' | 'subcontractor' | 'consultant' | 'vendor';
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  parentCompanyId?: string;
  isActive: boolean;
  createdAt: Date;
  userCount: number;
  projectCount: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  totalCompanies: number;
  totalRoles: number;
  loginActivity: {
    date: Date;
    logins: number;
    uniqueUsers: number;
  }[];
  roleDistribution: {
    role: string;
    count: number;
    percentage: number;
  }[];
  companyDistribution: {
    company: string;
    userCount: number;
    type: string;
  }[];
}

export const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  useEffect(() => {
    loadUserData();
  }, [projectId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load mock data
      const mockUsers = getMockUsers();
      const mockCompanies = getMockCompanies();
      const mockRoles = getMockRoles();
      const mockPermissions = getMockPermissions();
      const mockMetrics = calculateMetrics(mockUsers, mockCompanies, mockRoles);

      setUsers(mockUsers);
      setCompanies(mockCompanies);
      setRoles(mockRoles);
      setPermissions(mockPermissions);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockUsers = (): User[] => {
    return [
      {
        id: 'user-1',
        email: 'john.smith@construction.com',
        firstName: 'John',
        lastName: 'Smith',
        displayName: 'John Smith',
        phone: '+1-555-0101',
        title: 'Project Manager',
        department: 'Construction',
        company: 'ABC Construction',
        companyId: 'company-1',
        role: {
          id: 'role-manager',
          name: 'Project Manager',
          description: 'Manages construction projects',
          level: 2,
          permissions: ['project.read', 'project.update', 'team.manage'],
          isSystemRole: true
        },
        permissions: [],
        status: 'active',
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        projects: [
          {
            projectId: 'project-1',
            projectName: 'Downtown Office Complex',
            role: 'Project Manager',
            permissions: ['full_access'],
            assignedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            assignedBy: 'admin'
          }
        ],
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: true,
            sms: false,
            frequency: 'immediate'
          },
          dashboard: {
            layout: 'default',
            widgets: ['projects', 'tasks', 'calendar']
          }
        },
        twoFactorEnabled: true,
        loginAttempts: 0,
        passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        mustChangePassword: false
      },
      {
        id: 'user-2',
        email: 'sarah.johnson@construction.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        displayName: 'Sarah Johnson',
        phone: '+1-555-0102',
        title: 'Site Supervisor',
        department: 'Field Operations',
        company: 'ABC Construction',
        companyId: 'company-1',
        role: {
          id: 'role-supervisor',
          name: 'Site Supervisor',
          description: 'Supervises on-site construction activities',
          level: 3,
          permissions: ['field.read', 'field.update', 'safety.manage'],
          isSystemRole: true
        },
        permissions: [],
        status: 'active',
        lastLogin: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        projects: [
          {
            projectId: 'project-1',
            projectName: 'Downtown Office Complex',
            role: 'Site Supervisor',
            permissions: ['field_access', 'safety_reports'],
            assignedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            assignedBy: 'user-1'
          }
        ],
        preferences: {
          theme: 'light',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: true,
            sms: true,
            frequency: 'immediate'
          },
          dashboard: {
            layout: 'mobile',
            widgets: ['tasks', 'safety', 'weather']
          }
        },
        twoFactorEnabled: false,
        loginAttempts: 0,
        passwordLastChanged: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        mustChangePassword: false
      },
      {
        id: 'user-3',
        email: 'mike.wilson@subcontractor.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        displayName: 'Mike Wilson',
        phone: '+1-555-0103',
        title: 'Electrical Foreman',
        department: 'Electrical',
        company: 'Wilson Electric',
        companyId: 'company-2',
        role: {
          id: 'role-foreman',
          name: 'Trade Foreman',
          description: 'Leads specific trade activities',
          level: 3,
          permissions: ['trade.read', 'trade.update'],
          isSystemRole: true
        },
        permissions: [],
        status: 'active',
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        projects: [
          {
            projectId: 'project-1',
            projectName: 'Downtown Office Complex',
            role: 'Electrical Foreman',
            permissions: ['electrical_work', 'progress_reports'],
            assignedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            assignedBy: 'user-1'
          }
        ],
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: false,
            push: true,
            sms: false,
            frequency: 'daily'
          },
          dashboard: {
            layout: 'compact',
            widgets: ['tasks', 'materials', 'crew']
          }
        },
        twoFactorEnabled: false,
        loginAttempts: 0,
        passwordLastChanged: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        mustChangePassword: false
      },
      {
        id: 'user-4',
        email: 'lisa.chen@consultant.com',
        firstName: 'Lisa',
        lastName: 'Chen',
        displayName: 'Lisa Chen',
        phone: '+1-555-0104',
        title: 'Quality Inspector',
        department: 'Quality Assurance',
        company: 'QA Consultants',
        companyId: 'company-3',
        role: {
          id: 'role-inspector',
          name: 'Quality Inspector',
          description: 'Performs quality inspections and compliance checks',
          level: 3,
          permissions: ['quality.read', 'quality.create', 'inspections.manage'],
          isSystemRole: true
        },
        permissions: [],
        status: 'pending',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        projects: [],
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: false,
            sms: false,
            frequency: 'weekly'
          },
          dashboard: {
            layout: 'default',
            widgets: ['inspections', 'quality', 'compliance']
          }
        },
        twoFactorEnabled: false,
        loginAttempts: 0,
        passwordLastChanged: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        mustChangePassword: true
      }
    ];
  };

  const getMockCompanies = (): Company[] => {
    return [
      {
        id: 'company-1',
        name: 'ABC Construction',
        type: 'contractor',
        address: '123 Main St, New York, NY 10001',
        phone: '+1-555-0100',
        email: 'info@abcconstruction.com',
        website: 'https://abcconstruction.com',
        isActive: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        userCount: 25,
        projectCount: 8
      },
      {
        id: 'company-2',
        name: 'Wilson Electric',
        type: 'subcontractor',
        address: '456 Electric Ave, Brooklyn, NY 11201',
        phone: '+1-555-0200',
        email: 'contact@wilsonelectric.com',
        parentCompanyId: 'company-1',
        isActive: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        userCount: 12,
        projectCount: 3
      },
      {
        id: 'company-3',
        name: 'QA Consultants',
        type: 'consultant',
        address: '789 Quality Blvd, Manhattan, NY 10002',
        phone: '+1-555-0300',
        email: 'info@qaconsultants.com',
        website: 'https://qaconsultants.com',
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        userCount: 8,
        projectCount: 5
      }
    ];
  };

  const getMockRoles = (): UserRole[] => {
    return [
      {
        id: 'role-admin',
        name: 'System Administrator',
        description: 'Full system access and administration',
        level: 1,
        permissions: ['*'],
        isSystemRole: true
      },
      {
        id: 'role-manager',
        name: 'Project Manager',
        description: 'Manages construction projects',
        level: 2,
        permissions: ['project.*', 'team.manage', 'budget.read', 'schedule.manage'],
        isSystemRole: true
      },
      {
        id: 'role-supervisor',
        name: 'Site Supervisor',
        description: 'Supervises on-site construction activities',
        level: 3,
        permissions: ['field.*', 'safety.manage', 'quality.read', 'team.read'],
        isSystemRole: true
      },
      {
        id: 'role-foreman',
        name: 'Trade Foreman',
        description: 'Leads specific trade activities',
        level: 3,
        permissions: ['trade.*', 'crew.manage', 'materials.read'],
        isSystemRole: true
      },
      {
        id: 'role-inspector',
        name: 'Quality Inspector',
        description: 'Performs quality inspections and compliance checks',
        level: 3,
        permissions: ['quality.*', 'inspections.manage', 'compliance.read'],
        isSystemRole: true
      },
      {
        id: 'role-worker',
        name: 'Field Worker',
        description: 'Basic field access for construction workers',
        level: 4,
        permissions: ['field.read', 'tasks.update', 'timesheets.manage'],
        isSystemRole: true
      }
    ];
  };

  const getMockPermissions = (): Permission[] => {
    return [
      {
        id: 'perm-1',
        name: 'Project Management',
        description: 'Full project management access',
        category: 'Projects',
        resource: 'project',
        actions: ['create', 'read', 'update', 'delete', 'approve']
      },
      {
        id: 'perm-2',
        name: 'Field Operations',
        description: 'Field operations and daily activities',
        category: 'Field',
        resource: 'field',
        actions: ['read', 'update', 'create']
      },
      {
        id: 'perm-3',
        name: 'Safety Management',
        description: 'Safety incident and compliance management',
        category: 'Safety',
        resource: 'safety',
        actions: ['read', 'create', 'update', 'manage']
      },
      {
        id: 'perm-4',
        name: 'Quality Control',
        description: 'Quality inspections and control',
        category: 'Quality',
        resource: 'quality',
        actions: ['read', 'create', 'update', 'approve']
      },
      {
        id: 'perm-5',
        name: 'User Management',
        description: 'User and role management',
        category: 'Administration',
        resource: 'users',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      }
    ];
  };

  const calculateMetrics = (users: User[], companies: Company[], roles: UserRole[]): UserMetrics => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;

    const roleDistribution = roles.map(role => {
      const count = users.filter(u => u.role.id === role.id).length;
      return {
        role: role.name,
        count,
        percentage: totalUsers > 0 ? (count / totalUsers) * 100 : 0
      };
    });

    const companyDistribution = companies.map(company => ({
      company: company.name,
      userCount: users.filter(u => u.companyId === company.id).length,
      type: company.type
    }));

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalCompanies: companies.length,
      totalRoles: roles.length,
      loginActivity: [
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), logins: 45, uniqueUsers: 18 },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), logins: 52, uniqueUsers: 22 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), logins: 38, uniqueUsers: 16 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), logins: 41, uniqueUsers: 19 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), logins: 47, uniqueUsers: 21 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), logins: 35, uniqueUsers: 15 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), logins: 29, uniqueUsers: 14 }
      ],
      roleDistribution,
      companyDistribution
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (roleLevel: number) => {
    switch (roleLevel) {
      case 1: return Crown;
      case 2: return Star;
      case 3: return Award;
      case 4: return Users;
      default: return Users;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role.id === roleFilter;
    const matchesCompany = companyFilter === 'all' || user.companyId === companyFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesCompany;
  });

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'companies', label: 'Companies', icon: Building },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage users, roles, permissions, and company access</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Companies</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'users' && (
          <UsersTab 
            users={filteredUsers}
            onSelectUser={setSelectedUser}
            onCreateUser={() => setShowCreateModal(true)}
            getStatusColor={getStatusColor}
            getRoleIcon={getRoleIcon}
          />
        )}
        {activeTab === 'roles' && (
          <RolesTab 
            roles={roles}
            permissions={permissions}
          />
        )}
        {activeTab === 'companies' && (
          <CompaniesTab 
            companies={companies}
          />
        )}
        {activeTab === 'overview' && metrics && (
          <OverviewTab 
            metrics={metrics}
            users={users}
            companies={companies}
            roles={roles}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab />
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          companies={companies}
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newUser) => {
            setUsers([...users, newUser]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          companies={companies}
          roles={roles}
          onClose={() => setSelectedUser(null)}
          onUpdate={(updatedUser) => {
            setUsers(users.map(u => 
              u.id === updatedUser.id ? updatedUser : u
            ));
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC<{
  users: User[];
  onSelectUser: (user: User) => void;
  onCreateUser: () => void;
  getStatusColor: (status: string) => string;
  getRoleIcon: (level: number) => any;
}> = ({ users, onSelectUser, onCreateUser, getStatusColor, getRoleIcon }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-600 mb-4">Add users to start managing your team</p>
        <button
          onClick={onCreateUser}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {users.map((user) => {
          const RoleIcon = getRoleIcon(user.role.level);
          return (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.displayName} className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-blue-600 font-medium text-lg">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{user.displayName}</h4>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      <div className="ml-2 flex items-center text-gray-500">
                        <RoleIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">{user.role.name}</span>
                      </div>
                      {user.twoFactorEnabled && (
                        <Shield className="w-4 h-4 ml-2 text-green-600" title="2FA Enabled" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{user.title} • {user.company}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium">{user.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <p className="font-medium">{user.department}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Login:</span>
                        <p className="font-medium">
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Projects: </span>
                      <span className="font-medium">{user.projects.length} assigned</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectUser(user)}
                    className="p-2 text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit User">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    className={`p-2 ${user.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                  >
                    {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800" title="More Options">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Roles Tab Component
const RolesTab: React.FC<{
  roles: UserRole[];
  permissions: Permission[];
}> = ({ roles, permissions }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">System Roles</h4>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{role.name}</h5>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    role.level === 1 ? 'bg-red-100 text-red-800' :
                    role.level === 2 ? 'bg-orange-100 text-orange-800' :
                    role.level === 3 ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Level {role.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="text-xs text-gray-500">
                  {role.permissions.length} permissions
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Permission Categories</h4>
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div key={permission.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-1">{permission.name}</h5>
                <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Category: {permission.category}</span>
                  <span className="text-gray-500">Actions: {permission.actions.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Companies Tab Component
const CompaniesTab: React.FC<{
  companies: Company[];
}> = ({ companies }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Companies</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </button>
      </div>

      <div className="grid gap-4">
        {companies.map((company) => (
          <div key={company.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{company.name}</h4>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.type === 'owner' ? 'bg-purple-100 text-purple-800' :
                    company.type === 'contractor' ? 'bg-blue-100 text-blue-800' :
                    company.type === 'subcontractor' ? 'bg-green-100 text-green-800' :
                    company.type === 'consultant' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {company.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Address:</span>
                    <p className="font-medium">{company.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{company.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Users:</span>
                    <p className="font-medium">{company.userCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Projects:</span>
                    <p className="font-medium">{company.projectCount}</p>
                  </div>
                </div>
                {company.website && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Website: </span>
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:text-blue-800" title="View Details">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800" title="Edit Company">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  metrics: UserMetrics;
  users: User[];
  companies: Company[];
  roles: UserRole[];
}> = ({ metrics, users, companies, roles }) => {
  const kpis = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toString(),
      change: 8.2,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toString(),
      change: 5.1,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Companies',
      value: metrics.totalCompanies.toString(),
      change: 0,
      icon: Building,
      color: 'purple'
    },
    {
      title: 'System Roles',
      value: metrics.totalRoles.toString(),
      change: 0,
      icon: Shield,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                  <Icon className={`w-5 h-5 text-${kpi.color}-600`} />
                </div>
                {kpi.change !== 0 && (
                  <div className={`flex items-center text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${kpi.change < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(kpi.change)}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{kpi.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-medium text-green-600">{metrics.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium text-yellow-600">{metrics.pendingUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Suspended</span>
              <span className="text-sm font-medium text-red-600">{metrics.suspendedUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {metrics.roleDistribution.map((role, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{role.role}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{role.count}</span>
                  <span className="text-xs text-gray-500">({role.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Settings</h3>
      <p className="text-gray-600">Configure user management policies and security settings</p>
    </div>
  );
};

// Create User Modal Component
const CreateUserModal: React.FC<{
  companies: Company[];
  roles: UserRole[];
  onClose: () => void;
  onSuccess: (user: User) => void;
}> = ({ companies, roles, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    title: '',
    department: '',
    companyId: '',
    roleId: '',
    sendInvite: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedRole = roles.find(r => r.id === formData.roleId);
    const selectedCompany = companies.find(c => c.id === formData.companyId);
    
    if (!selectedRole || !selectedCompany) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      displayName: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      title: formData.title,
      department: formData.department,
      company: selectedCompany.name,
      companyId: formData.companyId,
      role: selectedRole,
      permissions: [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: [],
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          push: true,
          sms: false,
          frequency: 'immediate'
        },
        dashboard: {
          layout: 'default',
          widgets: []
        }
      },
      twoFactorEnabled: false,
      loginAttempts: 0,
      passwordLastChanged: new Date(),
      mustChangePassword: true
    };

    onSuccess(newUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select
                required
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                required
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="sendInvite"
              checked={formData.sendInvite}
              onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="sendInvite" className="ml-2 text-sm text-gray-700">
              Send invitation email to user
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal: React.FC<{
  user: User;
  companies: Company[];
  roles: UserRole[];
  onClose: () => void;
  onUpdate: (user: User) => void;
}> = ({ user, companies, roles, onClose, onUpdate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{user.displayName}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <span className="ml-2 font-medium">{user.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Title:</span>
                  <span className="ml-2 font-medium">{user.title}</span>
                </div>
                <div>
                  <span className="text-gray-500">Department:</span>
                  <span className="ml-2 font-medium">{user.department}</span>
                </div>
                <div>
                  <span className="text-gray-500">Company:</span>
                  <span className="ml-2 font-medium">{user.company}</span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <span className="ml-2 font-medium">{user.role.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Account Security</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Two-Factor Auth:</span>
                  <span className={`ml-2 font-medium ${user.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Login:</span>
                  <span className="ml-2 font-medium">
                    {user.lastLogin ? user.lastLogin.toLocaleString() : 'Never'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Password Changed:</span>
                  <span className="ml-2 font-medium">{user.passwordLastChanged.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Must Change Password:</span>
                  <span className={`ml-2 font-medium ${user.mustChangePassword ? 'text-orange-600' : 'text-green-600'}`}>
                    {user.mustChangePassword ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Failed Login Attempts:</span>
                  <span className="ml-2 font-medium">{user.loginAttempts}</span>
                </div>
              </div>
            </div>
          </div>

          {user.projects.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Project Assignments</h4>
              <div className="space-y-2">
                {user.projects.map((project, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-sm text-gray-600">{project.role}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        Assigned: {project.assignedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'suspended': return 'text-red-600 bg-red-100';
    case 'inactive': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default UserManagementDashboard;
