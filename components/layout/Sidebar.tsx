import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to import
import { Project, Screen, User, PermissionAction, PermissionSubject } from '../../types.ts';
import { usePermissions } from '../../hooks/usePermissions.ts';
// Fix: Added .tsx extension to import
import { 
    ChevronLeftIcon, BuildingOfficeIcon, ListBulletIcon, DocumentIcon,
    CheckBadgeIcon, DocumentDuplicateIcon, CameraIcon, ClipboardDocumentListIcon,
    BellIcon, TicketIcon, SunIcon, QuestionMarkCircleIcon, ArrowLeftOnRectangleIcon
} from '../Icons.tsx';

interface SidebarProps {
    project: Project;
    navigateTo: (screen: Screen, params?: any) => void;
    navigateToModule?: (screen: Screen, params?: any) => void;
    goHome: () => void;
    currentUser: User;
    onLogout: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.FC<any>;
    onClick: () => void;
}> = ({ label, icon: Icon, onClick }) => (
    <li>
        <button onClick={onClick} className="w-full flex items-center p-3 text-sm text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <Icon className="w-6 h-6 mr-3 text-slate-400" />
            <span>{label}</span>
        </button>
    </li>
);

const RealtimeInfoCard: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const [weather, setWeather] = useState<{ temp: string, condition: string, icon: React.FC<any> } | null>(null);

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    useEffect(() => {
        // Mock weather fetch
        setTimeout(() => {
            setWeather({
                temp: '15°C',
                condition: 'Sunny',
                icon: SunIcon
            });
        }, 1500);
    }, []);

    // Cleaner format without seconds, but still updates every second.
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    const WeatherIcon = weather?.icon;

    return (
        // Replaced card with a more integrated section. The mb-6 keeps it consistent with the old layout spacing.
        <div className="mb-6 py-4 text-center border-y border-slate-700">
            {/* Large, prominent time */}
            <div className="text-4xl font-bold text-white tracking-wider">{formattedTime}</div>
            {/* Smaller, lighter date */}
            <div className="text-sm text-slate-400 mt-1">{formattedDate}</div>
             {/* Centered weather info */}
            <div className="flex items-center justify-center gap-2 mt-4 text-slate-300">
                {weather && WeatherIcon ? (
                    <>
                        <WeatherIcon className="w-6 h-6 text-yellow-400" />
                        <span className="font-semibold">{weather.temp}, {weather.condition}</span>
                    </>
                ) : (
                    <div className="h-6 flex items-center">
                         <span className="text-xs text-slate-500">Loading weather...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ project, navigateTo, navigateToModule, goHome, currentUser, onLogout }) => {
    const { can } = usePermissions(currentUser);

    const allNavItems = [
        { label: 'My Projects', screen: 'projects', icon: BuildingOfficeIcon, permission: { subject: 'task', action: 'read' } }, // Simplified permission
        { label: 'My Day', screen: 'my-day', icon: SunIcon, permission: { subject: 'task', action: 'read' } },
        { label: 'Tasks', screen: 'tasks', icon: ListBulletIcon, permission: { subject: 'task', action: 'read' } },
        { label: 'Daily Logs', screen: 'daily-log', icon: ClipboardDocumentListIcon, permission: { subject: 'dailyLog', action: 'read' } },
        { label: 'Photos', screen: 'photos', icon: CameraIcon, permission: { subject: 'photo', action: 'read' } },
        { label: 'RFIs', screen: 'rfis', icon: QuestionMarkCircleIcon, permission: { subject: 'rfi', action: 'read' } },
        { label: 'Punch List', screen: 'punch-list', icon: CheckBadgeIcon, permission: { subject: 'punchListItem', action: 'read' } },
        { label: 'Drawings', screen: 'drawings', icon: DocumentDuplicateIcon, permission: { subject: 'drawing', action: 'read' } },
        { label: 'Daywork Sheets', screen: 'daywork-sheets', icon: TicketIcon, permission: { subject: 'dayworkSheet', action: 'read' } },
        { label: 'Documents', screen: 'documents', icon: DocumentIcon, permission: { subject: 'document', action: 'read' } },
    ];
    
    // In project view, only show project-specific items. In global view, only show global items.
    const isProjectView = !!project.id;
    const itemsToShow = isProjectView 
        ? allNavItems.filter(item => item.screen !== 'projects')
        : [allNavItems.find(item => item.screen === 'projects')!];
    
    const visibleNavItems = itemsToShow.filter(item => can(item.permission.action as PermissionAction, item.permission.subject as PermissionSubject));


    return (
        <div className="flex flex-col h-full p-4">
            <div className="mb-6">
                <button onClick={goHome} className="block text-left">
                    <h1 className="text-xl font-bold text-white">{project.name}</h1>
                    <p className="text-sm text-slate-400">{project.location}</p>
                </button>
            </div>

            <RealtimeInfoCard />

            <nav className="flex-grow">
                <ul className="space-y-1">
                    {visibleNavItems.map(item => {
                        // "My Projects" should always reset the stack, so it uses navigateToModule if available.
                        // In global view, `navigateTo` is already `navigateToModule`.
                        const navFunc = (item.screen === 'projects' && navigateToModule) ? navigateToModule : navigateTo;
                        return <NavItem key={item.screen} label={item.label} icon={item.icon} onClick={() => navFunc(item.screen as Screen)} />
                    })}
                </ul>
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-700">
                 <div className="text-center text-slate-300 p-3 mb-2">
                    <p className="font-semibold">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>
                <button onClick={onLogout} className="w-full flex items-center justify-center p-3 text-sm text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;