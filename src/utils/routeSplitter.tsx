import { lazy, ComponentType } from 'react';

// Route-based component splitting with preloading
export interface RouteComponent {
  component: ComponentType<any>;
  preload: () => Promise<void>;
}

// Core screens - loaded immediately for better UX
const UnifiedDashboardScreen = lazy(() => import('../../components/screens/UnifiedDashboardScreen'));
const ProjectsListScreen = lazy(() => import('../../components/screens/ProjectsListScreen'));
const ProjectHomeScreen = lazy(() => import('../../components/screens/ProjectHomeScreen'));

// Project screens - loaded on demand
const MyDayScreen = lazy(() => import('../../components/screens/MyDayScreen'));
const TasksScreen = lazy(() => import('../../components/screens/TasksScreen'));
const TaskDetailScreen = lazy(() => import('../../components/screens/TaskDetailScreen'));
const NewTaskScreen = lazy(() => import('../../components/screens/NewTaskScreen'));
const DailyLogScreen = lazy(() => import('../../components/screens/DailyLogScreen'));
const PhotoGalleryScreen = lazy(() => import('../../components/screens/PhotoGalleryScreen'));

// RFI screens - loaded on demand
const RFIsScreen = lazy(() => import('../../components/screens/RFIsScreen'));
const RFIDetailScreen = lazy(() => import('../../components/screens/RFIDetailScreen'));
const NewRFIScreen = lazy(() => import('../../components/screens/NewRFIScreen'));

// Punch list screens - loaded on demand
const PunchListScreen = lazy(() => import('../../components/screens/PunchListScreen'));
const PunchListItemDetailScreen = lazy(() => import('../../components/screens/PunchListItemDetailScreen'));
const NewPunchListItemScreen = lazy(() => import('../../components/screens/NewPunchListItemScreen'));

// Drawing and document screens - loaded on demand
const DrawingsScreen = lazy(() => import('../../components/screens/DrawingsScreen'));
const PlansViewerScreen = lazy(() => import('../../components/screens/PlansViewerScreen'));
const DocumentsScreen = lazy(() => import('../../components/screens/DocumentsScreen'));
const DayworkSheetsListScreen = lazy(() => import('../../components/screens/DayworkSheetsListScreen'));
const DayworkSheetDetailScreen = lazy(() => import('../../components/screens/DayworkSheetDetailScreen'));
const NewDayworkSheetScreen = lazy(() => import('../../components/screens/NewDayworkSheetScreen'));

// Module screens - loaded on demand
const AccountingScreen = lazy(() => import('../../components/screens/modules/AccountingScreen'));
const AIToolsScreen = lazy(() => import('../../components/screens/modules/AIToolsScreen'));
const DocumentManagementScreen = lazy(() => import('../../components/screens/modules/DocumentManagementScreen'));
const TimeTrackingScreen = lazy(() => import('../../components/screens/modules/TimeTrackingScreen'));
const ProjectOperationsScreen = lazy(() => import('../../components/screens/modules/ProjectOperationsScreen'));
const FinancialManagementScreen = lazy(() => import('../../components/screens/modules/FinancialManagementScreen'));
const BusinessDevelopmentScreen = lazy(() => import('../../components/screens/modules/BusinessDevelopmentScreen'));
const AIAgentsMarketplaceScreen = lazy(() => import('../../components/screens/modules/AIAgentsMarketplaceScreen'));

// Developer screens - loaded on demand
const DeveloperWorkspaceScreen = lazy(() => import('../../components/screens/developer/DeveloperWorkspaceScreen'));
const EnhancedDeveloperConsole = lazy(() => import('../../components/screens/developer/EnhancedDeveloperConsole'));
const DeveloperDashboardV2 = lazy(() => import('../../components/screens/developer/DeveloperDashboardV2'));
const ConstructionAutomationStudio = lazy(() => import('../../components/screens/developer/ConstructionAutomationStudio'));

// Admin screens - loaded on demand
const PlatformAdminScreen = lazy(() => import('../../components/screens/admin/PlatformAdminScreen'));
const SuperAdminDashboardScreen = lazy(() => import('../../components/screens/admin/SuperAdminDashboardScreen'));
const AdminControlPanel = lazy(() => import('../../components/admin/AdminControlPanel'));
const SuperAdminDashboardV2 = lazy(() => import('../../components/admin/SuperAdminDashboardV2'));

// Company screens - loaded on demand
const CompanyAdminDashboardV2 = lazy(() => import('../../components/screens/company/CompanyAdminDashboardV2'));

