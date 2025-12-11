import { useState, useEffect } from 'react';
import { getPhotos, uploadPhoto, deletePhoto } from '../services/api';

export default function AdminPage() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: ''
    });

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const response = await getPhotos();
            setPhotos(response.data);
        } catch (error) {
            console.error('Failed to load photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setMessage('');

        try {
            await uploadPhoto(formData);
            setMessage('Photo uploaded successfully!');
            setFormData({ url: '', title: '', description: '' });
            loadPhotos();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(error.response?.data || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will also delete all rankings for this photo.`)) {
            return;
        }

        try {
            await deletePhoto(id);
            setMessage('Photo deleted successfully!');
            loadPhotos();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to delete photo');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

            {message && (
                <div className={`mb-6 p-4 rounded ${message.includes('success')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {message}
                </div>
            )}

            {/* Upload Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Upload New Photo</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Photo URL *
                        </label>
                        <input
                            type="url"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter a direct URL to an image (jpg, png, etc.)
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Sunset at the Beach"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="A beautiful sunset captured at the beach..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Preview */}
                    {formData.url && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Preview
                            </label>
                            <img
                                src={formData.url}
                                alt="Preview"
                                className="w-48 h-48 object-cover rounded border border-gray-300"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:bg-gray-400"
                    >
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                </form>
            </div>

            {/* Photos List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                    Manage Photos ({photos.length})
                </h2>

                {photos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No photos uploaded yet</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {photos.map(photo => (
                            <div
                                key={photo.id}
                                className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <img
                                    src={photo.url}
                                    alt={photo.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold mb-1">{photo.title}</h3>
                                    {photo.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {photo.description}
                                        </p>
                                    )}
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                                        <span>{photo.total_points} pts</span>
                                        <span>{photo.times_ranked} votes</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(photo.id, photo.title)}
                                        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition text-sm"
                                    >
                                        Delete Photo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}