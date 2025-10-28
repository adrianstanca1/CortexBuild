import React from 'react';

interface AppLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    floatingMenu: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, children, floatingMenu }) => {
    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-slate-800 text-white fixed h-full z-30">
                {sidebar}
            </aside>
            <div className="flex-1 ml-64 flex flex-col">
                {floatingMenu}
                <div className="flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AppLayout;