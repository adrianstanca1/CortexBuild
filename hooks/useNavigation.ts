import { useState, useCallback } from 'react';
import { Screen, Project } from '../types.ts';

export interface NavigationItem {
    screen: Screen;
    params?: any;
    project?: Project;
}

export const useNavigation = () => {
    const [navigationStack, setNavigationStack] = useState<NavigationItem[]>([]);

    const navigateTo = useCallback((screen: Screen, params: any = {}, project?: Project) => {
        setNavigationStack(prev => [...prev, { screen, params, project }]);
    }, []);

    const navigateToModule = useCallback((screen: Screen, params: any = {}) => {
        setNavigationStack([{ screen, params, project: undefined }]);
    }, []);

    const goBack = useCallback(() => {
        setNavigationStack(prev => {
            if (prev.length > 1) {
                return prev.slice(0, -1);
            }
            return prev;
        });
    }, []); // No dependencies - uses function form of setState

    const goHome = useCallback((currentProject?: Project) => {
        if (currentProject) {
            setNavigationStack(prev => [prev[0], { screen: 'project-home', project: currentProject }]);
        } else {
            setNavigationStack([{ screen: 'global-dashboard', params: {}, project: undefined }]);
        }
    }, []); // No dependencies - navigateToModule is now inlined

    const selectProject = useCallback((project: Project) => {
        setNavigationStack([{ screen: 'project-home', project }]);
    }, []);

    const handleDeepLink = useCallback((projectId: string | null, screen: Screen, params: any, allProjects: Project[]) => {
        if (projectId) {
            const project = allProjects.find(p => p.id === projectId);
            if (project) {
                setNavigationStack([
                    { screen: 'project-home', project },
                    { screen, params, project }
                ]);
            }
        } else {
            navigateTo(screen, params);
        }
    }, [navigateTo]);

    const currentNavItem = navigationStack[navigationStack.length - 1];

    return {
        navigationStack,
        currentNavItem,
        navigateTo,
        navigateToModule,
        goBack,
        goHome,
        selectProject,
        handleDeepLink,
        setNavigationStack
    };
};