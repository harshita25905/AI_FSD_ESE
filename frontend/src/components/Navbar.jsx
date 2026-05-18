import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, BrainCircuit, LogOut, ShieldAlert } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 glass-panel shadow-lg border-b border-white/5 px-6 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
                        <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            Talent<span className="text-blue-500">AI</span>
                        </span>
                        <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                            Performance Suite
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    <div className="flex gap-1">
                        <Link 
                            to="/employees" 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                isActive('/employees') || isActive('/')
                                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                        >
                            <Users className="h-4 w-4" />
                            Employees
                        </Link>
                        <Link 
                            to="/ai-recommendations" 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                isActive('/ai-recommendations')
                                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                            }`}
                        >
                            <BrainCircuit className="h-4 w-4" />
                            AI Insights
                        </Link>
                    </div>

                    <div className="h-6 w-[1px] bg-slate-800"></div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-semibold text-slate-200">{user.name}</span>
                            <span className="block text-xs text-slate-500">Administrator</span>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-rose-500/5 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
