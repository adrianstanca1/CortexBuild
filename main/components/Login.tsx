

import React, { useState, useEffect } from 'react';
// FIX: Corrected import paths to be relative.
import { Company, User, Role } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [usersByCompany, setUsersByCompany] = useState<[Company, User[]][]>([]);
  const [principalAdmin, setPrincipalAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const companies = await api.getCompanies();
      
      const allUsers = (await Promise.all(
        companies.map(c => api.getUsersByCompany(c.id))
      )).flat();
      
      const superAdmin = (await api.getUsersByCompany(0)).find(u => u.role === Role.PRINCIPAL_ADMIN) || null; // A bit of a hack for mock API
      if (!superAdmin) {
          const allSystemUsers = await api.getUsersByCompany();
          setPrincipalAdmin(allSystemUsers.find(u => u.role === Role.PRINCIPAL_ADMIN) || null);
      } else {
        setPrincipalAdmin(superAdmin);
      }


      const usersByCompanyMap = new Map<number, User[]>();
      allUsers.forEach(user => {
          if (user.role !== Role.PRINCIPAL_ADMIN && user.companyId) {
            if (!usersByCompanyMap.has(user.companyId)) {
                usersByCompanyMap.set(user.companyId, []);
            }
            usersByCompanyMap.get(user.companyId)!.push(user);
          }
      });

      const usersData: [Company, User[]][] = companies.map(company => {
          return [company, usersByCompanyMap.get(company.id) || []];
      });

      setUsersByCompany(usersData);
      setLoading(false);
    }
    fetchAllData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-9 h-9 text-green-500">
                    <path fill="currentColor" d="M12 2L2 22h20L12 2z"/>
                </svg>
                <h1 className="text-3xl font-bold text-slate-800">AS Agents</h1>
            </div>
            <p className="text-slate-500">Welcome! Select a profile to sign in.</p>
        </div>
        
        {loading ? <p className="text-center text-slate-500">Loading profiles...</p> : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {principalAdmin && (
                <div>
                     <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Platform Administration</h2>
                     <button onClick={() => onLogin(principalAdmin)} className="w-full flex items-center gap-4 p-3 rounded-lg text-left hover:bg-slate-100 transition-colors">
                        <Avatar name={principalAdmin.name} className="w-10 h-10"/>
                        <div>
                            <p className="font-semibold text-slate-800">{principalAdmin.name}</p>
                            <p className="text-sm text-slate-500">{principalAdmin.role}</p>
                        </div>
                    </button>
                </div>
              )}

              {usersByCompany.map(([company, users]) => (
                <div key={company.id}>
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 pt-2 border-t">{company.name}</h2>
                    <div className="space-y-2">
                        {users.map(user => (
                            <button key={user.id} onClick={() => onLogin(user)} className="w-full flex items-center gap-4 p-3 rounded-lg text-left hover:bg-slate-100 transition-colors">
                                <Avatar name={user.name} className="w-10 h-10"/>
                                <div>
                                    <p className="font-semibold text-slate-800">{user.name}</p>
                                    <p className="text-sm text-slate-500">{user.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              ))}
            </div>
        )}
      </Card>
    </div>
  );
};
