import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const response = await getLeaderboard();
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading leaderboard...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Photo Leaderboard</h1>

            {leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    No photos have been ranked yet
                </div>
            ) : (
                <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                        <div
                            key={entry.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                        >
                            <div className="flex items-center p-4">
                                {/* Rank Badge */}
                                <div className="flex-shrink-0 mr-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                            index === 1 ? 'bg-gray-300 text-gray-700' :
                                                index === 2 ? 'bg-orange-400 text-orange-900' :
                                                    'bg-blue-100 text-blue-700'
                                        }`}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Photo */}
                                <div className="flex-shrink-0 mr-4">
                                    <img
                                        src={entry.url}
                                        alt={entry.title}
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-grow">
                                    <h3 className="text-xl font-semibold mb-1">{entry.title}</h3>
                                    {entry.description && (
                                        <p className="text-gray-600 text-sm mb-2">{entry.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Uploaded by: {entry.uploaded_by_username}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex-shrink-0 text-right">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {entry.total_points}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        points
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {entry.times_ranked} {entry.times_ranked === 1 ? 'vote' : 'votes'}
                                    </div>
                                    {entry.avg_points_per_ranking && (
                                        <div className="text-xs text-gray-400">
                                            Avg: {entry.avg_points_per_ranking.toFixed(1)} pts
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trophy for top 3 */}
                            {index < 3 && (
                                <div className={`h-1 ${index === 0 ? 'bg-yellow-400' :
                                        index === 1 ? 'bg-gray-300' :
                                            'bg-orange-400'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}