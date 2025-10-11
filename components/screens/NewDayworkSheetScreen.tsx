import React, { useState } from 'react';
import { Project, User } from '../../types';
import * as api from '../../api';
import { ChevronLeftIcon, PlusIcon } from '../Icons';

interface NewDayworkSheetScreenProps {
    project: Project;
    goBack: () => void;
    currentUser: User;
}

const NewDayworkSheetScreen: React.FC<NewDayworkSheetScreenProps> = ({ project, goBack, currentUser }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [contractor, setContractor] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !contractor || !description) {
            alert('Please fill out all fields.');
            return;
        }

        await api.createDayworkSheet({
            projectId: project.id,
            date,
            contractor,
            description,
        }, currentUser);

        alert('Daywork sheet submitted!');
        goBack();
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                 <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">New Daywork Sheet</h1>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
            </header>
            <form onSubmit={handleSubmit} className="flex-grow space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                    <div>
                        <label htmlFor="contractor" className="block text-sm font-bold text-gray-700 mb-1">Contractor Performing Work</label>
                        <input type="text" id="contractor" value={contractor} onChange={e => setContractor(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., ABC Electrical" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Description of Work</label>
                        <textarea id="description" rows={5} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
                     <h3 className="font-bold text-gray-800 mb-3">Attachments</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button type="button" className="w-full p-3 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm">
                            <PlusIcon className="w-5 h-5" /> Add Labor
                        </button>
                         <button type="button" className="w-full p-3 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm">
                            <PlusIcon className="w-5 h-5" /> Add Equipment
                        </button>
                         <button type="button" className="w-full p-3 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm md:col-span-2">
                            <PlusIcon className="w-5 h-5" /> Add Materials
                        </button>
                    </div>
                </div>
            </form>
             <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button type="button" onClick={goBack} className="px-6 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">Cancel</button>
                <button type="submit" onClick={handleSubmit} className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-bold">Submit for Approval</button>
            </footer>
        </div>
    );
};

export default NewDayworkSheetScreen;