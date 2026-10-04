import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Activity, 
    ShieldCheck, 
    Upload, 
    LayoutDashboard, 
    MessageSquare, 
    LogIn, 
    LogOut, 
    User,
    FolderClock,
    GitCompare,
    Eye,
    EyeOff
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [privacyMask, setPrivacyMask] = useState(() => {
        return localStorage.getItem("privacyMaskEnabled") === "true";
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('userData');
            }
        }

        const handleMaskChange = () => {
            setPrivacyMask(localStorage.getItem("privacyMaskEnabled") === "true");
        };
        window.addEventListener("privacyMaskChanged", handleMaskChange);
        return () => window.removeEventListener("privacyMaskChanged", handleMaskChange);
    }, []);

    const togglePrivacy = () => {
        const next = !privacyMask;
        setPrivacyMask(next);
        localStorage.setItem("privacyMaskEnabled", String(next));
        window.dispatchEvent(new Event("privacyMaskChanged"));
        toast.info(next ? "PII masking enabled on screen" : "PII masking disabled");
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await api.post(endpoint, formData);
            if (res.data.success) {
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('userData', JSON.stringify(res.data.data));
                setUser(res.data.data);
                setShowAuthModal(false);
                toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Authentication failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
        toast.info("Logged out");
        navigate('/upload');
    };

    const navLinkClass = (path) => `
        flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition
        ${location.pathname === path 
            ? 'bg-blue-50 text-blue-600 font-semibold' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
    `;

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">

                    {/* Logo */}
                    <Link to="/upload" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                BloodLens
                            </h1>
                            <p className="text-[11px] font-medium text-blue-600">
                                AI Blood Report Analyzer
                            </p>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link to="/upload" className={navLinkClass('/upload')}>
                            <Upload className="h-4 w-4" />
                            <span className="hidden md:inline">Upload</span>
                        </Link>

                        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard className="h-4 w-4" />
                            <span className="hidden md:inline">Dashboard</span>
                        </Link>

                        <Link to="/history" className={navLinkClass('/history')}>
                            <FolderClock className="h-4 w-4" />
                            <span className="hidden md:inline">Reports</span>
                        </Link>

                        <Link to="/compare" className={navLinkClass('/compare')}>
                            <GitCompare className="h-4 w-4" />
                            <span className="hidden md:inline">Compare</span>
                        </Link>

                        <Link to="/chat" className={navLinkClass('/chat')}>
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden md:inline">AI Chat</span>
                        </Link>
                    </div>

                    {/* Right Toolbar: Privacy Mask + Auth */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* PII Privacy Toggle */}
                        <button
                            onClick={togglePrivacy}
                            className={`p-2 rounded-xl border transition ${
                                privacyMask
                                    ? "bg-amber-50 text-amber-700 border-amber-200 shadow-2xs"
                                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                            title={privacyMask ? "PII Masking is Active" : "Click to Mask Patient PII"}
                        >
                            {privacyMask ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        {user ? (
                            <div className="flex items-center gap-2">
                                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                            >
                                <LogIn className="h-3.5 w-3.5" />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-900">
                                {isLogin ? 'Sign in to BloodLens' : 'Create an Account'}
                            </h3>
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="text-slate-400 hover:text-slate-600 font-semibold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                                        placeholder="Dr. Rahul Sharma"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;