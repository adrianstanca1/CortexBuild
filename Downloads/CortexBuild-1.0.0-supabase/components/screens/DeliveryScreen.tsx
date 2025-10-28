

import React, { useState, useEffect } from 'react';
// Fix: Corrected import paths to include file extensions.
import { Project, DeliveryItem } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
import { ChevronLeftIcon, QRCodeIcon, CheckIcon } from '../Icons';

interface DeliveryScreenProps {
    project: Project;
    goBack: () => void;
}

const DeliveryScreen: React.FC<DeliveryScreenProps> = ({ project, goBack }) => {
    const [items, setItems] = useState<DeliveryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadItems = async () => {
            setIsLoading(true);
            const fetchedItems = await api.fetchDeliveryItems();
            setItems(fetchedItems);
            setIsLoading(false);
        };
        loadItems();
    }, []);


    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Header */}
            <header className="bg-white p-4 flex items-center border-b mb-8">
                 <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Delivery</h1>
                    <p className="text-sm text-gray-500">Packing Slip #PS-1842</p>
                </div>
            </header>

            <main className="flex-grow space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-md hover:bg-blue-50">
                        <QRCodeIcon className="w-6 h-6" /> Scan QR/Barcode
                    </button>
                    <button className="flex-1 w-full px-4 py-3 border border-gray-300 bg-white text-gray-700 font-bold rounded-md hover:bg-gray-50">
                        Manual Entry
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-100">
                    <div className="grid grid-cols-12 p-3 border-b bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-3 text-center">Ordered</div>
                        <div className="col-span-3 text-center">Received</div>
                    </div>
                    {isLoading ? (
                        <p className="text-center p-4 text-sm text-gray-500">Loading items...</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {items.map((item) => (
                                <li key={item.id} className={`grid grid-cols-12 p-3 items-center text-sm ${item.received < item.ordered && item.received > 0 ? 'bg-yellow-50' : ''}`}>
                                    <div className="col-span-6 font-semibold text-gray-800">{item.name}</div>
                                    <div className="col-span-3 text-center text-gray-600">{item.ordered}</div>
                                    <div className="col-span-3 text-center">
                                        <input 
                                            type="number" 
                                            defaultValue={item.received}
                                            className={`w-16 p-1 text-center border rounded-md ${item.received === item.ordered ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                                        />
                                    </div>
                                </li>
                            ))}
                            <li className="grid grid-cols-12 p-3 items-center text-sm bg-red-50">
                                    <div className="col-span-6 font-semibold text-red-800">Insulation R-13</div>
                                    <div className="col-span-3 text-center text-red-800">{25}</div>
                                    <div className="col-span-3 text-center">
                                        <input 
                                            type="number" 
                                            defaultValue={0}
                                            className="w-16 p-1 text-center border rounded-md border-red-400 bg-red-100"
                                        />
                                    </div>
                                </li>
                        </ul>
                    )}
                </div>
                 <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <h3 className="font-bold text-gray-800 mb-2">Notes / Photo</h3>
                    <button className="w-full p-2 text-blue-600 border-2 border-dashed border-gray-300 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center gap-2">
                       Add Note or Photo Proof
                    </button>
                </div>
            </main>
            
            <footer className="bg-white p-4 mt-8 border-t flex justify-end items-center gap-4">
                <button className="px-4 py-3 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-bold">Partial Receive</button>
                <button className="px-4 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 font-bold flex items-center gap-2">
                    <CheckIcon className="w-5 h-5" /> Complete
                </button>
            </footer>
        </div>
    );
};

export default DeliveryScreen;