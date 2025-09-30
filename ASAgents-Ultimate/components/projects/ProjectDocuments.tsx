import React, { useState } from 'react';
import { Upload, FolderOpen, Eye } from 'lucide-react';
import FileUpload from '../ui/FileUpload';
import FileManager from '../ui/FileManager';
import DocumentViewer from '../ui/DocumentViewer';
import { UploadedFile } from '../../services/uploadService';

interface ProjectDocumentsProps {
  projectId: string;
  canUpload?: boolean;
  canDelete?: boolean;
  className?: string;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({
  projectId,
  canUpload = true,
  canDelete = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('manage');
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log(`Uploaded ${files.length} files successfully`);
    // Refresh the file manager
    setRefreshKey(prev => prev + 1);
    // Switch to manage tab to show uploaded files
    setActiveTab('manage');
  };

  const handleFileView = (file: UploadedFile) => {
    setSelectedFile(file);
  };

  const closeViewer = () => {
    setSelectedFile(null);
  };

  return (
    <div className={`project-documents ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Project Documents
        </h2>
        
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('manage')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition-colors
              ${activeTab === 'manage' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <FolderOpen className="w-4 h-4" />
            Manage Files
          </button>
          
          {canUpload && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                ${activeTab === 'upload' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Upload className="w-4 h-4" />
              Upload Files
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Project Documents
            </h3>
            <p className="text-gray-600">
              Upload contracts, permits, drawings, photos, reports and other project-related documents.
              Drag and drop files or click to select.
            </p>
          </div>
          
          <FileUpload
            projectId={projectId}
            onUploadComplete={handleUploadComplete}
            onUploadStart={() => console.log('Upload started')}
            onUploadError={(error) => console.error('Upload error:', error)}
            className="mb-6"
          />

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Supported File Types</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Documents:</strong> PDF, Word, Excel, PowerPoint, Text files</div>
              <div><strong>Images:</strong> JPEG, PNG, GIF, BMP, TIFF</div>
              <div><strong>Drawings:</strong> DWG, DXF, SVG, CAD files</div>
              <div><strong>Archives:</strong> ZIP, RAR (up to 100MB per file)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FileManager
            key={refreshKey}
            projectId={projectId}
            onFileSelect={handleFileView}
            selectionMode="single"
          />
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedFile && (
        <DocumentViewer
          file={selectedFile}
          isOpen={true}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};

export default ProjectDocuments;