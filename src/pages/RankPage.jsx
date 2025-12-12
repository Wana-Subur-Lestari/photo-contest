import { useState, useEffect } from 'react';
import { getPhotos, submitRankings, getMyRankings } from '../services/api';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function RankPage() {
    const [photos, setPhotos] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [currentRankings, setCurrentRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [photosRes, rankingsRes] = await Promise.all([
                getPhotos(),
                getMyRankings()
            ]);

            setPhotos(photosRes.data);
            setCurrentRankings(rankingsRes.data);

            // Pre-populate selectedPhotos from current rankings
            if (rankingsRes.data.length > 0) {
                const ranked = rankingsRes.data.map(r => ({
                    photo_id: r.photo_id,
                    rank_position: r.rank_position,
                    points: r.points
                }));
                setSelectedPhotos(ranked);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (photoId) => {
        const index = photos.findIndex(p => p.id === photoId);
        setCurrentPhotoIndex(index);
        setShowModal(true);
    };

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handlePhotoSelect = (photoId, position) => {
        const points = 6 - position; // 1st=5pts, 2nd=4pts, etc.

        // Remove photo if already selected at this position
        const existing = selectedPhotos.find(p => p.rank_position === position);
        if (existing && existing.photo_id === photoId) {
            setSelectedPhotos(selectedPhotos.filter(p => p.rank_position !== position));
            return;
        }

        // Remove this photo from any other position
        const filtered = selectedPhotos.filter(p => p.photo_id !== photoId);

        // Add new selection
        setSelectedPhotos([...filtered.filter(p => p.rank_position !== position), {
            photo_id: photoId,
            rank_position: position,
            points: points
        }].sort((a, b) => a.rank_position - b.rank_position));
    };

    const handleSubmit = async () => {
        if (selectedPhotos.length === 0) {
            setMessage('Please select at least one photo to rank');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {

            await submitRankings({ rankings: selectedPhotos });
            setMessage('Rankings submitted successfully!');
            Swal.fire({
                icon: "success",
                text: "Berhasil Submit Foto!",
            });
            setMessage('Rankings submitted successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            Swal.fire({
                icon: "error",
                text: "Gagal submit foto. Silahkan coba lagi!",
            });
            setMessage(error.response?.data || 'Failed to submit rankings');
        } finally {
            setSubmitting(false);
        }
    };

    const getPhotoForPosition = (position) => {
        const selected = selectedPhotos.find(p => p.rank_position === position);
        if (selected) {
            return photos.find(p => p.id === selected.photo_id);
        }
        return null;
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    const currentPhoto = photos[currentPhotoIndex];

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Rank Your Favorite Photos</h1>

            {message && (
                <div className={`mb-4 p-4 rounded ${message.includes('success')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            <div className="mb-8 bg-blue-50 p-4 rounded flex justify-between items-center">
                <p className="text-sm text-gray-700">
                    Select 1-5 photos and assign them ranks. 1st place = 5 points, 2nd = 4 points, etc.
                </p>
                <button
                    onClick={() => openModal(photos[0]?.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center gap-2"
                >
                    <span>🖼️</span>
                    View Gallery
                </button>
            </div>

            {/* Ranking Slots */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(position => {
                    const photo = getPhotoForPosition(position);
                    const points = 6 - position;

                    return (
                        <div key={position} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <h3 className="font-bold text-center mb-2">
                                Rank #{position} ({points} pts)
                            </h3>
                            {photo ? (
                                <div className="relative">
                                    <img
                                        src={photo.url}
                                        alt={photo.title}
                                        className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
                                        onClick={() => openModal(photo.id)}
                                    />
                                    <button
                                        onClick={() => handlePhotoSelect(photo.id, position)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                    <p className="text-xs mt-1 text-center truncate">{photo.title}</p>
                                </div>
                            ) : (
                                <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                    Empty
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Photo Gallery Preview */}
            <h2 className="text-2xl font-bold mb-4">Select Photos to Rank</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {photos.map(photo => {
                    const isSelected = selectedPhotos.some(p => p.photo_id === photo.id);

                    return (
                        <div
                            key={photo.id}
                            className={`cursor-pointer border-2 rounded-lg overflow-hidden transition ${isSelected ? 'border-blue-500 opacity-50' : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <img
                                src={photo.url}
                                alt={photo.title}
                                className="w-full h-32 object-cover"
                                onClick={() => openModal(photo.id)}
                            />
                            <div className="p-2">
                                <p className="text-sm font-medium truncate">{photo.title}</p>

                                {/* Position selector buttons */}
                                {!isSelected && (
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(pos => {
                                            const positionTaken = selectedPhotos.some(p => p.rank_position === pos);
                                            return (
                                                <button
                                                    key={pos}
                                                    onClick={() => handlePhotoSelect(photo.id, pos)}
                                                    disabled={positionTaken}
                                                    className={`flex-1 text-xs py-1 rounded ${positionTaken
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                        }`}
                                                >
                                                    #{pos}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {isSelected && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Selected
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleSubmit}
                    disabled={submitting || selectedPhotos.length === 0}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : `Submit Rankings (${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''})`}
                </button>
            </div>

            {/* Modal/Carousel */}
            {showModal && currentPhoto && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 z-10 text-2xl"
                        >
                            ×
                        </button>

                        {/* Previous button */}
                        <button
                            onClick={prevPhoto}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-200 text-2xl"
                        >
                            ‹
                        </button>

                        {/* Next button */}
                        <button
                            onClick={nextPhoto}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-200 text-2xl"
                        >
                            ›
                        </button>

                        {/* Image */}
                        <div className="bg-white rounded-lg overflow-hidden">
                            <img
                                src={currentPhoto.url}
                                alt={currentPhoto.title}
                                className="w-full max-h-[70vh] object-contain"
                            />

                            {/* Photo info */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2">{currentPhoto.title}</h3>
                                {currentPhoto.description && (
                                    <p className="text-gray-600 mb-4">{currentPhoto.description}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Photo {currentPhotoIndex + 1} of {photos.length}
                                    </div>

                                    {/* Quick rank buttons */}
                                    <div className="flex gap-2">
                                        <span className="text-sm text-gray-600 mr-2">Quick rank:</span>
                                        {[1, 2, 3, 4, 5].map(pos => {
                                            const positionTaken = selectedPhotos.some(p => p.rank_position === pos);
                                            const isThisPhoto = selectedPhotos.some(p => p.photo_id === currentPhoto.id && p.rank_position === pos);

                                            return (
                                                <button
                                                    key={pos}
                                                    onClick={() => {
                                                        handlePhotoSelect(currentPhoto.id, pos);
                                                        setShowModal(false);
                                                    }}
                                                    disabled={positionTaken && !isThisPhoto}
                                                    className={`px-3 py-1 rounded text-sm ${isThisPhoto
                                                        ? 'bg-green-500 text-white'
                                                        : positionTaken
                                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                                        }`}
                                                >
                                                    #{pos}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}