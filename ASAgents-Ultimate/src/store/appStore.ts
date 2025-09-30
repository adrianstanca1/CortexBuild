import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
}

interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: string;
}

interface AppState {
  projects: Project[];
  invoices: Invoice[];
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setInvoices: (invoices: Invoice[]) => void;
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // CRUD operations
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      projects: [],
      invoices: [],
      teamMembers: [],
      loading: false,
      error: null,

      setProjects: (projects) => set({ projects }),
      setInvoices: (invoices) => set({ invoices }),
      setTeamMembers: (teamMembers) => set({ teamMembers }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      addInvoice: (invoice) =>
        set((state) => ({
          invoices: [...state.invoices, invoice],
        })),
      updateInvoice: (id, updates) =>
        set((state) => ({
          invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      deleteInvoice: (id) =>
        set((state) => ({
          invoices: state.invoices.filter((i) => i.id !== id),
        })),

      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [...state.teamMembers, member],
        })),
      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'AppStore',
    }
  )
);
