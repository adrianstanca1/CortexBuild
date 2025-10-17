/**
 * Notes App - Simple note-taking application
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

interface NotesAppProps {
    isDarkMode?: boolean;
}

const NotesApp: React.FC<NotesAppProps> = ({ isDarkMode = true }) => {
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            title: 'Welcome to Notes',
            content: 'This is your first note. Click to edit or create a new one!',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');

    const createNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'New Note',
            content: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsEditing(true);
        setEditTitle(newNote.title);
        setEditContent(newNote.content);
        toast.success('New note created!');
    };

    const deleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
        if (selectedNote?.id === id) {
            setSelectedNote(notes[0] || null);
        }
        toast.success('Note deleted!');
    };

    const startEdit = (note: Note) => {
        setSelectedNote(note);
        setIsEditing(true);
        setEditTitle(note.title);
        setEditContent(note.content);
    };

    const saveEdit = () => {
        if (!selectedNote) return;

        setNotes(notes.map(n =>
            n.id === selectedNote.id
                ? { ...n, title: editTitle, content: editContent, updatedAt: new Date() }
                : n
        ));
        setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: new Date() });
        setIsEditing(false);
        toast.success('Note saved!');
    };

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex`}>
            {/* Sidebar */}
            <div className={`w-80 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
                <div className="p-4 border-b border-gray-700">
                    <button
                        type="button"
                        onClick={createNote}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        New Note
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => {
                                setSelectedNote(note);
                                setIsEditing(false);
                            }}
                            className={`p-4 rounded-xl cursor-pointer transition-all ${
                                selectedNote?.id === note.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                    : isDarkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                        >
                            <div className="font-semibold mb-1 truncate">{note.title}</div>
                            <div className={`text-sm truncate ${
                                selectedNote?.id === note.id ? 'text-white/70' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                {note.content || 'Empty note'}
                            </div>
                            <div className={`text-xs mt-2 ${
                                selectedNote?.id === note.id ? 'text-white/50' : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                {note.updatedAt.toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col">
                {selectedNote ? (
                    <>
                        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {isEditing ? 'Editing Note' : selectedNote.title}
                            </h2>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <button
                                        type="button"
                                        onClick={saveEdit}
                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-all"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => startEdit(selectedNote)}
                                        className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                                            isDarkMode
                                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                        }`}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => deleteNote(selectedNote.id)}
                                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                                        isDarkMode
                                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                            : 'bg-red-50 hover:bg-red-100 text-red-600'
                                    }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        placeholder="Note title..."
                                        className={`w-full px-4 py-3 rounded-xl border text-2xl font-bold ${
                                            isDarkMode
                                                ? 'bg-gray-800 text-white border-gray-700'
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="Start writing..."
                                        className={`w-full h-96 px-4 py-3 rounded-xl border resize-none ${
                                            isDarkMode
                                                ? 'bg-gray-800 text-white border-gray-700'
                                                : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                    />
                                </div>
                            ) : (
                                <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                                    <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {selectedNote.content || 'Empty note. Click Edit to add content.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-6xl mb-4`}>📝</div>
                            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Select a note or create a new one
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesApp;

