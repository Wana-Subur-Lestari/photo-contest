import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPhotos, getRankingStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
    const [photos, setPhotos] = useState([]);
    const [rankingStatus, setRankingStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [photosRes, statusRes] = await Promise.all([
                getPhotos(),
                getRankingStatus()
            ]);

            setPhotos(photosRes.data);
            setRankingStatus(statusRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">
                    Welcome, {user?.username}!
                </h1>
                <p className="text-gray-600 text-lg">
                    Vote for your favorite photos by ranking them
                </p>
            </div>

            {/* Ranking Status Card */}
            <div className={`mb-8 p-6 rounded-lg ${rankingStatus?.has_ranked
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-yellow-50 border-2 border-yellow-200'
                }`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold mb-2">
                            {rankingStatus?.has_ranked ? '✓ You have ranked photos!' : '⚠ You haven\'t ranked any photos yet'}
                        </h3>
                        <p className="text-gray-700">
                            {rankingStatus?.has_ranked
                                ? `You've ranked ${rankingStatus.photos_ranked} photo${rankingStatus.photos_ranked !== 1 ? 's' : ''}`
                                : 'Start ranking photos to participate in the voting'
                            }
                        </p>
                    </div>
                    <Link
                        to="/rank"
                        className={`px-6 py-3 rounded-lg font-semibold transition ${rankingStatus?.has_ranked
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }`}
                    >
                        {rankingStatus?.has_ranked ? 'Update Rankings' : 'Rank Photos Now'}
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            {isAdmin() &&
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/rank"
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
                    >
                        <div className="text-4xl mb-2">🏆</div>
                        <h3 className="text-xl font-semibold mb-2">Rank Photos</h3>
                        <p className="text-gray-600 text-sm">
                            Select and rank your favorite photos (1-5)
                        </p>
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
                    >
                        <div className="text-4xl mb-2">📊</div>
                        <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
                        <p className="text-gray-600 text-sm">
                            See which photos are winning
                        </p>
                    </Link>

                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        <div className="text-4xl mb-2">📸</div>
                        <h3 className="text-xl font-semibold mb-2">Total Photos</h3>
                        <p className="text-3xl font-bold text-blue-600">{photos.length}</p>
                    </div>
                </div>
            }

            {/* Photo Gallery Preview */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">All Photos</h2>
                    <Link
                        to="/rank"
                        className="text-blue-500 hover:underline"
                    >
                        Rank them →
                    </Link>
                </div>

                {photos.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No photos available yet
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map(photo => (
                            <div
                                key={photo.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-3">
                                    <h3 className="font-semibold truncate">{photo.title}</h3>
                                    {photo.description && (
                                        <p className="text-sm text-gray-600 truncate">{photo.description}</p>
                                    )}
                                    {/* <div className="mt-2 flex justify-between text-xs text-gray-500">
                                        <span>{photo.total_points} pts</span>
                                        <span>{photo.times_ranked} votes</span>
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}