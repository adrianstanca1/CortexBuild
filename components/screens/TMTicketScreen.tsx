import React from 'react';
import { ChevronLeftIcon } from '../Icons';

interface TMTicketScreenProps {
    goBack: () => void;
}

const TMTicketScreen: React.FC<TMTicketScreenProps> = ({ goBack }) => {
    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <header className="bg-white p-4 flex items-center border-b mb-8">
                <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">T&M Tickets</h1>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-100">
                <div className="text-center p-8">
                    <h2 className="text-xl font-semibold text-gray-700">Feature Update</h2>
                    <p className="mt-2 text-gray-500">
                        Time & Materials (T&M) tickets are managed under the "Daywork Sheets" module.
                    </p>
                    <button onClick={goBack} className="mt-6 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700">
                        Go Back
                    </button>
                </div>
            </main>
        </div>
    );
};

export default TMTicketScreen;
