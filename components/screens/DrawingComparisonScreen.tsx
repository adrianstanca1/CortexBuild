import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drawing } from '../../types';
import { ChevronLeftIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '../Icons';

declare const pdfjsLib: any;

interface DrawingComparisonScreenProps {
    goBack: () => void;
    drawingA: Drawing;
    drawingB: Drawing;
}

const DrawingComparisonScreen: React.FC<DrawingComparisonScreenProps> = ({ goBack, drawingA, drawingB }) => {
    const canvasA = useRef<HTMLCanvasElement>(null);
    const canvasB = useRef<HTMLCanvasElement>(null);
    const containerA = useRef<HTMLDivElement>(null);
    const containerB = useRef<HTMLDivElement>(null);

    const [pdfDocA, setPdfDocA] = useState<any>(null);
    const [pdfDocB, setPdfDocB] = useState<any>(null);
    const [pageNum, setPageNum] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [zoom, setZoom] = useState(1.0);
    const [isOverlay, setIsOverlay] = useState(false);

    useEffect(() => {
        if (typeof pdfjsLib !== 'undefined') {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.107/pdf.worker.min.js`;
        }
    }, []);

    useEffect(() => {
        const loadPdfs = async () => {
            if (typeof pdfjsLib === 'undefined') return;
            const taskA = pdfjsLib.getDocument(drawingA.url);
            const taskB = pdfjsLib.getDocument(drawingB.url);
            const [docA, docB] = await Promise.all([taskA.promise, taskB.promise]);
            setPdfDocA(docA);
            setPdfDocB(docB);
            setTotalPages(Math.max(docA.numPages, docB.numPages));
        };
        loadPdfs();
    }, [drawingA, drawingB]);

    const renderPage = useCallback(async (num: number, targetZoom: number) => {
        const render = async (doc: any, canvasRef: React.RefObject<HTMLCanvasElement>) => {
            if (!doc) return;
            const pageNumToRender = Math.min(num, doc.numPages);
            const page = await doc.getPage(pageNumToRender);
            const viewport = page.getViewport({ scale: targetZoom });
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const renderContext = {
                    canvasContext: canvas.getContext('2d')!,
                    viewport: viewport
                };
                await page.render(renderContext).promise;
            }
        };
        await Promise.all([
            render(pdfDocA, canvasA),
            render(pdfDocB, canvasB),
        ]);
    }, [pdfDocA, pdfDocB]);

    useEffect(() => {
        if (pdfDocA && pdfDocB) {
            renderPage(pageNum, zoom);
        }
    }, [pageNum, zoom, pdfDocA, pdfDocB, renderPage]);

    useEffect(() => {
        const syncScroll = (sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => (e: Event) => {
            const source = sourceRef.current;
            const target = targetRef.current;
            if (source && target) {
                target.scrollTop = source.scrollTop;
                target.scrollLeft = source.scrollLeft;
            }
        };

        const elA = containerA.current;
        const elB = containerB.current;
        
        const scrollListenerA = syncScroll(containerA, containerB);
        const scrollListenerB = syncScroll(containerB, containerA);

        elA?.addEventListener('scroll', scrollListenerA);
        elB?.addEventListener('scroll', scrollListenerB);
        return () => {
            elA?.removeEventListener('scroll', scrollListenerA);
            elB?.removeEventListener('scroll', scrollListenerB);
        };
    }, []);


    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-200">
            <header className="bg-white p-2 flex justify-between items-center z-10 border-b shadow-sm flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-2 p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="w-6 h-6 text-gray-600" /></button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Compare Drawings</h1>
                        <p className="text-xs text-gray-500">{drawingA.drawingNumber} - {drawingA.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.2))} className="p-2 rounded-full hover:bg-gray-100"><MagnifyingGlassMinusIcon className="w-5 h-5"/></button>
                        <span className="text-sm font-semibold w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="p-2 rounded-full hover:bg-gray-100"><MagnifyingGlassPlusIcon className="w-5 h-5"/></button>
                    </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">Prev</button>
                        <span className="text-sm">Page {pageNum} / {totalPages}</span>
                        <button onClick={() => setPageNum(p => Math.min(totalPages, p + 1))} disabled={pageNum >= totalPages} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                     <div className="flex items-center">
                        <label htmlFor="overlay-toggle" className="mr-2 text-sm font-medium text-gray-700">Overlay</label>
                        <input type="checkbox" id="overlay-toggle" checked={isOverlay} onChange={() => setIsOverlay(!isOverlay)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-row overflow-hidden">
                {isOverlay ? (
                    <div className="relative w-full h-full">
                        <div ref={containerA} className="absolute inset-0 overflow-auto">
                            <canvas ref={canvasA}></canvas>
                        </div>
                        <div ref={containerB} className="absolute inset-0 overflow-auto opacity-50">
                            <canvas ref={canvasB} style={{ filter: 'hue-rotate(180deg) saturate(2)' }}></canvas>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-1/2 border-r-2 border-gray-300 flex flex-col">
                            <div className="p-2 bg-gray-100 text-center font-bold">Revision {drawingA.revision} <span className="font-normal text-gray-600">({drawingA.date})</span></div>
                            <div ref={containerA} className="flex-grow overflow-auto p-4"><canvas ref={canvasA}></canvas></div>
                        </div>
                        <div className="w-1/2 flex flex-col">
                            <div className="p-2 bg-gray-100 text-center font-bold">Revision {drawingB.revision} <span className="font-normal text-gray-600">({drawingB.date})</span></div>
                            <div ref={containerB} className="flex-grow overflow-auto p-4"><canvas ref={canvasB}></canvas></div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default DrawingComparisonScreen;