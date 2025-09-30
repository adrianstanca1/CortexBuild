import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import uploadService, { UploadedFile } from '../../services/uploadService';

interface DocumentViewerProps {
    file: UploadedFile;
    isOpen: boolean;
    onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    file,
    isOpen,
    onClose
}) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!isOpen) return null;

    const handleDownload = () => {
        const url = uploadService.getFileUrl(file.id);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName || file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(200, prev + 25));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(25, prev - 25));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';
    const isText = file.mimetype.startsWith('text/');

    const renderContent = () => {
        const fileUrl = uploadService.getFileUrl(file.id);

        if (isImage) {
            return (
                <div className="flex items-center justify-center h-full">
                    <img
                        src={fileUrl}
                        alt={file.originalName || file.filename}
                        className="max-w-full max-h-full object-contain transition-transform"
                        style={{
                            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                        }}
                    />
                </div>
            );
        }

        if (isPDF) {
            return (
                <div className="w-full h-full">
                    <iframe
                        src={`${fileUrl}#zoom=${zoom}`}
                        title={file.originalName || file.filename}
                        className="w-full h-full border-0"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                        }}
                    />
                </div>
            );
        }

        if (isText) {
            return (
                <div className="p-6 h-full overflow-auto">
                    <iframe
                        src={fileUrl}
                        title={file.originalName || file.filename}
                        className="w-full h-full border-0 bg-white"
                        style={{
                            fontSize: `${zoom}%`,
                            transform: `rotate(${rotation}deg)`,
                        }}
                    />
                </div>
            );
        }

        // For other file types, show download option
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl text-gray-400 mb-4">📄</div>
                <div className="text-xl font-medium text-gray-700 mb-2">
                    {file.originalName || file.filename}
                </div>
                <div className="text-gray-500 mb-6">
                    This file type cannot be previewed
                </div>
                <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download File
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div
                className={`bg-white rounded-lg shadow-2xl overflow-hidden ${isFullscreen ? 'w-full h-full' : 'max-w-6xl max-h-[90vh] w-full mx-4'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                            {file.originalName || file.filename}
                        </h2>
                        <div className="text-sm text-gray-500">
                            {file.mimetype} • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {(isImage || isPDF) && (
                            <>
                                <button
                                    onClick={handleZoomOut}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Zoom out"
                                    disabled={zoom <= 25}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>

                                <span className="text-sm text-gray-600 min-w-12 text-center">
                                    {zoom}%
                                </span>

                                <button
                                    onClick={handleZoomIn}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Zoom in"
                                    disabled={zoom >= 200}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={handleRotate}
                                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Rotate"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>
                            </>
                        )}

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className={`bg-gray-100 ${isFullscreen ? 'h-full' : 'h-96'} overflow-hidden`}>
                    {renderContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Uploaded: {new Date(file.url).toLocaleString()}
                        </div>
                        <div className="flex gap-4">
                            <span>Category: {file.category}</span>
                            <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewer;