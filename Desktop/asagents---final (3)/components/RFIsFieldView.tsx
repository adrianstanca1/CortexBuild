import React, { useState } from 'react';
import {
  MessageSquare, Plus, Search, Filter, Clock, CheckCircle,
  AlertCircle, XCircle, Camera, Mic, Paperclip, Send, X,
  ChevronRight, User, Calendar, MapPin, FileText, Image,
  Edit3, Trash2, MoreVertical, Download, Share2, Tag
} from 'lucide-react';

interface RFI {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'answered' | 'closed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  submittedBy: string;
  assignedTo: string;
  dueDate: string;
  submittedDate: string;
  answeredDate?: string;
  closedDate?: string;
  location?: string;
  drawing?: string;
  project: string;
  attachments: Attachment[];
  responses: Response[];
  tags?: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'drawing';
  url: string;
  size: string;
  uploadedAt: string;
}

interface Response {
  id: string;
  message: string;
  author: string;
  createdAt: string;
  attachments?: Attachment[];
}

export default function RFIsFieldView() {
  const [rfis, setRfis] = useState<RFI[]>([
    {
      id: '1',
      number: 'RFI-014',
      title: 'Beam size clarification at Grid C5',
      description: 'Drawing A-102 shows W12x26 beam but structural notes reference W14x30. Please clarify correct beam size for installation.',
      status: 'open',
      priority: 'high',
      category: 'Structural',
      submittedBy: 'John Smith',
      assignedTo: 'Architect',
      dueDate: '2025-01-18',
      submittedDate: '2025-01-15T08:30:00Z',
      location: 'Grid C5, Level 2',
      drawing: 'A-102 Rev 5',
      project: 'North Tower',
      attachments: [
        {
          id: 'a1',
          name: 'beam-detail.jpg',
          type: 'image',
          url: '/attachments/beam.jpg',
          size: '2.3 MB',
          uploadedAt: '2025-01-15T08:30:00Z'
        }
      ],
      responses: [],
      tags: ['Structural', 'Beam', 'Level 2']
    }
  ]);

  const [selectedRFI, setSelectedRFI] = useState<RFI | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (selectedRFI) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <button onClick={() => setSelectedRFI(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold">{selectedRFI.number}</h2>
          <p>{selectedRFI.title}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p>{selectedRFI.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">RFIs</h1>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search RFIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {rfis.map(rfi => (
          <div
            key={rfi.id}
            onClick={() => setSelectedRFI(rfi)}
            className="bg-white border border-gray-200 rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{rfi.number}</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{rfi.status}</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{rfi.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{rfi.description}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="text-sm text-gray-600">{rfi.assignedTo}</span>
              <span className="text-sm text-gray-600">{formatDate(rfi.dueDate)}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
