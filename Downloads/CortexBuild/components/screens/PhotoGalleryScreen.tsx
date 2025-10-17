import React, { useState } from 'react';
// Fix: Added .ts extension to import
import { Project } from '../../types';
// Fix: Added .tsx extension to import
import { ChevronLeftIcon, PlusIcon } from '../Icons';
import PhotoLightbox, { LightboxPhoto } from '../modals/PhotoLightbox';


interface PhotoGalleryScreenProps {
    project: Project;
    goBack: () => void;
}

const MOCK_PHOTOS = [
    { id: 1, url: 'https://picsum.photos/seed/p1/800/600', date: '2023-10-26', author: 'Charlie' },
    { id: 2, url: 'https://picsum.photos/seed/p2/800/600', date: '2023-10-26', author: 'Diana' },
    { id: 3, url: 'https://picsum.photos/seed/p3/800/600', date: '2023-10-25', author: 'Charlie' },
    { id: 4, url: 'https://picsum.photos/seed/p4/800/600', date: '2023-10-25', author: 'Charlie' },
    { id: 5, url: 'https://picsum.photos/seed/p5/800/600', date: '2023-10-24', author: 'Diana' },
    { id: 6, url: 'https://picsum.photos/seed/p6/800/600', date: '2023-10-24', author: 'Charlie' },
    { id: 7, url: 'https://picsum.photos/seed/p7/800/600', date: '2023-10-23', author: 'Diana' },
    { id: 8, url: 'https://picsum.photos/seed/p8/800/600', date: '2023-10-23', author: 'Charlie' },
];

const PhotoGalleryScreen: React.FC<PhotoGalleryScreenProps> = ({ project, goBack }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index);
        setIsLightboxOpen(true);
    };

    const lightboxPhotos: LightboxPhoto[] = MOCK_PHOTOS.map(photo => ({
        url: photo.url,
        caption: `by ${photo.author} on ${new Date(photo.date).toLocaleDateString()}`,
    }));

    return (
         <div className="flex flex-col h-full max-w-6xl mx-auto">
            <header className="bg-white p-4 flex justify-between items-center border-b mb-8">
                <div className="flex items-center">
                    <button onClick={goBack} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
                        <p className="text-sm text-gray-500">{project.name}</p>
                    </div>
                </div>
                 <button className="bg-blue-600 text-white p-2.5 rounded-full shadow hover:bg-blue-700">
                    <PlusIcon className="w-6 h-6"/>
                </button>
            </header>
             <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {MOCK_PHOTOS.map((photo, index) => (
                    <div key={photo.id} onClick={() => openLightbox(index)} className="bg-white rounded-lg shadow overflow-hidden group cursor-pointer">
                        <img src={photo.url.replace('/800/600', '/400/300')} alt={`Site photo ${photo.id}`} className="w-full h-48 object-cover group-hover:opacity-80 transition-opacity" />
                        <div className="p-2 text-xs">
                            <p className="font-semibold">{new Date(photo.date).toLocaleDateString()}</p>
                            <p className="text-gray-500">by {photo.author}</p>
                        </div>
                    </div>
                ))}
            </main>

            {isLightboxOpen && (
                <PhotoLightbox
                    photos={lightboxPhotos}
                    startIndex={selectedPhotoIndex}
                    onClose={() => setIsLightboxOpen(false)}
                />
            )}
        </div>
    );
};

export default PhotoGalleryScreen;
