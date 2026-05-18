import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
    Brain, ArrowLeft, Award, Sparkles, AlertTriangle, BookOpen, 
    MessageSquare, CheckCircle, TrendingUp, Trophy, ListOrdered, ShieldAlert
} from 'lucide-react';

const AIRecommendation = () => {
    const { token } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resultData, setResultData] = useState(null);
    const [isBulkAnalysis, setIsBulkAnalysis] = useState(false);

    const employeeId = location.state?.employeeId;
    const employeeIds = location.state?.employeeIds;

    const generateRecommendations = async () => {
        setLoading(true);
        setError('');
        try {
            let payload = {};
            if (employeeId) {
                payload = { employeeId };
                setIsBulkAnalysis(false);
            } else if (employeeIds && employeeIds.length > 0) {
                payload = { employeeIds };
                setIsBulkAnalysis(true);
            } else {
                setError('No employees selected for analysis. Please return to the corporate dashboard and select records.');
                setLoading(false);
                return;
            }

            const { data } = await axios.post('/api/ai/recommend', payload);
            setResultData(data);
        } catch (error) {
            console.error('AI Recommend Error:', error);
            setError(error.response?.data?.message || 'Failed to interface with OpenRouter AI services. Please verify API key.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateRecommendations();
    }, [employeeId, employeeIds]);

    const getSuitabilityColor = (score) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    };

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-12 text-center animate-fade-in">
                <div className="glass-panel p-8 rounded-3xl border border-white/5 shadow-xl flex flex-col items-center">
                    <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 mb-4">
                        <AlertTriangle className="h-10 w-10 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">Analysis Interrupted</h3>
                    <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm font-semibold">{error}</p>
                    <Link
                        to="/employees"
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 pb-20 animate-fade-in">
            {/* Header Back Button */}
            <div className="mb-8">
                <Link
                    to="/employees"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            {loading ? (
                /* Glowing futuristic loader */
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-[30px] animate-pulse"></div>
                        <div className="relative bg-gradient-to-tr from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-2xl border border-blue-400/20 animate-bounce">
                            <Brain className="h-14 w-14 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Synthesizing AI Insights...
                    </h2>
                    <p className="text-slate-400 text-sm font-semibold max-w-sm mt-2">
                        Querying OpenRouter LLM engines to generate performance analysis, promotion indicators, and training suggestions.
                    </p>
                </div>
            ) : resultData ? (
                <div>
                    {!isBulkAnalysis ? (
                        /* Single Employee Recommendations Display */
                        <div className="space-y-8">
                            
                            {/* Employee Overview Card */}
                            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-lg text-white font-extrabold text-xl flex items-center justify-center shrink-0">
                                            {resultData.employee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <h2 className="text-2xl font-extrabold text-white">{resultData.employee.name}</h2>
                                                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 border border-blue-500/10 text-blue-400 uppercase tracking-widest">
                                                    {resultData.employee.department}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-semibold mt-0.5">{resultData.employee.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-slate-800 pr-6 pl-4 md:pl-0">
                                            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Performance Score</span>
                                            <span className="block text-2xl font-black text-slate-100 mt-0.5">{resultData.employee.performanceScore}%</span>
                                        </div>
                                        <div className="text-left md:text-right pl-4">
                                            <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Years of Experience</span>
                                            <span className="block text-2xl font-black text-slate-100 mt-0.5">{resultData.employee.experience} Years</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-white/5 mt-6 pt-5 flex flex-wrap gap-2">
                                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider self-center mr-2">Registered Skills:</span>
                                    {resultData.employee.skills.map((skill, index) => (
                                        <span key={index} className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-800 text-slate-300 border border-white/5">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Core recommendations details */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* Left column: Promotion & Suitability Score */}
                                <div className="lg:col-span-4 space-y-8">
                                    
                                    {/* Suitability Score Gauge */}
                                    <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl text-center flex flex-col items-center">
                                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-6">Suitability Index</h3>
                                        
                                        <div className="relative flex items-center justify-center mb-4">
                                            {/* Glow overlay */}
                                            <div className="absolute inset-0 rounded-full blur-[20px] bg-indigo-500/10 pointer-events-none"></div>
                                            
                                            {/* Custom circular progress */}
                                            <div className="h-36 w-36 rounded-full border-8 border-slate-800 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="block text-4xl font-black text-white">{resultData.analysis.suitabilityScore || 0}</span>
                                                    <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-0.5">Rating</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <span className={`inline-block px-3.5 py-1.5 rounded-2xl text-xs font-bold border mt-2 ${getSuitabilityColor(resultData.analysis.suitabilityScore)}`}>
                                            {resultData.analysis.suitabilityScore >= 80 ? 'Exceptional Fit' : resultData.analysis.suitabilityScore >= 50 ? 'Strong Candidate' : 'Development Required'}
                                        </span>
                                    </div>

                                    {/* Promotion Recommendation Block */}
                                    <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-400">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Promotion Verdict</h3>
                                        </div>
                                        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
                                            <p className="text-sm font-bold text-slate-100 leading-relaxed">
                                                {resultData.analysis.promotionRecommendation}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right column: AI Feedback & Training suggestions */}
                                <div className="lg:col-span-8 space-y-8">
                                    
                                    {/* AI Feedback Generation */}
                                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">AI Feedback Evaluation</h3>
                                        </div>
                                        
                                        <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed p-5 bg-slate-900/40 border border-white/5 rounded-2xl whitespace-pre-line">
                                            {resultData.analysis.feedback}
                                        </p>
                                    </div>

                                    {/* Training suggestions */}
                                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                                                <BookOpen className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">Targeted Training Curriculums</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {resultData.analysis.trainingSuggestions && resultData.analysis.trainingSuggestions.map((item, index) => (
                                                <div key={index} className="flex gap-3.5 p-4 bg-slate-900/40 border border-white/5 rounded-2xl items-start">
                                                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <span className="text-slate-300 text-sm font-bold leading-relaxed">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Multiple Employees Ranking Analysis Display */
                        <div className="space-y-8 animate-fade-in">
                            <div className="text-center max-w-xl mx-auto mb-8">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 mb-4 text-xs font-black uppercase tracking-widest">
                                    <Trophy className="h-3.5 w-3.5" /> Leaderboard Synthesis
                                </div>
                                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                    Performance Analytics Rankings
                                </h2>
                                <p className="text-slate-400 mt-2 text-sm font-semibold">
                                    AI-powered rankings, side-by-side performance breakdown, and promotional comparison.
                                </p>
                            </div>

                            {/* Rankings Podium (Top 3) */}
                            {resultData.rankings && resultData.rankings.length >= 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-end pt-8 pb-4">
                                    {/* 2nd place */}
                                    {resultData.rankings.find(r => r.rank === 2) && (
                                        <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-lg text-center flex flex-col items-center order-2 md:order-1 min-h-[220px]">
                                            <div className="h-10 w-10 rounded-full bg-slate-400/10 text-slate-300 font-extrabold flex items-center justify-center text-lg border border-slate-500/20 mb-3 shadow-md">
                                                2
                                            </div>
                                            <h4 className="font-extrabold text-slate-100 text-lg leading-tight">
                                                {resultData.rankings.find(r => r.rank === 2).name}
                                            </h4>
                                            <span className="inline-block mt-2 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                Rank 2
                                            </span>
                                            <p className="text-[11px] text-slate-400 font-medium mt-3 leading-relaxed">
                                                {resultData.rankings.find(r => r.rank === 2).promotionRecommendation}
                                            </p>
                                        </div>
                                    )}

                                    {/* 1st place */}
                                    {resultData.rankings.find(r => r.rank === 1) && (
                                        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 shadow-2xl text-center flex flex-col items-center order-1 md:order-2 bg-gradient-to-b from-indigo-500/[0.04] to-transparent relative min-h-[260px]">
                                            <div className="absolute -top-5 bg-gradient-to-r from-amber-500 to-amber-600 p-2.5 rounded-full shadow-lg shadow-amber-500/20 text-white animate-pulse">
                                                <Trophy className="h-5 w-5" />
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-400 font-black flex items-center justify-center text-xl border border-amber-500/20 mb-3 mt-2 shadow-md">
                                                1
                                            </div>
                                            <h4 className="font-black text-slate-100 text-xl leading-tight">
                                                {resultData.rankings.find(r => r.rank === 1).name}
                                            </h4>
                                            <span className="inline-block mt-2 text-[10px] uppercase font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full tracking-widest border border-amber-500/20 animate-pulse">
                                                Top Performer
                                            </span>
                                            <p className="text-[11px] text-slate-300 font-bold mt-4 leading-relaxed">
                                                {resultData.rankings.find(r => r.rank === 1).promotionRecommendation}
                                            </p>
                                        </div>
                                    )}

                                    {/* 3rd place */}
                                    {resultData.rankings.find(r => r.rank === 3) && (
                                        <div className="glass-panel p-6 rounded-3xl border border-white/5 shadow-lg text-center flex flex-col items-center order-3 min-h-[200px]">
                                            <div className="h-10 w-10 rounded-full bg-amber-700/10 text-amber-600 font-extrabold flex items-center justify-center text-lg border border-amber-700/20 mb-3 shadow-md">
                                                3
                                            </div>
                                            <h4 className="font-extrabold text-slate-100 text-lg leading-tight">
                                                {resultData.rankings.find(r => r.rank === 3).name}
                                            </h4>
                                            <span className="inline-block mt-2 text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                Rank 3
                                            </span>
                                            <p className="text-[11px] text-slate-400 font-medium mt-3 leading-relaxed">
                                                {resultData.rankings.find(r => r.rank === 3).promotionRecommendation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Detailed Rank Cards */}
                            <div className="space-y-6 max-w-5xl mx-auto">
                                <h3 className="text-lg font-extrabold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                    <ListOrdered className="h-5 w-5 text-indigo-500" /> Rank Breakdown & AI Feedback
                                </h3>

                                {resultData.rankings && resultData.rankings.sort((a,b) => a.rank - b.rank).map((item) => (
                                    <div key={item.employeeId} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl hover:border-indigo-500/20 transition-all flex flex-col md:flex-row gap-6 items-start">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 font-black text-2xl text-indigo-400 flex items-center justify-center shrink-0 shadow-lg">
                                            #{item.rank}
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h4 className="text-xl font-extrabold text-slate-100 leading-tight">{item.name}</h4>
                                                <span className="inline-block text-xs font-bold text-slate-500 mt-1">ID Ref: {item.employeeId}</span>
                                            </div>

                                            {/* Rank Reasoning */}
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Ranking Evaluation</span>
                                                <p className="text-slate-300 font-medium text-sm leading-relaxed whitespace-pre-line p-4 bg-slate-900/30 border border-white/5 rounded-xl">
                                                    {item.reasoning}
                                                </p>
                                            </div>

                                            {/* Side by side stats block */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                
                                                {/* Promotion Status */}
                                                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl">
                                                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest block mb-1">Promotion Status</span>
                                                    <span className="text-slate-200 text-sm font-bold block">{item.promotionRecommendation}</span>
                                                </div>

                                                {/* Feedback summary */}
                                                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl">
                                                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-1">AI Feedback Summary</span>
                                                    <span className="text-slate-200 text-sm font-bold block">{item.feedback}</span>
                                                </div>

                                                {/* Training Recommendations */}
                                                <div className="p-4 bg-slate-900/60 border border-white/5 rounded-xl md:col-span-2">
                                                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">Required Training Courses</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.trainingSuggestions && item.trainingSuggestions.map((course, idx) => (
                                                            <span key={idx} className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                                                {course}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default AIRecommendation;
