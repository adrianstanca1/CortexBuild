import React, { useState, useEffect } from 'react';
import { Project, User, ProjectStatus } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Save, 
  X, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  FileText,
  Tag as TagIcon,
  Plus,
  Trash2
} from 'lucide-react';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (project: Partial<Project>) => void;
  onCancel: () => void;
  user: User;
}

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  location: string;
  priority: 'low' | 'medium' | 'high';
  status: ProjectStatus;
  clientId: string;
  tags: string[];
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    completed: boolean;
  }>;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
  user,
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    location: '',
    priority: 'medium',
    status: 'planning',
    clientId: '',
    tags: [],
    milestones: [],
  });
  
  const [newTag, setNewTag] = useState('');
  const [newMilestone, setNewMilestone] = useState({ name: '', date: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
        endDate: project.endDate ? project.endDate.toISOString().split('T')[0] : '',
        budget: project.budget || 0,
        location: project.location || '',
        priority: project.priority || 'medium',
        status: project.status || 'planning',
        clientId: project.clientId || '',
        tags: project.tags || [],
        milestones: project.milestones?.map(m => ({
          id: m.id,
          name: m.name,
          date: m.date.toISOString().split('T')[0],
          completed: m.completed,
        })) || [],
      });
    }
  }, [project]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const projectData: Partial<Project> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        budget: formData.budget,
        location: formData.location.trim(),
        priority: formData.priority,
        status: formData.status,
        clientId: formData.clientId,
        tags: formData.tags,
        milestones: formData.milestones.map(m => ({
          id: m.id || Date.now().toString(),
          name: m.name,
          date: new Date(m.date),
          completed: m.completed,
        })),
      };

      await onSave(projectData);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  // Add milestone
  const addMilestone = () => {
    if (newMilestone.name.trim() && newMilestone.date) {
      setFormData(prev => ({
        ...prev,
        milestones: [
          ...prev.milestones,
          {
            id: Date.now().toString(),
            name: newMilestone.name.trim(),
            date: newMilestone.date,
            completed: false,
          },
        ],
      }));
      setNewMilestone({ name: '', date: '' });
    }
  };

  // Remove milestone
  const removeMilestone = (milestoneId: string) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {project ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-muted-foreground">
            {project ? 'Update project details and settings' : 'Set up a new construction project'}
          </p>
        </div>
        
        <Button variant="outline" onClick={onCancel}>
          <X size={16} className="mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.name ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.description ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Describe the project scope and objectives"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.startDate ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.endDate ? 'border-red-500' : 'border-border'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Budget *
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-md pl-10 pr-3 py-2 ${
                    errors.budget ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full border border-border rounded-md pl-10 pr-3 py-2"
                  placeholder="Project location"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="w-full border border-border rounded-md px-3 py-2"
                placeholder="Client identifier"
              />
            </div>
          </div>
        </Card>

        {/* Tags */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tags</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 border border-border rounded-md px-3 py-2"
                placeholder="Add a tag"
              />
              <Button type="button" onClick={addTag}>
                <Plus size={16} />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <TagIcon size={12} />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-primary hover:text-primary/80"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Milestones</h2>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 border border-border rounded-md px-3 py-2"
                placeholder="Milestone name"
              />
              <input
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
                className="border border-border rounded-md px-3 py-2"
              />
              <Button type="button" onClick={addMilestone}>
                <Plus size={16} />
              </Button>
            </div>
            
            {formData.milestones.length > 0 && (
              <div className="space-y-2">
                {formData.milestones.map(milestone => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={(e) => {
                          const updatedMilestones = formData.milestones.map(m =>
                            m.id === milestone.id ? { ...m, completed: e.target.checked } : m
                          );
                          handleInputChange('milestones', updatedMilestones);
                        }}
                      />
                      <div>
                        <div className="font-medium">{milestone.name}</div>
                        <div className="text-sm text-muted-foreground">{milestone.date}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save size={16} className="mr-2" />
            {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
};
