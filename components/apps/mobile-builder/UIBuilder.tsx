/**
 * UI Builder - Visual drag & drop interface for building app screens
 */

import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Eye,
    Code,
    Smartphone,
    Layout,
    Type,
    Square,
    List,
    Image as ImageIcon,
    CheckSquare,
    Calendar,
    MapPin,
    Camera,
    Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UIBuilderProps {
    isDarkMode?: boolean;
    onScreensChange?: (screens: Screen[]) => void;
}

interface Component {
    id: string;
    type: string;
    label: string;
    icon: any;
    props: any;
}

interface Screen {
    id: string;
    name: string;
    components: Component[];
}

const UIBuilder: React.FC<UIBuilderProps> = ({ isDarkMode = true, onScreensChange }) => {
    const [screens, setScreens] = useState<Screen[]>([
        { id: '1', name: 'Home', components: [] }
    ]);
    const [activeScreen, setActiveScreen] = useState<Screen>(screens[0]);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [previewMode, setPreviewMode] = useState(false);

    const componentLibrary = [
        { type: 'text', label: 'Text', icon: Type, defaultProps: { text: 'Text', size: 'medium' } },
        { type: 'button', label: 'Button', icon: Square, defaultProps: { text: 'Button', color: 'primary' } },
        { type: 'input', label: 'Input', icon: Type, defaultProps: { placeholder: 'Enter text...', type: 'text' } },
        { type: 'list', label: 'List', icon: List, defaultProps: { items: [] } },
        { type: 'image', label: 'Image', icon: ImageIcon, defaultProps: { src: '', alt: 'Image' } },
        { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, defaultProps: { label: 'Checkbox', checked: false } },
        { type: 'date', label: 'Date Picker', icon: Calendar, defaultProps: { label: 'Select Date' } },
        { type: 'location', label: 'Location', icon: MapPin, defaultProps: { label: 'Location' } },
        { type: 'camera', label: 'Camera', icon: Camera, defaultProps: { label: 'Take Photo' } },
        { type: 'upload', label: 'File Upload', icon: Upload, defaultProps: { label: 'Upload File' } }
    ];

    const addComponent = (type: string) => {
        const componentDef = componentLibrary.find(c => c.type === type);
        if (!componentDef) return;

        const newComponent: Component = {
            id: Date.now().toString(),
            type,
            label: componentDef.label,
            icon: componentDef.icon,
            props: { ...componentDef.defaultProps }
        };

        const updatedScreen = {
            ...activeScreen,
            components: [...activeScreen.components, newComponent]
        };

        setActiveScreen(updatedScreen);
        setScreens(screens.map(s => s.id === activeScreen.id ? updatedScreen : s));
        toast.success(`${componentDef.label} added!`);
    };

    const removeComponent = (componentId: string) => {
        const updatedScreen = {
            ...activeScreen,
            components: activeScreen.components.filter(c => c.id !== componentId)
        };

        setActiveScreen(updatedScreen);
        setScreens(screens.map(s => s.id === activeScreen.id ? updatedScreen : s));
        toast.success('Component removed!');
    };

    const addScreen = () => {
        const newScreen: Screen = {
            id: Date.now().toString(),
            name: `Screen ${screens.length + 1}`,
            components: []
        };

        setScreens([...screens, newScreen]);
        setActiveScreen(newScreen);
        toast.success('Screen added!');
    };

    const renderComponent = (component: Component) => {
        const Icon = component.icon;
        const isSelected = selectedComponent?.id === component.id;

        return (
            <div
                key={component.id}
                onClick={() => setSelectedComponent(component)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                        ? 'border-purple-500 bg-purple-500/10'
                        : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {component.label}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeComponent(component.id);
                        }}
                        className={`p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors`}
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Component Preview */}
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {component.type === 'text' && <p>{component.props.text}</p>}
                    {component.type === 'button' && (
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">
                            {component.props.text}
                        </button>
                    )}
                    {component.type === 'input' && (
                        <input
                            type="text"
                            placeholder={component.props.placeholder}
                            className={`w-full px-3 py-2 rounded-lg border ${
                                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                            }`}
                            readOnly
                        />
                    )}
                    {component.type === 'checkbox' && (
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={component.props.checked} readOnly />
                            <span>{component.props.label}</span>
                        </label>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex gap-6">
            {/* Component Library */}
            <div className={`w-64 p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Components
                </h3>
                <div className="space-y-2">
                    {componentLibrary.map(component => {
                        const Icon = component.icon;
                        return (
                            <button
                                key={component.type}
                                type="button"
                                onClick={() => addComponent(component.type)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                    isDarkMode 
                                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-sm font-medium">{component.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border mb-4 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-2">
                        {screens.map(screen => (
                            <button
                                key={screen.id}
                                type="button"
                                onClick={() => setActiveScreen(screen)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    activeScreen.id === screen.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                        : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {screen.name}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={addScreen}
                            className={`p-2 rounded-lg ${
                                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                    >
                        {previewMode ? <Code className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                </div>

                {/* Screen Canvas */}
                <div className={`flex-1 p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    {previewMode ? (
                        <div className="max-w-md mx-auto">
                            <div className={`rounded-3xl border-8 ${
                                isDarkMode ? 'border-gray-900 bg-gray-900' : 'border-gray-800 bg-white'
                            } shadow-2xl overflow-hidden`}>
                                <div className={`h-12 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
                                    <div className="w-24 h-1 bg-gray-600 rounded-full"></div>
                                </div>
                                <div className={`p-6 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                    {activeScreen.components.map(component => renderComponent(component))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-6">
                                <Smartphone className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {activeScreen.name}
                                </h3>
                            </div>

                            {activeScreen.components.length === 0 ? (
                                <div className="text-center py-12">
                                    <Layout className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Drag components from the library to start building
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeScreen.components.map(component => renderComponent(component))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Properties Panel */}
            {selectedComponent && !previewMode && (
                <div className={`w-80 p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Properties
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Component Type
                            </label>
                            <div className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                {selectedComponent.label}
                            </div>
                        </div>
                        {/* Add more property editors based on component type */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UIBuilder;

