import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Project, WhiteboardNote } from '../types';
import { api } from '../services/mockApi';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

// Draggable Post-it Component with self-contained drag logic
const DraggablePostIt: React.FC<{
    note: WhiteboardNote;
    onUpdate: (id: number | string, updates: Partial<Omit<WhiteboardNote, 'id'>>) => void;
    onDelete: (id: number | string) => void;
    containerRef: React.RefObject<HTMLDivElement>;
}> = ({ note, onUpdate, onDelete, containerRef }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content);
    const noteRef = useRef<HTMLDivElement>(null);

    const handleDoubleClick = () => !isEditing && setIsEditing(true);

    const handleBlur = () => {
        setIsEditing(false);
        if (content !== note.content) {
            onUpdate(note.id, { content });
        }
    };

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Prevent drag from starting on textareas, buttons, or while editing
        if (isEditing || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') return;
        
        const noteNode = noteRef.current;
        const containerNode = containerRef.current;
        if (!noteNode || !containerNode) return;
        
        // Bring note to front when dragging
        noteNode.style.zIndex = '100';

        const startX = e.pageX - noteNode.offsetLeft;
        const startY = e.pageY - noteNode.offsetTop;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newX = moveEvent.pageX - startX;
            const newY = moveEvent.pageY - startY;

            noteNode.style.left = `${newX}px`;
            noteNode.style.top = `${newY}px`;
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Reset z-index
            noteNode.style.zIndex = '1';
            
            const finalX = upEvent.pageX - startX;
            const finalY = upEvent.pageY - startY;
            
            // Only call update if position actually changed
            if(note.position.x !== finalX || note.position.y !== finalY) {
               onUpdate(note.id, { position: { x: finalX, y: finalY } });
            }
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

    }, [isEditing, note.id, note.position, onUpdate, containerRef]);


    const colorClasses = {
        yellow: 'post-it-yellow dark:post-it-yellow',
        green: 'post-it-green dark:post-it-green',
        blue: 'post-it-blue dark:post-it-blue',
    };

    return (
        <div
            ref={noteRef}
            className={`post-it ${colorClasses[note.color]} absolute cursor-grab group`}
            style={{
                left: note.position.x,
                top: note.position.y,
                width: note.size.width,
                height: note.size.height,
                transform: 'rotate(-1deg)',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            <button
                onClick={() => onDelete(note.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Delete note"
            >
                &times;
            </button>
            {isEditing ? (
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus
                    className="w-full h-full bg-transparent border-0 focus:ring-0 resize-none font-inherit text-inherit p-0"
                />
            ) : (
                <p className="w-full h-full overflow-hidden whitespace-pre-wrap">{note.content}</p>
            )}
        </div>
    );
};


// Main Whiteboard View Component
interface WhiteboardViewProps {
  project: Project;
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const WhiteboardView: React.FC<WhiteboardViewProps> = ({ project, user, addToast }) => {
    const [notes, setNotes] = useState<WhiteboardNote[]>([]);
    const [loading, setLoading] = useState(true);
    const whiteboardRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const notesData = await api.getWhiteboardNotesByProject(project.id, { signal: controller.signal });
            if (controller.signal.aborted) return;
            setNotes(notesData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load whiteboard notes.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [project.id, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    const handleAddNote = async (color: 'yellow' | 'green' | 'blue') => {
        try {
            const newNoteData = {
                projectId: project.id,
                content: 'New note...',
                color,
                position: { x: 20, y: 20 },
                size: { width: 200, height: 200 },
            };
            const newNote = await api.createWhiteboardNote(newNoteData, user.id);
            setNotes(prev => [...prev, newNote]);
            addToast("Note added.", "success");
        } catch (error) {
            addToast("Failed to add note.", "error");
        }
    };
    
    const handleUpdateNote = useCallback(async (id: string, updates: Partial<Omit<WhiteboardNote, 'id'>>) => {
        // Optimistic update
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } as WhiteboardNote : n));
        try {
            await api.updateWhiteboardNote(id, updates, user.id);
        } catch (error) {
            addToast("Failed to save note changes.", "error");
            fetchData(); // Revert on failure
        }
    }, [user.id, addToast, fetchData]);

    const handleDeleteNote = async (id: string) => {
        // Optimistic update
        setNotes(prev => prev.filter(n => n.id !== id));
        try {
            await api.deleteWhiteboardNote(id, user.id);
            addToast("Note deleted.", "success");
        } catch (error) {
            addToast("Failed to delete note.", "error");
            fetchData(); // Revert
        }
    };

    if (loading) return <Card><p>Loading whiteboard...</p></Card>;

    return (
        <div className="space-y-4">
            <Card className="flex items-center gap-4">
                <h3 className="font-semibold">Add a Note:</h3>
                <Button size="sm" className="bg-[#fffb91] hover:bg-[#f9f77e] text-black" onClick={() => handleAddNote('yellow')}>Yellow</Button>
                <Button size="sm" className="bg-[#d3f8e2] hover:bg-[#bbf3cd] text-black" onClick={() => handleAddNote('green')}>Green</Button>
                <Button size="sm" className="bg-[#a6d9f7] hover:bg-[#8ecaf4] text-black" onClick={() => handleAddNote('blue')}>Blue</Button>
            </Card>
            <div
                ref={whiteboardRef}
                className="whiteboard-bg relative w-full h-[65vh] overflow-auto rounded-lg"
            >
                {notes.map(note => (
                    <DraggablePostIt key={note.id} note={note} onUpdate={handleUpdateNote as any} onDelete={handleDeleteNote} containerRef={whiteboardRef} />
                ))}
            </div>
        </div>
    );
};
