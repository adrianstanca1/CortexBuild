

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Document, Project, Permission, DocumentCategory } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DocumentStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';

interface DocumentsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  isOnline: boolean;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({ user, addToast, isOnline }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [projectFilter, setProjectFilter] = useState('all');
    
    const canUpload = hasPermission(user, Permission.UPLOAD_DOCUMENTS);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const userProjects = hasPermission(user, Permission.VIEW_ALL_PROJECTS)
                ? await api.getProjectsByCompany(user.companyId)
                : await api.getProjectsByUser(user.id);
            setProjects(userProjects);

            if (userProjects.length > 0) {
                const docs = await api.getDocumentsByProjectIds(userProjects.map(p => p.id));
                setDocuments(docs);
            }
        } catch (error) {
            addToast("Failed to load documents.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredDocuments = useMemo(() => {
        if (projectFilter === 'all') return documents;
        return documents.filter(doc => doc.projectId.toString() === projectFilter);
    }, [documents, projectFilter]);

    if (loading) return <Card><p>Loading documents...</p></Card>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Documents</h2>
                {canUpload && <Button>Upload Document</Button>}
            </div>
            <Card>
                <div className="mb-4">
                     <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="p-2 border rounded-md">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredDocuments.map(doc => (
                        <Card key={doc.id}>
                            <h3 className="font-semibold truncate">{doc.name}</h3>
                            <p className="text-sm text-slate-500">{doc.category}</p>
                            <div className="mt-4 pt-2 border-t">
                                <DocumentStatusBadge status={doc.status} />
                            </div>
                        </Card>
                    ))}
                 </div>
            </Card>
        </div>
    );
};