// SDK and heavy components - loaded on demand
const ProductionSDKDeveloperView = lazy(() =>
    import('../../components/sdk/ProductionSDKDeveloperView').then(module => ({
        default: module.ProductionSDKDeveloperView
    }))
);
const N8nProcoreWorkflowBuilder = lazy(() => import('../../components/sdk/N8nProcoreWorkflowBuilder'));
const ConstructionOracle = lazy(() => import('../../components/ai/ConstructionOracle'));

// Marketplace components - loaded on demand
const GlobalMarketplace = lazy(() => import('../../components/marketplace/GlobalMarketplace'));
const AdminReviewInterface = lazy(() => import('../../components/marketplace/AdminReviewInterface'));
const DeveloperSubmissionInterface = lazy(() => import('../../components/marketplace/DeveloperSubmissionInterface'));

// Application components - loaded on demand
const Base44Clone = lazy(() =>
    import('../../components/base44/Base44Clone').then(module => ({
        default: module.Base44Clone
    }))
);
const MyApplications = lazy(() => import('../../components/applications/MyApplications'));

// Advanced features - loaded on demand
const AdvancedMLDashboard = lazy(() => import('../../components/screens/dashboards/AdvancedMLDashboard'));
const MyTasksScreen = lazy(() => import('../../components/screens/MyTasksScreen'));
const PlaceholderToolScreen = lazy(() => import('../../components/screens/tools/PlaceholderToolScreen'));

// Helper function to create route components with preloading
const createRouteComponent = (importFn: () => Promise<{ default: ComponentType<any> }>): RouteComponent => {
  let componentPromise: Promise<{ default: ComponentType<any> }> | null = null;
  let Component: ComponentType<any> | null = null;

  return {
    component: (props: any) => {
      if (!Component) {
        if (!componentPromise) {
          componentPromise = importFn().then(module => {
            Component = module.default;
            return module;
          });
        }

        throw componentPromise;
      }

      return <Component {...props} />;
    },
    preload: async () => {
      if (!componentPromise) {
        componentPromise = importFn().then(module => {
          Component = module.default;
          return module;
        });
      }
      await componentPromise;
    }
  };
};

