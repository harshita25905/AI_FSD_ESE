import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Briefcase, Award, Calendar, Layers, X, Save, AlertCircle } from 'lucide-react';

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('Development');
    const [skillsText, setSkillsText] = useState('');
    const [performanceScore, setPerformanceScore] = useState('');
    const [experience, setExperience] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isEditMode = !!employee;

    useEffect(() => {
        if (employee) {
            setName(employee.name || '');
            setEmail(employee.email || '');
            setDepartment(employee.department || 'Development');
            setSkillsText(employee.skills ? employee.skills.join(', ') : '');
            setPerformanceScore(employee.performanceScore !== undefined ? employee.performanceScore : '');
            setExperience(employee.experience !== undefined ? employee.experience : '');
        }
    }, [employee]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation checks
        if (!name.trim() || !email.trim() || !department.trim() || !skillsText.trim() || performanceScore === '' || experience === '') {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        const scoreNum = Number(performanceScore);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
            setError('Performance score must be a number between 0 and 100.');
            setLoading(false);
            return;
        }

        const expNum = Number(experience);
        if (isNaN(expNum) || expNum < 0) {
            setError('Years of experience must be a non-negative number.');
            setLoading(false);
            return;
        }

        // Skills parse
        const skillsArray = skillsText
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        const payload = {
            name: name.trim(),
            email: email.trim(),
            department: department.trim(),
            skills: skillsArray,
            performanceScore: scoreNum,
            experience: expNum
        };

        try {
            if (isEditMode) {
                await axios.put(`/api/employees/${employee._id}`, payload);
            } else {
                await axios.post('/api/employees', payload);
            }
            setLoading(false);
            onSuccess();
            onClose();
        } catch (error) {
            setLoading(false);
            setError(error.response?.data?.message || 'An error occurred while saving employee details.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto animate-zoom-in">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                >
                    <X className="h-5 w-5" />
                </button>

                <h3 className="text-2xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-1">
                    {isEditMode ? 'Modify Employee Metrics' : 'Register New Employee'}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                    {isEditMode ? 'Update skills and performance metrics for the employee.' : 'Add a new member to the system database.'}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-2xl flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Employee Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <User className="h-4.5 w-4.5" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                                    placeholder="Aman Verma"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Corporate Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Mail className="h-4.5 w-4.5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                                    placeholder="aman@gmail.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Department / Domain
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Briefcase className="h-4.5 w-4.5" />
                                </div>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm appearance-none cursor-pointer"
                                >
                                    <option value="Development" className="bg-[#151c2c]">Development</option>
                                    <option value="Design" className="bg-[#151c2c]">Design</option>
                                    <option value="Management" className="bg-[#151c2c]">Management</option>
                                    <option value="Marketing" className="bg-[#151c2c]">Marketing</option>
                                    <option value="QA / Testing" className="bg-[#151c2c]">QA / Testing</option>
                                    <option value="HR / Admin" className="bg-[#151c2c]">HR / Admin</option>
                                </select>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Years of Experience
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <Calendar className="h-4.5 w-4.5" />
                                </div>
                                <input
                                    type="number"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    min="0"
                                    step="0.5"
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm"
                                    placeholder="3"
                                    required
                                />
                            </div>
                        </div>

                        {/* Performance Score */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                    Performance Score (0 - 100)
                                </label>
                                <span className="text-sm font-extrabold text-blue-400">{performanceScore || 0} / 100</span>
                            </div>
                            <div className="relative flex items-center gap-4">
                                <Award className="h-5 w-5 text-slate-500 shrink-0" />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={performanceScore}
                                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Skills (Comma Separated)
                            </label>
                            <div className="relative">
                                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none text-slate-500">
                                    <Layers className="h-4.5 w-4.5" />
                                </div>
                                <textarea
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm min-h-[90px]"
                                    placeholder="React, Node.js, MongoDB, Express, TypeScript"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 border-t border-white/5 pt-6 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-semibold rounded-xl text-sm transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Save className="h-4.5 w-4.5" />
                            {loading ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeForm;
