import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, Document, Project, Permission, DocumentCategory, DocumentStatus } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DocumentStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';

// --- UploadDocumentModal Sub-Component ---
interface UploadDocumentModalProps {
  user: User;
  projects: Project[];
  onClose: () => void;
  onUploadSuccess: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ user, projects, onClose, onUploadSuccess, addToast }) => {
    const [file, setFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState<string>(projects[0]?.id.toString() || '');
    const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.PLANS);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !projectId || !category) {
            addToast("Please select a file, project, and category.", "error");
            return;
        }

        setIsUploading(true);
        try {
            await api.uploadDocument(file, parseInt(projectId), category, user.id);
            addToast(`"${file.name}" is being uploaded.`, 'success');
            onUploadSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to start upload.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <Card>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Upload Document</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                            <div 
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-gray-300'}`}
                            >
                                <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <p className="mt-2 text-sm text-slate-600">
                                        <span className="font-semibold text-sky-600">Click to upload</span> or drag and drop
                                    </p>
                                    {file ? (
                                        <p className="mt-2 text-xs text-slate-500">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">PDF, PNG, JPG, DOCX up to 10MB</p>
                                    )}
                                </label>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="project-select" className="block text-sm font-medium text-gray-700">Project</label>
                            <select id="project-select" value={projectId} onChange={e => setProjectId(e.target.value)} className="mt-1 w-full p-2 border rounded-md bg-white">
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category-select" value={category} onChange={e => setCategory(e.target.value as DocumentCategory)} className="mt-1 w-full p-2 border rounded-md bg-white">
                                {Object.values(DocumentCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={isUploading} disabled={!file || !projectId}>Upload</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};


// --- DocumentIcon Sub-Component ---
const DocumentIcon: React.FC<{ category: DocumentCategory }> = ({ category }) => {
    const icons = {
        [DocumentCategory.PLANS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l6 3m-6-3v10" /></svg>,
        [DocumentCategory.PERMITS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        [DocumentCategory.INVOICES]: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        [DocumentCategory.REPORTS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        [DocumentCategory.PHOTOS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    };
    return icons[category] || icons[DocumentCategory.REPORTS];
};


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
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    const canUpload = hasPermission(user, Permission.UPLOAD_DOCUMENTS);
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const fetchData = useCallback(async () => {
        if(documents.length === 0) setLoading(true);

        try {
            if (!user.companyId) return;
            const userProjects = hasPermission(user, Permission.VIEW_ALL_PROJECTS)
                ? await api.getProjectsByCompany(user.companyId)
                : await api.getProjectsByUser(user.id);
            setProjects(userProjects);

            if (userProjects.length > 0) {
                const docs = await api.getDocumentsByProjectIds(userProjects.map((p: any) => p.id));
                setDocuments(docs.sort((a: any,b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
            }
        } catch (error) {
            addToast("Failed to load documents.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast, documents.length]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesProject = projectFilter === 'all' || doc.projectId.toString() === projectFilter;
            const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
            return matchesProject && matchesCategory && matchesStatus;
        });
    }, [documents, projectFilter, categoryFilter, statusFilter]);

    if (loading && documents.length === 0) return <Card><p>Loading documents...</p></Card>;

    return (
        <div className="space-y-6">
            {isUploadModalOpen && (
                <UploadDocumentModal 
                    user={user}
                    projects={projects}
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadSuccess={fetchData}
                    addToast={addToast}
                />
            )}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Documents</h2>
                {canUpload && <Button onClick={() => setIsUploadModalOpen(true)} disabled={!isOnline}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Upload Document
                </Button>}
            </div>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                     <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                        <option value="all">All Categories</option>
                        {Object.values(DocumentCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                     <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                        <option value="all">All Statuses</option>
                        {Object.values(DocumentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDocuments.map(doc => (
                        <Card key={doc.id} className="p-4 flex flex-col justify-between animate-card-enter">
                           <div>
                                <div className="flex items-start gap-4 mb-3">
                                    <DocumentIcon category={doc.category} />
                                    <div className="flex-grow overflow-hidden">
                                        <h3 className="font-semibold truncate text-slate-800" title={doc.name}>{doc.name}</h3>
                                        <p className="text-xs text-slate-500">{projectMap.get(doc.projectId) || 'Unknown Project'}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                           </div>
                           <div className="mt-4 pt-3 border-t flex justify-between items-center">
                               <DocumentStatusBadge status={doc.status} />
                               <Button size="sm" variant="ghost" onClick={() => window.open(doc.url, '_blank')}>View</Button>
                           </div>
                        </Card>
                    ))}
                 </div>
                 {filteredDocuments.length === 0 && !loading && (
                    <div className="text-center py-16 text-slate-500">
                        <h3 className="text-xl font-semibold">No Documents Found</h3>
                        <p>No documents match your current filters. Try uploading one!</p>
                    </div>
                 )}
            </Card>
        </div>
    );
};