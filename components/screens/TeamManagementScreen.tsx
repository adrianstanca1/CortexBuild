import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { teamService, TeamMember, Team, SkillMatrix } from '../../services/teamService';

interface TeamManagementScreenProps {
  currentUser: User;
  onNavigate: (screen: string, params?: any) => void;
}

const TeamManagementScreen: React.FC<TeamManagementScreenProps> = ({ currentUser, onNavigate }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [skillMatrix, setSkillMatrix] = useState<SkillMatrix[]>([]);
  const [workloadData, setWorkloadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'teams' | 'skills' | 'workload'>('members');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser, selectedTeam]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load team members
      const members = await teamService.getTeamMembers({
        companyId: currentUser.role === 'super_admin' ? undefined : currentUser.companyId
      });
      setTeamMembers(members);

      // Load teams
      const teamsData = await teamService.getTeams();
      setTeams(teamsData);

      // Load skill matrix
      const skills = await teamService.generateSkillMatrix(selectedTeam || undefined);
      setSkillMatrix(skills);

      // Load workload data
      const workload = await teamService.getTeamWorkload(selectedTeam || undefined);
      setWorkloadData(workload);
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      case 'on-leave': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 75) return 'bg-yellow-500';
    if (workload >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkill = !filterSkill || member.skills.includes(filterSkill);
    const matchesAvailability = !filterAvailability || member.availability === filterAvailability;
    
    return matchesSearch && matchesSkill && matchesAvailability;
  });

  const allSkills = [...new Set(teamMembers.flatMap(member => member.skills))];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage team members, skills, and performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => onNavigate('new-team')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Team
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'members', name: 'Team Members', icon: '👥' },
            { id: 'teams', name: 'Teams', icon: '🏢' },
            { id: 'skills', name: 'Skills Matrix', icon: '🎯' },
            { id: 'workload', name: 'Workload', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Team Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill</label>
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Skills</option>
                  {allSkills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filterAvailability}
                  onChange={(e) => setFilterAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={loadData}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <div key={member.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(member.availability)}`}>
                    {member.availability}
                  </span>
                </div>
                
                {/* Workload Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Workload</span>
                    <span className="font-medium">{member.workload}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getWorkloadColor(member.workload)}`}
                      style={{ width: `${member.workload}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(member.performance.onTimeDelivery)}`}>
                      {member.performance.onTimeDelivery}%
                    </div>
                    <div className="text-xs text-gray-500">On Time</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(member.performance.qualityScore)}`}>
                      {member.performance.qualityScore}%
                    </div>
                    <div className="text-xs text-gray-500">Quality</div>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{member.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('member-detail', { memberId: member.id })}
                    className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onNavigate('assign-tasks', { memberId: member.id })}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Assign Tasks
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map(team => (
              <div key={team.id} className="bg-white rounded-lg shadow border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    team.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Members</span>
                    <span className="font-medium">{team.members.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Leader</span>
                    <span className="font-medium">
                      {teamMembers.find(m => m.id === team.leaderId)?.name || 'Unknown'}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {team.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {team.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{team.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => onNavigate('team-detail', { teamId: team.id })}
                    className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                  >
                    View Team
                  </button>
                  <button
                    onClick={() => onNavigate('team-performance', { teamId: team.id })}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Performance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Matrix Tab */}
      {activeTab === 'skills' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-gray-900">Skills Matrix</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of team skills and competencies</p>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Skill</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Team Members</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {skillMatrix.map((skill, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{skill.skill}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          skill.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                          skill.category === 'certification' ? 'bg-green-100 text-green-800' :
                          skill.category === 'domain' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {skill.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {skill.teamMembers.slice(0, 3).map(member => (
                            <span key={member.userId} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {member.userName}
                            </span>
                          ))}
                          {skill.teamMembers.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{skill.teamMembers.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(skill.teamMembers.length / teamMembers.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {Math.round((skill.teamMembers.length / teamMembers.length) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workload Tab */}
      {activeTab === 'workload' && workloadData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">{workloadData.averageWorkload}%</div>
              <div className="text-sm text-gray-600">Average Workload</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl font-bold text-red-600">{workloadData.overloadedMembers}</div>
              <div className="text-sm text-gray-600">Overloaded Members</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">{workloadData.members.filter(m => m.availability === 'available').length}</div>
              <div className="text-sm text-gray-600">Available Members</div>
            </div>
          </div>

          {/* Workload Details */}
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">Team Workload Distribution</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {workloadData.members.map((member: any) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {member.userName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{member.userName}</h3>
                        <p className="text-sm text-gray-500">{member.upcomingTasks} upcoming tasks</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Workload</span>
                          <span className="font-medium">{member.currentWorkload}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getWorkloadColor(member.currentWorkload)}`}
                            style={{ width: `${member.currentWorkload}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(member.availability)}`}>
                        {member.availability}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementScreen;
