import React, { useState } from 'react';
// Fix: Added .ts extension to import
import { Project, User, LogItem } from '../../types';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, SunIcon, UsersIcon, CameraIcon, PlusIcon, TrashIcon, ClipboardDocumentListIcon } from '../Icons';
// Fix: Added .ts extension to import
import * as api from '../../api';


interface DailyLogScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

type SectionType = 'labor' | 'equipment' | 'materials';

const DailyLogScreen: React.FC<DailyLogScreenProps> = ({ project, goBack, currentUser }) => {
    const [weather, setWeather] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);

    const [labor, setLabor] = useState<LogItem[]>([]);
    const [equipment, setEquipment] = useState<LogItem[]>([]);
    const [materials, setMaterials] = useState<LogItem[]>([]);

    const stateSetters = {
        labor: setLabor,
        equipment: setEquipment,
        materials: setMaterials,
    };

    const handleAddItem = (section: SectionType) => {
        const setter = stateSetters[section];
        setter(prev => [...prev, { id: Date.now(), item: '', quantity: '', unitCost: '' }]);
    };

    const handleItemChange = (section: SectionType, id: number, field: keyof Omit<LogItem, 'id'>, value: string) => {
        const setter = stateSetters[section];
        setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleRemoveItem = (section: SectionType, id: number) => {
        const setter = stateSetters[section];
        setter(prev => prev.filter(item => item.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dailyLogData = {
            projectId: project.id,
            userId: currentUser.id,
            date: new Date().toISOString().split('T')[0],
            weather,
            notes,
            photos,
            labor,
            equipment,
            materials
        };
        await api.createDailyLog(dailyLogData, currentUser);
        alert('Daily log submitted successfully!');
        goBack();
    };
    
    const LogSection: React.FC<{
        title: string;
        items: LogItem[];
        sectionType: SectionType;
    }> = ({ title, items, sectionType }) => (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            {items.length > 0 && (
                <div className="grid grid-cols-12 gap-x-2 sm:gap-x-4 mb-2 text-sm font-semibold text-gray-500">
                    <div className="col-span-5 sm:col-span-6">Item</div>
                    <div className="col-span-3 sm:col-span-2 text-right">Quantity</div>
                    <div className="col-span-3 text-right">Unit Cost</div>
                    <div className="col-span-1"></div>
                </div>
            )}
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-x-2 sm:gap-x-4 items-center">
                        <div className="col-span-5 sm:col-span-6">
                            <input type="text" value={item.item} onChange={e => handleItemChange(sectionType, item.id, 'item', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Description" />
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                             <input type="number" value={item.quantity} onChange={e => handleItemChange(sectionType, item.id, 'quantity', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-right" placeholder="0" />
                        </div>
                        <div className="col-span-3">
                             <input type="number" value={item.unitCost} onChange={e => handleItemChange(sectionType, item.id, 'unitCost', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-right" placeholder="0.00" />
                        </div>
                        <div className="col-span-1 text-center">
                            <button type="button" onClick={() => handleRemoveItem(sectionType, item.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => handleAddItem(sectionType)} className="w-full mt-4 p-2 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm">
                <PlusIcon className="w-5 h-5" /> Add {title.slice(0, -1)}
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                 <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Daily Log - {new Date().toLocaleDateString()}</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>
            <div className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="weather" className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                                <SunIcon className="w-5 h-5" /> Weather
                            </label>
                            <input type="text" id="weather" value={weather} onChange={e => setWeather(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Sunny, 18°C" />
                        </div>
                    </div>
                </div>

                <LogSection title="Labor" items={labor} sectionType="labor" />
                <LogSection title="Equipment" items={equipment} sectionType="equipment" />
                <LogSection title="Materials" items={materials} sectionType="materials" />

                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                    <label htmlFor="notes" className="block text-lg font-bold text-gray-800 mb-3">Notes / Work Performed</label>
                    <textarea id="notes" rows={5} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Log of daily activities, deliveries, visitors, issues..." />
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                     <h3 className="font-bold text-lg text-gray-800 mb-3">Photos of the Day</h3>
                     <button type="button" className="w-full p-3 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm">
                        <CameraIcon className="w-5 h-5" /> Add Photos
                    </button>
                </div>
            </div>
             <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button type="button" onClick={goBack} className="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">Cancel</button>
                <button type="button" onClick={handleSubmit} className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">Submit Log</button>
            </footer>
        </div>
    );
};

export default DailyLogScreen;