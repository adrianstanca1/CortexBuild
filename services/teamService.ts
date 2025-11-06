// CortexBuild Team Management Service
import { User, Project, Task } from '../types';

export interface TeamMember extends User {
  skills: string[];
  certifications: string[];
  availability: 'available' | 'busy' | 'unavailable' | 'on-leave';
  workload: number; // percentage 0-100
  hourlyRate: number;
  joinDate: string;
  lastActive: string;
  performance: {
    tasksCompleted: number;
    averageRating: number;
    onTimeDelivery: number;
    qualityScore: number;
  };
  preferences: {
    workingHours: { start: string; end: string };
    timezone: string;
    notifications: boolean;
    preferredProjects: string[];
  };
}

export interface Team {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  leaderId: string;
  members: string[]; // User IDs
  skills: string[];
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TeamPerformance {
  teamId: string;
  teamName: string;
  period: { start: string; end: string };
  metrics: {
    productivity: {
      tasksCompleted: number;
      averageCompletionTime: number;
      efficiency: number;
    };
    collaboration: {
      communicationScore: number;
      knowledgeSharing: number;
      conflictResolution: number;
    };
    quality: {
      defectRate: number;
      reworkRate: number;
      customerSatisfaction: number;
    };
    delivery: {
      onTimeDelivery: number;
      budgetAdherence: number;
      scopeCompliance: number;
    };
  };
  recommendations: string[];
}

export interface SkillMatrix {
  skill: string;
  category: 'technical' | 'soft' | 'certification' | 'domain';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required: boolean;
  teamMembers: {
    userId: string;
    userName: string;
    currentLevel: string;
    targetLevel: string;
    gap: number;
  }[];
}

class TeamService {
  private teams: Team[] = [];
  private teamMembers: TeamMember[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize mock team members
    this.teamMembers = [
      {
        id: 'user-1',
        email: 'adrian.stanca1@gmail.com',
        name: 'Adrian Stanca',
        role: 'super_admin',
        companyId: 'company-1',
        skills: ['Project Management', 'Leadership', 'Strategic Planning', 'Risk Management'],
        certifications: ['PMP', 'PRINCE2', 'Agile Certified'],
        availability: 'available',
        workload: 75,
        hourlyRate: 150,
        joinDate: '2023-01-15',
        lastActive: new Date().toISOString(),
        performance: {
          tasksCompleted: 245,
          averageRating: 4.8,
          onTimeDelivery: 95,
          qualityScore: 92
        },
        preferences: {
          workingHours: { start: '09:00', end: '17:00' },
          timezone: 'GMT',
          notifications: true,
          preferredProjects: ['project-1']
        }
      },
      {
        id: 'user-2',
        email: 'adrian@ascladdingltd.co.uk',
        name: 'Adrian ASC',
        role: 'company_admin',
        companyId: 'company-1',
        skills: ['Construction Management', 'Quality Control', 'Safety Management', 'Team Leadership'],
        certifications: ['CSCS', 'SMSTS', 'First Aid'],
        availability: 'available',
        workload: 85,
        hourlyRate: 95,
        joinDate: '2023-03-01',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        performance: {
          tasksCompleted: 189,
          averageRating: 4.6,
          onTimeDelivery: 88,
          qualityScore: 94
        },
        preferences: {
          workingHours: { start: '08:00', end: '16:00' },
          timezone: 'GMT',
          notifications: true,
          preferredProjects: ['project-1']
        }
      },
      {
        id: 'user-3',
        email: 'adrian.stanca1@icloud.com',
        name: 'Adrian Developer',
        role: 'developer',
        companyId: 'company-2',
        skills: ['React', 'TypeScript', 'Node.js', 'Database Design', 'UI/UX'],
        certifications: ['AWS Certified', 'React Certified'],
        availability: 'busy',
        workload: 90,
        hourlyRate: 75,
        joinDate: '2023-06-15',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        performance: {
          tasksCompleted: 156,
          averageRating: 4.7,
          onTimeDelivery: 92,
          qualityScore: 89
        },
        preferences: {
          workingHours: { start: '10:00', end: '18:00' },
          timezone: 'GMT',
          notifications: true,
          preferredProjects: ['project-2']
        }
      }
    ];

    // Initialize mock teams
    this.teams = [
      {
        id: 'team-1',
        name: 'Canary Wharf Construction Team',
        description: 'Primary construction team for the Canary Wharf Tower renovation project',
        projectId: 'project-1',
        leaderId: 'user-2',
        members: ['user-1', 'user-2'],
        skills: ['Construction Management', 'Project Management', 'Quality Control', 'Safety Management'],
        status: 'active',
        createdAt: '2023-01-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'team-2',
        name: 'Development Team',
        description: 'Software development and platform enhancement team',
        leaderId: 'user-3',
        members: ['user-3'],
        skills: ['React', 'TypeScript', 'Node.js', 'Database Design'],
        status: 'active',
        createdAt: '2023-06-15T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Get all team members with filtering
  async getTeamMembers(filters: {
    companyId?: string;
    skills?: string[];
    availability?: string;
    role?: string;
    projectId?: string;
  } = {}): Promise<TeamMember[]> {
    let members = [...this.teamMembers];

    if (filters.companyId) {
      members = members.filter(member => member.companyId === filters.companyId);
    }

    if (filters.skills && filters.skills.length > 0) {
      members = members.filter(member => 
        filters.skills!.some(skill => member.skills.includes(skill))
      );
    }

    if (filters.availability) {
      members = members.filter(member => member.availability === filters.availability);
    }

    if (filters.role) {
      members = members.filter(member => member.role === filters.role);
    }

    if (filters.projectId) {
      members = members.filter(member => 
        member.preferences.preferredProjects.includes(filters.projectId!)
      );
    }

    return members;
  }

  // Get team member by ID
  async getTeamMember(id: string): Promise<TeamMember | null> {
    return this.teamMembers.find(member => member.id === id) || null;
  }

  // Update team member
  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember | null> {
    const index = this.teamMembers.findIndex(member => member.id === id);
    if (index === -1) return null;

    this.teamMembers[index] = {
      ...this.teamMembers[index],
      ...updates
    };

    return this.teamMembers[index];
  }

  // Get all teams
  async getTeams(filters: {
    projectId?: string;
    status?: string;
    leaderId?: string;
  } = {}): Promise<Team[]> {
    let teams = [...this.teams];

    if (filters.projectId) {
      teams = teams.filter(team => team.projectId === filters.projectId);
    }

    if (filters.status) {
      teams = teams.filter(team => team.status === filters.status);
    }

    if (filters.leaderId) {
      teams = teams.filter(team => team.leaderId === filters.leaderId);
    }

    return teams;
  }

  // Create new team
  async createTeam(team: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const now = new Date().toISOString();
    const newTeam: Team = {
      ...team,
      id: `team-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    this.teams.push(newTeam);
    return newTeam;
  }

  // Update team
  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const index = this.teams.findIndex(team => team.id === id);
    if (index === -1) return null;

    this.teams[index] = {
      ...this.teams[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.teams[index];
  }

  // Add member to team
  async addTeamMember(teamId: string, userId: string): Promise<boolean> {
    const team = this.teams.find(t => t.id === teamId);
    if (!team || team.members.includes(userId)) return false;

    team.members.push(userId);
    team.updatedAt = new Date().toISOString();
    return true;
  }

  // Remove member from team
  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return false;

    const index = team.members.indexOf(userId);
    if (index === -1) return false;

    team.members.splice(index, 1);
    team.updatedAt = new Date().toISOString();
    return true;
  }

  // Get team performance
  async getTeamPerformance(teamId: string, period: { start: string; end: string }): Promise<TeamPerformance | null> {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return null;

    // Mock performance data
    return {
      teamId,
      teamName: team.name,
      period,
      metrics: {
        productivity: {
          tasksCompleted: 45,
          averageCompletionTime: 3.2,
          efficiency: 87
        },
        collaboration: {
          communicationScore: 92,
          knowledgeSharing: 85,
          conflictResolution: 78
        },
        quality: {
          defectRate: 2.1,
          reworkRate: 5.3,
          customerSatisfaction: 94
        },
        delivery: {
          onTimeDelivery: 89,
          budgetAdherence: 96,
          scopeCompliance: 91
        }
      },
      recommendations: [
        'Improve communication tools to enhance collaboration score',
        'Implement peer review process to reduce defect rate',
        'Provide additional training on time management'
      ]
    };
  }

  // Generate skill matrix
  async generateSkillMatrix(teamId?: string): Promise<SkillMatrix[]> {
    const members = teamId 
      ? this.teamMembers.filter(m => {
          const team = this.teams.find(t => t.id === teamId);
          return team?.members.includes(m.id);
        })
      : this.teamMembers;

    const allSkills = [...new Set(members.flatMap(m => m.skills))];

    return allSkills.map(skill => ({
      skill,
      category: this.getSkillCategory(skill),
      level: 'intermediate',
      required: true,
      teamMembers: members
        .filter(m => m.skills.includes(skill))
        .map(m => ({
          userId: m.id,
          userName: m.name,
          currentLevel: 'intermediate',
          targetLevel: 'advanced',
          gap: 1
        }))
    }));
  }

  // Suggest team composition for project
  async suggestTeamComposition(
    projectRequirements: {
      skills: string[];
      teamSize: number;
      duration: number;
      budget: number;
    }
  ): Promise<{
    suggestedMembers: TeamMember[];
    totalCost: number;
    skillCoverage: number;
    confidence: number;
  }> {
    const availableMembers = this.teamMembers.filter(m => 
      m.availability === 'available' && m.workload < 80
    );

    // Simple algorithm to match skills and availability
    const suggestedMembers = availableMembers
      .filter(member => 
        projectRequirements.skills.some(skill => member.skills.includes(skill))
      )
      .slice(0, projectRequirements.teamSize);

    const totalCost = suggestedMembers.reduce((sum, member) => 
      sum + (member.hourlyRate * projectRequirements.duration), 0
    );

    const skillCoverage = (suggestedMembers.flatMap(m => m.skills)
      .filter(skill => projectRequirements.skills.includes(skill)).length / 
      projectRequirements.skills.length) * 100;

    return {
      suggestedMembers,
      totalCost,
      skillCoverage: Math.min(100, skillCoverage),
      confidence: suggestedMembers.length >= projectRequirements.teamSize ? 85 : 60
    };
  }

  // Get team workload distribution
  async getTeamWorkload(teamId?: string): Promise<{
    members: {
      userId: string;
      userName: string;
      currentWorkload: number;
      capacity: number;
      availability: string;
      upcomingTasks: number;
    }[];
    averageWorkload: number;
    overloadedMembers: number;
  }> {
    const members = teamId 
      ? this.teamMembers.filter(m => {
          const team = this.teams.find(t => t.id === teamId);
          return team?.members.includes(m.id);
        })
      : this.teamMembers;

    const workloadData = members.map(member => ({
      userId: member.id,
      userName: member.name,
      currentWorkload: member.workload,
      capacity: 100,
      availability: member.availability,
      upcomingTasks: Math.floor(Math.random() * 10) + 1 // Mock data
    }));

    const averageWorkload = workloadData.reduce((sum, m) => sum + m.currentWorkload, 0) / workloadData.length;
    const overloadedMembers = workloadData.filter(m => m.currentWorkload > 90).length;

    return {
      members: workloadData,
      averageWorkload: Math.round(averageWorkload),
      overloadedMembers
    };
  }

  private getSkillCategory(skill: string): 'technical' | 'soft' | 'certification' | 'domain' {
    const technicalSkills = ['React', 'TypeScript', 'Node.js', 'Database Design', 'UI/UX'];
    const certifications = ['PMP', 'PRINCE2', 'Agile Certified', 'CSCS', 'SMSTS', 'First Aid', 'AWS Certified'];
    const domainSkills = ['Construction Management', 'Project Management', 'Quality Control', 'Safety Management'];
    
    if (technicalSkills.includes(skill)) return 'technical';
    if (certifications.includes(skill)) return 'certification';
    if (domainSkills.includes(skill)) return 'domain';
    return 'soft';
  }
}

export const teamService = new TeamService();
export default teamService;
