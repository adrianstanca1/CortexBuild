


import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Added .ts extension to import
import { Project } from '../../types';
// Fix: Added .tsx extension to import
import {
    ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
    MapPinIcon, LineIcon, RectangleIcon, CursorArrowRaysIcon, TrashIcon
} from '../Icons';

declare const pdfjsLib: any;

interface PlansViewerScreenProps {
    project: Project;
    goBack: () => void;
    url?: string;
    title?: string;
}

type Tool = 'select' | 'pin' | 'line' | 'rectangle';
interface Point { x: number; y: number; }
interface Pin { id: string; x: number; y: number; page: number; color: string; note?: string; }
interface Markup { id: string; type: 'line' | 'rectangle'; start: Point; end: Point; page: number; color: string; }

const MARKUP_LINE_WIDTH = 3;
const PIN_RADIUS = 8;
const HANDLE_SIZE = 8;
const SELECTION_COLOR = '#3b82f6'; // blue-500
const DEFAULT_MARKUP_COLOR = '#ef4444'; // red-500

const PlansViewerScreen: React.FC<PlansViewerScreenProps> = ({ project, goBack, url, title }) => {
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const markupCanvasRef = useRef<HTMLCanvasElement>(null);
    const noteInputRef = useRef<HTMLTextAreaElement>(null);

    const [pdfDoc, setPdfDoc] = useState<any>(null);
    const [pageNum, setPageNum] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoom] = useState(1.5);
    
    const [pins, setPins] = useState<Pin[]>([]);
    const [markups, setMarkups] = useState<Markup[]>([]);
    
    const [activeTool, setActiveTool] = useState<Tool>('select');
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);

    const [selectedMarkup, setSelectedMarkup] = useState<Pin | Markup | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Point | null>(null);
    const [resizeHandle, setResizeHandle] = useState<'start' | 'end' | null>(null);

    const [editingNoteForPin, setEditingNoteForPin] = useState<Pin | null>(null);
    const [noteText, setNoteText] = useState('');

    const [currentColor, setCurrentColor] = useState(DEFAULT_MARKUP_COLOR);

    const availableColors = [
        { hex: DEFAULT_MARKUP_COLOR, name: 'Red' },
        { hex: '#3b82f6', name: 'Blue' },
        { hex: '#22c55e', name: 'Green' },
        { hex: '#eab308', name: 'Yellow' }
    ];


    useEffect(() => {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.107/pdf.worker.min.js`;
        }
    }, []);

    const getStorageKey = useCallback(() => `markups_${project.id}_${url}`, [project.id, url]);

    useEffect(() => {
        if (!url || typeof pdfjsLib === 'undefined') return;

        setPdfDoc(null);
        setPageNum(1);
        setTotalPages(0);
        setSelectedMarkup(null);

        const storageKey = getStorageKey();
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const { pins: savedPins = [], markups: savedMarkups = [] } = JSON.parse(savedData);
                setPins(savedPins.map((p: any) => ({ ...p, id: p.id || `pin-${Math.random()}`, color: p.color || DEFAULT_MARKUP_COLOR })));
                setMarkups(savedMarkups.map((m: any) => ({ ...m, id: m.id || `markup-${Math.random()}`, color: m.color || DEFAULT_MARKUP_COLOR })));
            } else {
                setPins([]);
                setMarkups([]);
            }
        } catch (e) {
            console.error("Failed to load markups", e);
            setPins([]);
            setMarkups([]);
        }

        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then((pdf: any) => {
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
        }).catch(console.error);

    }, [url, project.id, getStorageKey]);

    useEffect(() => {
        if (!url || !pdfDoc) return;
        const storageKey = getStorageKey();
        try {
            const dataToSave = JSON.stringify({ pins, markups });
            localStorage.setItem(storageKey, dataToSave);
        } catch (e) {
            console.error("Failed to save markups", e);
        }
    }, [pins, markups, pdfDoc, getStorageKey]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedMarkup) {
                if ('x' in selectedMarkup) { // It's a Pin
                    setPins(prev => prev.filter(p => p.id !== selectedMarkup.id));
                } else { // It's a Markup
                    setMarkups(prev => prev.filter(m => m.id !== selectedMarkup.id));
                }
                setSelectedMarkup(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMarkup]);

    const drawPin = (ctx: CanvasRenderingContext2D, pin: Pin) => {
        ctx.fillStyle = pin.color;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, PIN_RADIUS, 0, 2 * Math.PI);
        ctx.fill();
        // Draw a small dot if there is a note
        if (pin.note) {
            ctx.fillStyle = '#3b82f6'; // blue
            ctx.beginPath();
            ctx.arc(pin.x, pin.y - PIN_RADIUS - 3, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
    
    const drawSelectionHandles = (ctx: CanvasRenderingContext2D, markup: Markup | Pin) => {
        ctx.fillStyle = SELECTION_COLOR;
        ctx.strokeStyle = SELECTION_COLOR;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);

        if ('x' in markup) { // Pin
            ctx.beginPath();
            ctx.arc(markup.x, markup.y, PIN_RADIUS + 4, 0, 2 * Math.PI);
            ctx.stroke();
        } else { // Line or Rectangle
            const minX = Math.min(markup.start.x, markup.end.x);
            const minY = Math.min(markup.start.y, markup.end.y);
            const maxX = Math.max(markup.start.x, markup.end.x);
            const maxY = Math.max(markup.start.y, markup.end.y);
            ctx.strokeRect(minX - 5, minY - 5, (maxX - minX) + 10, (maxY - minY) + 10);
            
            ctx.setLineDash([]);
            ctx.fillRect(markup.start.x - HANDLE_SIZE / 2, markup.start.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
            ctx.fillRect(markup.end.x - HANDLE_SIZE / 2, markup.end.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
        }
        ctx.setLineDash([]);
    };


    const redrawCanvas = useCallback(() => {
        const canvas = markupCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        markups.filter(m => m.page === pageNum).forEach(markup => {
            ctx.strokeStyle = markup.color;
            ctx.lineWidth = MARKUP_LINE_WIDTH;
            if (markup.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(markup.start.x, markup.start.y);
                ctx.lineTo(markup.end.x, markup.end.y);
                ctx.stroke();
            } else if (markup.type === 'rectangle') {
                ctx.strokeRect(markup.start.x, markup.start.y, markup.end.x - markup.start.x, markup.end.y - markup.start.y);
            }
        });

        pins.filter(p => p.page === pageNum).forEach(pin => {
            drawPin(ctx, pin);
        });
        
        if(selectedMarkup && selectedMarkup.page === pageNum) {
            drawSelectionHandles(ctx, selectedMarkup);
        }

    }, [markups, pins, pageNum, selectedMarkup]);

    const renderPage = useCallback(async (num: number) => {
        if (!pdfDoc) return;
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: zoom });
        const pdfCanvas = pdfCanvasRef.current;
        const markupCanvas = markupCanvasRef.current;

        if (pdfCanvas && markupCanvas) {
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;
            markupCanvas.height = viewport.height;
            markupCanvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: pdfCanvas.getContext('2d')!,
                viewport: viewport
            };
            await page.render(renderContext).promise;
            redrawCanvas();
        }
    }, [pdfDoc, zoom, redrawCanvas]);

    useEffect(() => {
        if (pdfDoc) {
            renderPage(pageNum);
        }
    }, [pdfDoc, pageNum, zoom, renderPage]);

    const getCanvasCoords = (e: React.MouseEvent): Point => {
        const canvas = markupCanvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const isNearPoint = (p1: Point, p2: Point, threshold = 10) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) < threshold;
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const coords = getCanvasCoords(e);
    
        if (activeTool === 'select') {
            const clickedPin = pins.find(p => p.page === pageNum && isNearPoint(coords, p, PIN_RADIUS + 5));
            const clickedMarkup = !clickedPin ? [...markups].reverse().find(m => {
                if (m.page !== pageNum) return false;
                const minX = Math.min(m.start.x, m.end.x) - 5;
                const minY = Math.min(m.start.y, m.end.y) - 5;
                const maxX = Math.max(m.start.x, m.end.x) + 5;
                const maxY = Math.max(m.start.y, m.end.y) + 5;
                return coords.x >= minX && coords.x <= maxX && coords.y >= minY && coords.y <= maxY;
            }) : undefined;
    
            const target = clickedPin || clickedMarkup;
    
            if (target) {
                setSelectedMarkup(target);
    
                if (!('x' in target)) { // It's a Markup
                    if (isNearPoint(coords, target.start, HANDLE_SIZE)) {
                        setResizeHandle('start');
                        setIsDrawing(true);
                        setStartPoint(target.end);
                        return;
                    }
                    if (isNearPoint(coords, target.end, HANDLE_SIZE)) {
                        setResizeHandle('end');
                        setIsDrawing(true);
                        setStartPoint(target.start);
                        return;
                    }
                }
                
                setIsDragging(true);
                setDragStart(coords);
    
            } else {
                setSelectedMarkup(null);
            }
    
        } else if (activeTool === 'pin') {
            const newPin: Pin = { id: `pin-${Date.now()}`, ...coords, page: pageNum, color: currentColor };
            setPins(current => [...current, newPin]);
        } else {
            setIsDrawing(true);
            setStartPoint(coords);
        }
    };
    

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing && !isDragging) return;
        const currentCoords = getCanvasCoords(e);
        
        redrawCanvas();
        const canvas = markupCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;
        
        ctx.lineWidth = MARKUP_LINE_WIDTH;

        if (isDrawing && startPoint) { // Drawing new or resizing existing markup
            let strokeColor = currentColor;
            if (resizeHandle && selectedMarkup && !('x' in selectedMarkup)) {
                strokeColor = selectedMarkup.color;
            }
            ctx.strokeStyle = strokeColor;
            
            if (activeTool === 'line' || (resizeHandle && selectedMarkup && !('x' in selectedMarkup) && selectedMarkup.type === 'line')) {
                ctx.beginPath();
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(currentCoords.x, currentCoords.y);
                ctx.stroke();
            } else if (activeTool === 'rectangle' || (resizeHandle && selectedMarkup && !('x' in selectedMarkup) && selectedMarkup.type === 'rectangle')) {
                ctx.strokeRect(startPoint.x, startPoint.y, currentCoords.x - startPoint.x, currentCoords.y - startPoint.y);
            }
        } else if (isDragging && selectedMarkup && dragStart) {
            const dx = currentCoords.x - dragStart.x;
            const dy = currentCoords.y - dragStart.y;
            
            ctx.globalAlpha = 0.5;
            if('x' in selectedMarkup) { // is a pin
                drawPin(ctx, { ...selectedMarkup, x: selectedMarkup.x + dx, y: selectedMarkup.y + dy});
            } else { // is a markup
                 ctx.strokeStyle = selectedMarkup.color;
                if(selectedMarkup.type === 'line') {
                    ctx.beginPath();
                    ctx.moveTo(selectedMarkup.start.x + dx, selectedMarkup.start.y + dy);
                    ctx.lineTo(selectedMarkup.end.x + dx, selectedMarkup.end.y + dy);
                    ctx.stroke();
                } else if(selectedMarkup.type === 'rectangle') {
                    ctx.strokeRect(selectedMarkup.start.x + dx, selectedMarkup.start.y + dy, selectedMarkup.end.x - selectedMarkup.start.x, selectedMarkup.end.y - selectedMarkup.start.y);
                }
            }
            ctx.globalAlpha = 1.0;
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        const endPoint = getCanvasCoords(e);
    
        if (isDrawing) {
            if (resizeHandle && selectedMarkup && startPoint && !('x' in selectedMarkup)) {
                let updatedMarkup: Markup | null = null;
                const newMarkups = markups.map(m => {
                    if (m.id === selectedMarkup.id) {
                        let newStart = resizeHandle === 'start' ? endPoint : startPoint;
                        let newEnd = resizeHandle === 'end' ? endPoint : startPoint;
    
                        if (m.type === 'rectangle') {
                            newStart = { x: Math.min(newStart.x, newEnd.x), y: Math.min(newStart.y, newEnd.y) };
                            newEnd = { x: Math.max(newStart.x, newEnd.x), y: Math.max(newStart.y, newEnd.y) };
                        }
                        updatedMarkup = { ...m, start: newStart, end: newEnd };
                        return updatedMarkup;
                    }
                    return m;
                });
                setMarkups(newMarkups);
                if (updatedMarkup) setSelectedMarkup(updatedMarkup);

            } else if (startPoint && (activeTool === 'line' || activeTool === 'rectangle')) {
                let finalStart = startPoint;
                let finalEnd = endPoint;
                if (activeTool === 'rectangle') {
                    finalStart = { x: Math.min(startPoint.x, endPoint.x), y: Math.min(startPoint.y, endPoint.y) };
                    finalEnd = { x: Math.max(startPoint.x, endPoint.x), y: Math.max(startPoint.y, endPoint.y) };
                }
                const newMarkup: Markup = { id: `markup-${Date.now()}`, type: activeTool, start: finalStart, end: finalEnd, page: pageNum, color: currentColor };
                setMarkups(current => [...current, newMarkup]);
            }
        } else if (isDragging && selectedMarkup && dragStart) {
            const dx = endPoint.x - dragStart.x;
            const dy = endPoint.y - dragStart.y;
    
            if ('x' in selectedMarkup) {
                let updatedPin: Pin | null = null;
                const newPins = pins.map(p => {
                    if (p.id === selectedMarkup.id) {
                        updatedPin = { ...p, x: p.x + dx, y: p.y + dy };
                        return updatedPin;
                    }
                    return p;
                });
                setPins(newPins);
                if (updatedPin) setSelectedMarkup(updatedPin);
            } else {
                let updatedMarkup: Markup | null = null;
                const newMarkups = markups.map(m => {
                    if (m.id === selectedMarkup.id) {
                        updatedMarkup = { ...m, start: {x: m.start.x + dx, y: m.start.y + dy}, end: {x: m.end.x + dx, y: m.end.y + dy} };
                        return updatedMarkup;
                    }
                    return m;
                });
                setMarkups(newMarkups);
                if (updatedMarkup) setSelectedMarkup(updatedMarkup);
            }
        } else if (activeTool === 'select' && dragStart && isNearPoint(dragStart, endPoint, 5)) {
            const clickedPin = pins.find(p => p.page === pageNum && isNearPoint(endPoint, p));
            if (clickedPin && clickedPin.id === selectedMarkup?.id) {
                setEditingNoteForPin(clickedPin);
                setNoteText(clickedPin.note || '');
            }
        }
    
        setIsDrawing(false);
        setStartPoint(null);
        setIsDragging(false);
        setDragStart(null);
        setResizeHandle(null);
    };

    useEffect(() => {
        if(editingNoteForPin && noteInputRef.current) {
            noteInputRef.current.focus();
        }
    }, [editingNoteForPin]);

    const handleSaveNote = () => {
        if (!editingNoteForPin) return;
        setPins(prev => prev.map(p => p.id === editingNoteForPin.id ? {...p, note: noteText} : p));
        setEditingNoteForPin(null);
        setNoteText('');
    };
    
    const onPrevPage = () => { if(pageNum > 1) { setSelectedMarkup(null); setPageNum(p => p - 1); }};
    const onNextPage = () => { if(pageNum < totalPages) { setSelectedMarkup(null); setPageNum(p => p + 1); }};
    const onZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
    const onZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

    const ToolButton: React.FC<{ tool: Tool, label: string, icon: React.FC<any>, tooltip: string }> = ({ tool, label, icon: Icon, tooltip }) => (
        <button
            onClick={() => setActiveTool(tool)}
            title={tooltip}
            aria-label={tooltip}
            className={`p-2 rounded-lg flex flex-col items-center text-xs w-16 transition-colors ${activeTool === tool ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
        >
            <Icon className="w-5 h-5 mb-1" />
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-800 text-white rounded-lg overflow-hidden select-none">
            <header className="bg-slate-900/80 p-4 flex justify-between items-center z-20 border-b border-slate-700">
                <button onClick={goBack} className="p-2 rounded-full hover:bg-slate-700"><ChevronLeftIcon className="w-6 h-6" /></button>
                <div className="text-center">
                    <h1 className="text-xl font-bold truncate">{title || 'Plan'}</h1>
                    <p className="text-sm text-slate-400">{project.name}</p>
                </div>
                <div className="w-10">
                     {selectedMarkup && activeTool === 'select' && (
                        <button onClick={() => {
                            if ('x' in selectedMarkup) { // It's a Pin
                                setPins(prev => prev.filter(p => p.id !== selectedMarkup.id));
                            } else { // It's a Markup
                                setMarkups(prev => prev.filter(m => m.id !== selectedMarkup.id));
                            }
                            setSelectedMarkup(null);
                        }} className="p-2 rounded-full bg-red-500/50 hover:bg-red-500" title="Delete Selected Markup (Del/Backspace)">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>

            <div className="bg-slate-900/80 p-2 flex justify-center items-center z-20 border-b border-slate-700 gap-4">
                {/* Tools Group */}
                <div className="flex items-center gap-1 p-2 rounded-lg bg-slate-800/50">
                    <ToolButton tool="select" label="Select" icon={CursorArrowRaysIcon} tooltip="Select, move, and edit markups" />
                    <div className="w-px h-10 bg-slate-700 mx-1"></div>
                    <ToolButton tool="pin" label="Pin" icon={MapPinIcon} tooltip="Add a pin markup" />
                    <ToolButton tool="line" label="Line" icon={LineIcon} tooltip="Draw a line markup" />
                    <ToolButton tool="rectangle" label="Rect" icon={RectangleIcon} tooltip="Draw a rectangle markup" />
                </div>

                {/* Color Picker Group */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                    <span className="text-sm font-medium text-slate-400 select-none">Color:</span>
                    <div className="flex items-center gap-2">
                        {availableColors.map(color => (
                            <button 
                                key={color.hex} 
                                onClick={() => setCurrentColor(color.hex)} 
                                className={`w-7 h-7 rounded-full transition-all ${currentColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : 'hover:opacity-80'}`} 
                                style={{backgroundColor: color.hex}} 
                                title={`Set color to ${color.name}`}
                                aria-label={`Select color ${color.name}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="flex-grow overflow-auto flex items-start justify-center p-4 relative">
                <div className="relative">
                    <canvas ref={pdfCanvasRef}></canvas>
                    <canvas
                        ref={markupCanvasRef}
                        className="absolute top-0 left-0"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
                    />
                </div>
                {editingNoteForPin && (
                    <div className="absolute top-4 right-4 bg-slate-700 rounded-lg shadow-2xl p-4 w-64 z-30" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-2">Note for Pin</h3>
                        <textarea ref={noteInputRef} value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} className="w-full p-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-blue-500 focus:border-blue-500"></textarea>
                        <div className="mt-2 flex justify-end gap-2">
                            <button onClick={() => setEditingNoteForPin(null)} className="px-3 py-1 rounded bg-slate-600 hover:bg-slate-500 text-sm">Cancel</button>
                            <button onClick={handleSaveNote} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-sm font-bold">Save</button>
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="bg-slate-900/80 p-2 flex justify-center items-center z-20 border-t border-slate-700 space-x-4">
                <button onClick={onZoomOut} className="p-2 rounded-full hover:bg-slate-700"><MagnifyingGlassMinusIcon className="w-6 h-6" /></button>
                <div className="flex items-center space-x-2">
                    <button onClick={onPrevPage} disabled={pageNum <= 1} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <span className="w-20 text-center">Page {pageNum} / {totalPages}</span>
                    <button onClick={onNextPage} disabled={pageNum >= totalPages} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
                <button onClick={onZoomIn} className="p-2 rounded-full hover:bg-slate-700"><MagnifyingGlassPlusIcon className="w-6 h-6" /></button>
            </footer>
        </div>
    );
};

export default PlansViewerScreen;