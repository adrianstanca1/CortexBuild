// full contents of components/DocumentsView.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Document, Project, Permission, CompanySettings } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface DocumentsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  isOnline: boolean;
  settings: CompanySettings | null;
}

const FileUploadModal: React.FC<{ project: Project; onClose: () => void; onSuccess: () => void; addToast: (m:string, t:'success'|'error')=>void; user: User }> = ({ project, onClose, onSuccess, addToast, user }) => {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('General');
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            addToast("Please select a file.", "error");
            return;
        }
        setIsUploading(true);
        try {
            await api.uploadDocument({
                name: file.name,
                projectId: project.id,
                category,
                // In a real app, you'd handle the file binary here
            }, user.id);
            addToast("Document uploaded successfully.", 'success');
            onSuccess();
            onClose();
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Upload failed.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e=>e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-2">Upload to {project.name}</h3>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g., Blueprints)" className="w-full p-2 border rounded mt-2" />
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} isLoading={isUploading}>Upload</Button>
                </div>
            </Card>
        </div>
    );
};


export const DocumentsView: React.FC<DocumentsViewProps> = ({ user, addToast, isOnline, settings }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const canUpload = hasPermission(user, Permission.UPLOAD_DOCUMENTS);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [docData, projData] = await Promise.all([
                api.getDocumentsByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
            ]);
            // FIX: Cast docData to any to resolve type mismatch.
            if (controller.signal.aborted) return;
            setDocuments(docData as any);
            if (controller.signal.aborted) return;
            setProjects(projData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load documents.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);
    
    const filteredDocuments = useMemo(() => {
        if (selectedProjectId === 'all') return documents;
        return documents.filter(d => d.projectId.toString() === selectedProjectId);
    }, [documents, selectedProjectId]);

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const projectForUpload = projects.find(p => p.id.toString() === selectedProjectId);

    return (
        <div className="space-y-6">
            {isUploadModalOpen && projectForUpload && (
                <FileUploadModal 
                    project={projectForUpload} 
                    onClose={() => setIsUploadModalOpen(false)}
                    onSuccess={fetchData}
                    addToast={addToast}
                    user={user}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Documents</h2>
                {canUpload && (
                    <Button onClick={() => setIsUploadModalOpen(true)} disabled={!projectForUpload}>
                        Upload Document
                    </Button>
                )}
            </div>
            
            <Card>
                <div className="mb-4">
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="p-2 border rounded bg-white dark:bg-slate-800">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Version</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Uploaded</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                            {filteredDocuments.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 font-medium">{doc.name}</td>
                                    <td className="px-6 py-4">{projectMap.get(doc.projectId)}</td>
                                    <td className="px-6 py-4">{doc.category}</td>
                                    <td className="px-6 py-4 text-center">{doc.version}</td>
                                    <td className="px-6 py-4">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};