// Create route components with preloading capability
export const RouteComponents = {
  // Core screens
  'global-dashboard': createRouteComponent(() => import('../../components/screens/UnifiedDashboardScreen')),
  'projects': createRouteComponent(() => import('../../components/screens/ProjectsListScreen')),
  'project-home': createRouteComponent(() => import('../../components/screens/ProjectHomeScreen')),

  // Project screens
  'my-day': createRouteComponent(() => import('../../components/screens/MyDayScreen')),
  'tasks': createRouteComponent(() => import('../../components/screens/TasksScreen')),
  'my-tasks': createRouteComponent(() => import('../../components/screens/MyTasksScreen')),
  'task-detail': createRouteComponent(() => import('../../components/screens/TaskDetailScreen')),
  'new-task': createRouteComponent(() => import('../../components/screens/NewTaskScreen')),
  'daily-log': createRouteComponent(() => import('../../components/screens/DailyLogScreen')),
  'photos': createRouteComponent(() => import('../../components/screens/PhotoGalleryScreen')),

  // RFI screens
  'rfis': createRouteComponent(() => import('../../components/screens/RFIsScreen')),
  'rfi-detail': createRouteComponent(() => import('../../components/screens/RFIDetailScreen')),
  'new-rfi': createRouteComponent(() => import('../../components/screens/NewRFIScreen')),

  // Punch list screens
  'punch-list': createRouteComponent(() => import('../../components/screens/PunchListScreen')),
  'punch-list-item-detail': createRouteComponent(() => import('../../components/screens/PunchListItemDetailScreen')),
  'new-punch-list-item': createRouteComponent(() => import('../../components/screens/NewPunchListItemScreen')),

  // Drawing and document screens
  'drawings': createRouteComponent(() => import('../../components/screens/DrawingsScreen')),
  'plans': createRouteComponent(() => import('../../components/screens/PlansViewerScreen')),
  'documents': createRouteComponent(() => import('../../components/screens/DocumentsScreen')),
  'daywork-sheets': createRouteComponent(() => import('../../components/screens/DayworkSheetsListScreen')),
  'daywork-sheet-detail': createRouteComponent(() => import('../../components/screens/DayworkSheetDetailScreen')),
  'new-daywork-sheet': createRouteComponent(() => import('../../components/screens/NewDayworkSheetScreen')),

  // Module screens
  'accounting': createRouteComponent(() => import('../../components/screens/modules/AccountingScreen')),
  'ai-tools': createRouteComponent(() => import('../../components/screens/modules/AIToolsScreen')),
  'document-management': createRouteComponent(() => import('../../components/screens/modules/DocumentManagementScreen')),
  'time-tracking': createRouteComponent(() => import('../../components/screens/modules/TimeTrackingScreen')),
  'project-operations': createRouteComponent(() => import('../../components/screens/modules/ProjectOperationsScreen')),
  'financial-management': createRouteComponent(() => import('../../components/screens/modules/FinancialManagementScreen')),
  'business-development': createRouteComponent(() => import('../../components/screens/modules/BusinessDevelopmentScreen')),
  'ai-agents-marketplace': createRouteComponent(() => import('../../components/screens/modules/AIAgentsMarketplaceScreen')),

  // Developer screens
  'developer-dashboard': createRouteComponent(() => import('../../components/screens/developer/DeveloperDashboardV2')),
  'automation-studio': createRouteComponent(() => import('../../components/screens/developer/ConstructionAutomationStudio')),
  'developer-workspace': createRouteComponent(() => import('../../components/screens/developer/DeveloperWorkspaceScreen')),
  'developer-console': createRouteComponent(() => import('../../components/screens/developer/EnhancedDeveloperConsole')),

  // Admin screens
  'platform-admin': createRouteComponent(() => import('../../components/screens/admin/PlatformAdminScreen')),
  'super-admin-dashboard': createRouteComponent(() => import('../../components/screens/admin/SuperAdminDashboardScreen')),
  'admin-control-panel': createRouteComponent(() => import('../../components/admin/AdminControlPanel')),

  // Company screens
  'company-admin-dashboard': createRouteComponent(() => import('../../components/screens/company/CompanyAdminDashboardV2')),

  // SDK screens
  'sdk-developer': createRouteComponent(() =>
    import('../../components/sdk/ProductionSDKDeveloperView').then(module => ({
      default: module.ProductionSDKDeveloperView
    }))
  ),

  // AI screens
  'construction-oracle': createRouteComponent(() => import('../../components/ai/ConstructionOracle')),

  // Marketplace screens
  'marketplace': createRouteComponent(() => import('../../components/marketplace/GlobalMarketplace')),
  'admin-review': createRouteComponent(() => import('../../components/marketplace/AdminReviewInterface')),
  'developer-submissions': createRouteComponent(() => import('../../components/marketplace/DeveloperSubmissionInterface')),

  // Application screens
  'my-apps-desktop': createRouteComponent(() =>
    import('../../components/base44/Base44Clone').then(module => ({
      default: module.Base44Clone
    }))
  ),
  'my-applications': createRouteComponent(() => import('../../components/applications/MyApplications')),

  // Advanced features
  'ml-analytics': createRouteComponent(() => import('../../components/screens/dashboards/AdvancedMLDashboard')),

  // Tools
  'placeholder-tool': createRouteComponent(() => import('../../components/screens/tools/PlaceholderToolScreen')),
};

// Preload critical routes
export const preloadCriticalRoutes = () => {
  // Preload core screens that users access frequently
  RouteComponents['global-dashboard'].preload();
  RouteComponents['projects'].preload();
  RouteComponents['project-home'].preload();
};

// Route groups for intelligent preloading
export const RouteGroups = {
  PROJECT_SCREENS: ['tasks', 'my-tasks', 'task-detail', 'new-task', 'daily-log', 'photos'],
  RFI_SCREENS: ['rfis', 'rfi-detail', 'new-rfi'],
  DRAWING_SCREENS: ['drawings', 'plans', 'documents'],
  ADMIN_SCREENS: ['platform-admin', 'super-admin-dashboard', 'admin-control-panel'],
  DEVELOPER_SCREENS: ['developer-dashboard', 'automation-studio', 'developer-console'],
  MODULE_SCREENS: ['accounting', 'ai-tools', 'document-management', 'time-tracking']
};

// Preload route group
export const preloadRouteGroup = (groupName: keyof typeof RouteGroups) => {
  const routes = RouteGroups[groupName];
  routes.forEach(route => {
    if (RouteComponents[route as keyof typeof RouteComponents]) {
      RouteComponents[route as keyof typeof RouteComponents].preload();
    }
  });
};