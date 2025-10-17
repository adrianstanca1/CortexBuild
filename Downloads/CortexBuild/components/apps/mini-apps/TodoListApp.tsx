/**
 * Todo List App - Simple task management
 */

import React, { useState } from 'react';
import { Plus, Trash2, Check, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
}

interface TodoListAppProps {
    isDarkMode?: boolean;
}

const TodoListApp: React.FC<TodoListAppProps> = ({ isDarkMode = true }) => {
    const [todos, setTodos] = useState<Todo[]>([
        { id: '1', text: 'Welcome to Todo List!', completed: false, createdAt: new Date() },
        { id: '2', text: 'Add your first task', completed: false, createdAt: new Date() }
    ]);
    const [newTodo, setNewTodo] = useState('');

    const addTodo = () => {
        if (!newTodo.trim()) {
            toast.error('Please enter a task');
            return;
        }

        const todo: Todo = {
            id: Date.now().toString(),
            text: newTodo,
            completed: false,
            createdAt: new Date()
        };

        setTodos([...todos, todo]);
        setNewTodo('');
        toast.success('Task added!');
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
        toast.success('Task deleted!');
    };

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;

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
                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                            placeholder="Add a new task..."
                            className={`flex-1 px-4 py-3 rounded-xl border ${
                                isDarkMode 
                                    ? 'bg-gray-800 text-white border-gray-700' 
                                    : 'bg-white text-gray-900 border-gray-300'
                            } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <button
                            type="button"
                            onClick={addTodo}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Todo List */}
                <div className="space-y-3">
                    {todos.map(todo => (
                        <div
                            key={todo.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                todo.completed
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
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    todo.completed
                                        ? 'bg-purple-600 border-purple-600'
                                        : isDarkMode
                                            ? 'border-gray-600 hover:border-purple-500'
                                            : 'border-gray-300 hover:border-purple-500'
                                }`}
                            >
                                {todo.completed && <Check className="h-4 w-4 text-white" />}
                            </button>

                            <span className={`flex-1 ${
                                todo.completed
                                    ? `line-through ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`
                                    : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                                {todo.text}
                            </span>

                            <button
                                type="button"
                                onClick={() => deleteTodo(todo.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                    isDarkMode 
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
                    <div className={`mt-8 p-6 rounded-xl ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
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

