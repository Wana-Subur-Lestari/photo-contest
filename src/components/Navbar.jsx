import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-blue-600">
                        Photo Voting
                    </Link>

                    <div className="flex items-center space-x-6">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Photos
                        </Link>
                        <Link
                            to="/rank"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Rank Photos
                        </Link>
                        {isAdmin() && <Link
                            to="/leaderboard"
                            className="text-gray-700 hover:text-blue-600 transition"
                        >
                            Leaderboard
                        </Link>}
                        {isAdmin() && (
                            <Link
                                to="/admin"
                                className="text-gray-700 hover:text-blue-600 transition"
                            >
                                Admin
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                            {user?.username}
                            {isAdmin() && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Admin</span>}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}