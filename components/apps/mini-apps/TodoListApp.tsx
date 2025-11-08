/**
 * Todo List App - Simple task management with Supabase persistence
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Circle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { todoService } from '../../../lib/services/marketplaceAppsService';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
}

interface TodoListAppProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const TodoListApp: React.FC<TodoListAppProps> = ({ isDarkMode = true, currentUser }) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load todos from Supabase on mount
    useEffect(() => {
        loadTodos();
    }, [currentUser]);

    const loadTodos = async () => {
        if (!currentUser?.id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await todoService.getAll(currentUser.id);
            setTodos(data.map(t => ({
                id: t.id,
                text: t.text,
                completed: t.completed,
                createdAt: new Date(t.created_at)
            })));
        } catch (error) {
            console.error('Failed to load todos:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async () => {
        if (!newTodo.trim()) {
            toast.error('Please enter a task');
            return;
        }

        if (!currentUser?.id) {
            toast.error('Please log in to save tasks');
            return;
        }

        try {
            setSaving(true);
            const created = await todoService.create(currentUser.id, newTodo);
            setTodos([{
                id: created.id,
                text: created.text,
                completed: created.completed,
                createdAt: new Date(created.created_at)
            }, ...todos]);
            setNewTodo('');
            toast.success('Task added!');
        } catch (error) {
            console.error('Failed to add todo:', error);
            toast.error('Failed to add task');
        } finally {
            setSaving(false);
        }
    };

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            await todoService.update(id, { completed: !todo.completed });
            setTodos(todos.map(t =>
                t.id === id ? { ...t, completed: !t.completed } : t
            ));
        } catch (error) {
            console.error('Failed to update todo:', error);
            toast.error('Failed to update task');
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            await todoService.delete(id);
            setTodos(todos.filter(t => t.id !== id));
            toast.success('Task deleted!');
        } catch (error) {
            console.error('Failed to delete todo:', error);
            toast.error('Failed to delete task');
        }
    };

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;

    if (loading) {
        return (
            <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-12 w-12 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading your tasks...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📝 My Tasks
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {completedCount} of {totalCount} tasks completed
                    </p>
                </div>

                {/* Add Todo */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !saving && addTodo()}
                            placeholder="Add a new task..."
                            disabled={saving}
                            className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-800 text-white border-gray-700'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50`}
                        />
                        <button
                            type="button"
                            onClick={addTodo}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Add
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Todo List */}
                <div className="space-y-3">
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${todo.completed
                                ? isDarkMode
                                    ? 'bg-gray-800/50 border-gray-700'
                                    : 'bg-gray-100 border-gray-200'
                                : isDarkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                    : 'bg-white border-gray-200 hover:border-purple-500'
                                }`}
                        >
                            <button
                                type="button"
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed
                                    ? 'bg-purple-600 border-purple-600'
                                    : isDarkMode
                                        ? 'border-gray-600 hover:border-purple-500'
                                        : 'border-gray-300 hover:border-purple-500'
                                    }`}
                            >
                                {todo.completed && <Check className="h-4 w-4 text-white" />}
                            </button>

                            <span className={`flex-1 ${todo.completed
                                ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                {todo.text}
                            </span>

                            <button
                                type="button"
                                onClick={() => deleteTodo(todo.id)}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode
                                    ? 'hover:bg-red-500/20 text-red-400'
                                    : 'hover:bg-red-50 text-red-500'
                                    }`}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {todos.length === 0 && (
                    <div className="text-center py-12">
                        <Circle className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                        <p className={`text-lg ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            No tasks yet. Add one above!
                        </p>
                    </div>
                )}

                {/* Stats */}
                {todos.length > 0 && (
                    <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                        }`}>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    {totalCount}
                                </div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Total
                                </div>
                            </div>
                            <div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                    {completedCount}
                                </div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Completed
                                </div>
                            </div>
                            <div>
                                <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {totalCount - completedCount}
                                </div>
                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Remaining
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodoListApp;

