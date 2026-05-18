import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import EmployeeForm from './EmployeeForm';
import { 
    Search, Plus, Edit2, Trash2, Brain, Filter, ChevronDown, Check,
    Sparkles, UserCheck, AlertTriangle, Layers, Calendar, BarChart2, Award 
} from 'lucide-react';

const EmployeeList = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Search and Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [minScore, setMinScore] = useState('');
    
    // Modal states
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Multi-select for AI ranking
    const [selectedIds, setSelectedIds] = useState([]);

    const departments = ["Development", "Design", "Management", "Marketing", "QA / Testing", "HR / Admin"];

    const fetchEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            // First try filtering if department is explicitly selected
            let url = '/api/employees';
            if (selectedDept) {
                url = `/api/employees/search?department=${encodeURIComponent(selectedDept)}`;
            }
            
            const { data } = await axios.get(url);
            setEmployees(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.response?.data?.message || 'Could not fetch employee records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [selectedDept]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let url = '/api/employees';
            if (searchQuery.trim()) {
                url = `/api/employees/search?query=${encodeURIComponent(searchQuery.trim())}`;
            } else if (selectedDept) {
                url = `/api/employees/search?department=${encodeURIComponent(selectedDept)}`;
            }
            const { data } = await axios.get(url);
            setEmployees(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Search failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this employee from the database? This action is irreversible.')) {
            try {
                await axios.delete(`/api/employees/${id}`);
                // Remove from multi-select if selected
                setSelectedIds(prev => prev.filter(item => item !== id));
                fetchEmployees();
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete employee.');
            }
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(item => item !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredEmployees.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredEmployees.map(emp => emp._id));
        }
    };

    const handleSingleAIRecommend = (id) => {
        navigate('/ai-recommendations', { state: { employeeId: id } });
    };

    const handleBulkAIRecommend = () => {
        if (selectedIds.length === 0) return;
        navigate('/ai-recommendations', { state: { employeeIds: selectedIds } });
    };

    // Client-side local filters for Score
    const filteredEmployees = employees.filter(emp => {
        if (minScore) {
            return emp.performanceScore >= Number(minScore);
        }
        return true;
    });

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    };

    const getScoreProgressColor = (score) => {
        if (score >= 80) return 'bg-emerald-500 shadow-emerald-500/30';
        if (score >= 50) return 'bg-amber-500 shadow-amber-500/30';
        return 'bg-rose-500 shadow-rose-500/30';
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pb-20 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        Corporate Dashboard
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Manage employee performance benchmarks and generate talent optimizations.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkAIRecommend}
                            className="px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2.5 cursor-pointer animate-pulse"
                        >
                            <Brain className="h-5 w-5" />
                            Rank & Review Selected ({selectedIds.length})
                        </button>
                    )}
                    
                    <button
                        onClick={() => {
                            setSelectedEmployee(null);
                            setShowForm(true);
                        }}
                        className="px-5 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2.5 cursor-pointer"
                    >
                        <Plus className="h-5 w-5" />
                        Register Employee
                    </button>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    
                    {/* General Text Search */}
                    <div className="lg:col-span-5 space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Search Keywords
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, skills..."
                                className="w-full pl-11 pr-4 py-3 glass-input rounded-2xl text-sm"
                            />
                            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                        </div>
                    </div>

                    {/* Department Dropdown Filter */}
                    <div className="lg:col-span-3 space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Filter by Department
                        </label>
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-2xl text-sm appearance-none cursor-pointer"
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept} className="bg-[#151c2c]">{dept}</option>
                            ))}
                        </select>
                    </div>

                    {/* Performance Score Slider/Filter */}
                    <div className="lg:col-span-2 space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                            Min Performance Score
                        </label>
                        <select
                            value={minScore}
                            onChange={(e) => setMinScore(e.target.value)}
                            className="w-full px-4 py-3 glass-input rounded-2xl text-sm appearance-none cursor-pointer"
                        >
                            <option value="">Any Score</option>
                            <option value="80" className="bg-[#151c2c]">High Performers (&gt;= 80)</option>
                            <option value="50" className="bg-[#151c2c]">Mid-Range (&gt;= 50)</option>
                            <option value="0" className="bg-[#151c2c]">All Employees</option>
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className="lg:col-span-2 flex gap-2">
                        <button
                            type="submit"
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-200 font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Filter className="h-4 w-4" />
                            Search
                        </button>
                        {(searchQuery || selectedDept || minScore) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedDept('');
                                    setMinScore('');
                                    setEmployees([]);
                                    setTimeout(() => fetchEmployees(), 50);
                                }}
                                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-2xl text-sm font-semibold transition-all cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-2xl flex items-center gap-3 mb-8">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Employee Records Grid / Table */}
            <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-slate-900/40">
                                <th className="p-5 w-12 text-center">
                                    <button 
                                        onClick={toggleSelectAll}
                                        className={`h-5 w-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                            selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0
                                                ? 'bg-indigo-500 border-indigo-400 text-white'
                                                : 'border-slate-600 hover:border-slate-500 bg-slate-950/45'
                                        }`}
                                    >
                                        {selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0 && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                    </button>
                                </th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Experience</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-64">Performance Score</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Skills</th>
                                <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                        <span className="block text-slate-400 font-medium">Analyzing database records...</span>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-slate-400 font-medium">
                                        No employee profiles found. Try adding a record or refining your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr 
                                        key={emp._id} 
                                        className={`transition-colors hover:bg-white/[0.02] ${
                                            selectedIds.includes(emp._id) ? 'bg-indigo-500/[0.02]' : ''
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <td className="p-5 text-center">
                                            <button 
                                                onClick={() => toggleSelect(emp._id)}
                                                className={`h-5 w-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                                    selectedIds.includes(emp._id)
                                                        ? 'bg-indigo-500 border-indigo-400 text-white'
                                                        : 'border-slate-600 hover:border-slate-500 bg-slate-950/45'
                                                }`}
                                            >
                                                {selectedIds.includes(emp._id) && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                            </button>
                                        </td>

                                        {/* Employee details */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center shrink-0">
                                                    {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="block font-semibold text-slate-200 text-sm hover:text-white transition-colors">
                                                        {emp.name}
                                                    </span>
                                                    <span className="block text-xs text-slate-500">{emp.email}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Department */}
                                        <td className="p-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-white/5">
                                                {emp.department}
                                            </span>
                                        </td>

                                        {/* Experience */}
                                        <td className="p-5">
                                            <div className="flex items-center gap-1 text-slate-300 text-sm font-medium">
                                                <Calendar className="h-4 w-4 text-slate-500" />
                                                <span>{emp.experience} {emp.experience === 1 ? 'Year' : 'Years'}</span>
                                            </div>
                                        </td>

                                        {/* Performance score */}
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center text-xs font-semibold">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getScoreColor(emp.performanceScore)}`}>
                                                        {emp.performanceScore >= 80 ? 'High' : emp.performanceScore >= 50 ? 'Mid' : 'Low'}
                                                    </span>
                                                    <span className="text-slate-300 font-bold">{emp.performanceScore}%</span>
                                                </div>
                                                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.3)] ${getScoreProgressColor(emp.performanceScore)}`}
                                                        style={{ width: `${emp.performanceScore}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Skills tags */}
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                                {emp.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {emp.skills.length > 3 && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                                        +{emp.skills.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Action buttons */}
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleSingleAIRecommend(emp._id)}
                                                    className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                                                    title="Generate AI Recommendations"
                                                >
                                                    <Sparkles className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployee(emp);
                                                        setShowForm(true);
                                                    }}
                                                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp._id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition-all cursor-pointer"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Render Employee Add/Edit Form Modal */}
            {showForm && (
                <EmployeeForm
                    employee={selectedEmployee}
                    onClose={() => {
                        setShowForm(false);
                        setSelectedEmployee(null);
                    }}
                    onSuccess={() => {
                        fetchEmployees();
                    }}
                />
            )}
        </div>
    );
};

export default EmployeeList;
