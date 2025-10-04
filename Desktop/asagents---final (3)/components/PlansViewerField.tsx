import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, ZoomIn, ZoomOut, Maximize2, Grid3x3, MapPin, 
  MessageSquare, CheckSquare, Layers, Download, Share2,
  ChevronLeft, ChevronRight, Search, Filter, RotateCw,
  AlertCircle, Eye, Upload, Settings, Info
} from 'lucide-react';

interface Drawing {
  id: string;
  number: string;
  title: string;
  revision: string;
  date: string;
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  size: string;
  pages?: number;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  type: 'task' | 'rfi' | 'note' | 'issue';
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  createdBy: string;
  createdAt: string;
}

interface Markup {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'line' | 'text' | 'cloud';
  color: string;
  coordinates: number[];
  text?: string;
  createdBy: string;
  createdAt: string;
}

export default function PlansViewerField() {
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [pins, setPins] = useState<Pin[]>([]);
  const [markups, setMarkups] = useState<Markup[]>([]);
  const [showPins, setShowPins] = useState(true);
  const [showMarkups, setShowMarkups] = useState(true);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pinType, setPinType] = useState<'task' | 'rfi' | 'note' | 'issue'>('task');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [compareDrawing, setCompareDrawing] = useState<Drawing | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showSheetIndex, setShowSheetIndex] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Mock drawings data
  const drawings: Drawing[] = [
    {
      id: '1',
      number: 'A-101',
      title: 'Ground Floor Plan',
      revision: 'Rev 5',
      date: '2025-01-15',
      category: 'Architectural',
      fileUrl: '/plans/a101.pdf',
      thumbnailUrl: '/thumbs/a101.jpg',
      size: '15.2 MB',
      pages: 1
    },
    {
      id: '2',
      number: 'A-102',
      title: 'Second Floor Plan',
      revision: 'Rev 4',
      date: '2025-01-10',
      category: 'Architectural',
      fileUrl: '/plans/a102.pdf',
      thumbnailUrl: '/thumbs/a102.jpg',
      size: '14.8 MB',
      pages: 1
    },
    {
      id: '3',
      number: 'S-201',
      title: 'Foundation Plan',
      revision: 'Rev 3',
      date: '2025-01-08',
      category: 'Structural',
      fileUrl: '/plans/s201.pdf',
      thumbnailUrl: '/thumbs/s201.jpg',
      size: '18.5 MB',
      pages: 2
    },
    {
      id: '4',
      number: 'M-301',
      title: 'HVAC Layout',
      revision: 'Rev 2',
      date: '2025-01-05',
      category: 'Mechanical',
      fileUrl: '/plans/m301.pdf',
      thumbnailUrl: '/thumbs/m301.jpg',
      size: '12.3 MB',
      pages: 1
    },
    {
      id: '5',
      number: 'E-401',
      title: 'Power Distribution',
      revision: 'Rev 4',
      date: '2025-01-12',
      category: 'Electrical',
      fileUrl: '/plans/e401.pdf',
      thumbnailUrl: '/thumbs/e401.jpg',
      size: '10.7 MB',
      pages: 1
    }
  ];

  // Mock pins data
  const mockPins: Pin[] = [
    {
      id: 'p1',
      x: 45,
      y: 30,
      type: 'rfi',
      title: 'Beam size clarification',
      description: 'Verify beam size at grid C5',
      status: 'Open',
      priority: 'High',
      assignee: 'Architect',
      createdBy: 'John Smith',
      createdAt: '2025-01-15T08:30:00Z'
    },
    {
      id: 'p2',
      x: 65,
      y: 55,
      type: 'task',
      title: 'Install wall framing',
      description: 'Complete framing by EOD',
      status: 'In Progress',
      priority: 'Medium',
      assignee: 'Crew A',
      createdBy: 'Mike Johnson',
      createdAt: '2025-01-15T09:15:00Z'
    },
    {
      id: 'p3',
      x: 30,
      y: 70,
      type: 'issue',
      title: 'Concrete crack detected',
      description: 'Hairline crack in slab',
      status: 'Open',
      priority: 'High',
      assignee: 'Engineer',
      createdBy: 'Sarah Davis',
      createdAt: '2025-01-15T10:45:00Z'
    }
  ];

  useEffect(() => {
    if (selectedDrawing) {
      // Load pins for the selected drawing
      setPins(mockPins);
      
      // Simulate offline detection
      const checkOnline = () => setIsOffline(!navigator.onLine);
      window.addEventListener('online', checkOnline);
      window.addEventListener('offline', checkOnline);
      return () => {
        window.removeEventListener('online', checkOnline);
        window.removeEventListener('offline', checkOnline);
      };
    }
  }, [selectedDrawing]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    panStartRef.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handlePanMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - panStartRef.current.x,
      y: clientY - panStartRef.current.y
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!isAddingPin || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: Pin = {
      id: `p${Date.now()}`,
      x,
      y,
      type: pinType,
      title: 'New ' + pinType,
      status: 'Open',
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setPins([...pins, newPin]);
    setIsAddingPin(false);
    setSelectedPin(newPin);
  };

  const handleCreateRFI = (pin: Pin) => {
    // Navigate to RFI creation with pin context
    console.log('Creating RFI from pin:', pin);
  };

  const handleCreateTask = (pin: Pin) => {
    // Navigate to task creation with pin context
    console.log('Creating task from pin:', pin);
  };

  const filteredDrawings = drawings.filter(drawing => {
    const matchesSearch = drawing.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drawing.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || drawing.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(drawings.map(d => d.category)))];

  const getPinColor = (type: string) => {
    switch (type) {
      case 'rfi': return 'bg-blue-500';
      case 'task': return 'bg-green-500';
      case 'issue': return 'bg-red-500';
      case 'note': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPinIcon = (type: string) => {
    switch (type) {
      case 'rfi': return MessageSquare;
      case 'task': return CheckSquare;
      case 'issue': return AlertCircle;
      case 'note': return Info;
      default: return MapPin;
    }
  };

  if (!selectedDrawing) {
    // Drawing list view
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900">Plans</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drawings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    filterCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-900">Offline - Viewing cached plans</span>
          </div>
        )}

        {/* Drawings Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDrawings.map(drawing => (
              <div
                key={drawing.id}
                onClick={() => setSelectedDrawing(drawing)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </div>
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {drawing.revision}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{drawing.number}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{drawing.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">{drawing.category}</span>
                    <span>{drawing.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{drawing.date}</span>
                    {drawing.pages && <span>{drawing.pages} page{drawing.pages > 1 ? 's' : ''}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDrawings.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No drawings found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Drawing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Plan viewer
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDrawing(null)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-white font-semibold">{selectedDrawing.number}</h2>
              <p className="text-xs text-gray-400">{selectedDrawing.title} • {selectedDrawing.revision}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSheetIndex(!showSheetIndex)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Grid3x3 className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg">
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="px-3 py-1 bg-gray-700 text-white text-sm rounded min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPins(!showPins)}
              className={`p-2 rounded-lg ${showPins ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <MapPin className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowMarkups(!showMarkups)}
              className={`p-2 rounded-lg ${showMarkups ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Layers className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`p-2 rounded-lg ${compareMode ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Eye className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden cursor-move"
        onMouseDown={handlePanStart}
        onMouseMove={handlePanMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handlePanStart}
        onTouchMove={handlePanMove}
        onTouchEnd={handlePanEnd}
        onClick={isAddingPin ? handleCanvasClick : undefined}
      >
        {/* Drawing */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isPanning ? 'none' : 'transform 0.2s'
          }}
        >
          <div className="bg-white shadow-2xl" style={{ width: '800px', height: '600px' }}>
            {/* Placeholder for actual PDF/drawing */}
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Drawing: {selectedDrawing.number}</p>
              </div>
            </div>

            {/* Pins */}
            {showPins && pins.map(pin => {
              const Icon = getPinIcon(pin.type);
              return (
                <div
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPin(pin);
                  }}
                  className={`absolute w-10 h-10 ${getPinColor(pin.type)} rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                  style={{
                    left: `${pin.x}%`,
                    top: `${pin.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Adding pin mode indicator */}
        {isAddingPin && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Tap on the drawing to place {pinType}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setIsAddingPin(true);
              setPinType('task');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
          >
            <CheckSquare className="w-5 h-5" />
            + Task
          </button>
          <button
            onClick={() => {
              setIsAddingPin(true);
              setPinType('rfi');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare className="w-5 h-5" />
            + RFI
          </button>
          <button
            onClick={() => {
              setIsAddingPin(true);
              setPinType('issue');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2 whitespace-nowrap"
          >
            <AlertCircle className="w-5 h-5" />
            + Issue
          </button>
          <button
            onClick={() => {
              setIsAddingPin(true);
              setPinType('note');
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 flex items-center gap-2 whitespace-nowrap"
          >
            <Info className="w-5 h-5" />
            + Note
          </button>
        </div>
      </div>

      {/* Pin Detail Modal */}
      {selectedPin && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {React.createElement(getPinIcon(selectedPin.type), {
                    className: `w-5 h-5 ${getPinColor(selectedPin.type).replace('bg-', 'text-')}`
                  })}
                  <h3 className="font-semibold text-gray-900">{selectedPin.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600">{selectedPin.description}</p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedPin.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                  selectedPin.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {selectedPin.status}
                </span>
              </div>

              {selectedPin.priority && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Priority</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedPin.priority === 'High' ? 'bg-red-100 text-red-700' :
                    selectedPin.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedPin.priority}
                  </span>
                </div>
              )}

              {selectedPin.assignee && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned to</span>
                  <span className="text-gray-900">{selectedPin.assignee}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created by</span>
                <span className="text-gray-900">{selectedPin.createdBy}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created</span>
                <span className="text-gray-900">
                  {new Date(selectedPin.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              {selectedPin.type === 'rfi' && (
                <button
                  onClick={() => handleCreateRFI(selectedPin)}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
                >
                  View RFI
                </button>
              )}
              {selectedPin.type === 'task' && (
                <button
                  onClick={() => handleCreateTask(selectedPin)}
                  className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
                >
                  View Task
                </button>
              )}
              <button
                onClick={() => setPins(pins.filter(p => p.id !== selectedPin.id))}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet Index Modal */}
      {showSheetIndex && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-40">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Sheet Index</h3>
              <button
                onClick={() => setShowSheetIndex(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-2">
              {drawings.map(drawing => (
                <div
                  key={drawing.id}
                  onClick={() => {
                    setSelectedDrawing(drawing);
                    setShowSheetIndex(false);
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{drawing.number}</h4>
                      <p className="text-sm text-gray-600">{drawing.title}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {drawing.revision}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
