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
        relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
        ${location.pathname === path 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
    `;

    return (
        <>
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all duration-200 shadow-2xs">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">

                    {/* Logo */}
                    <Link to="/upload" className="group flex items-center gap-3">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 p-0.5 shadow-md shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
                            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950/20 backdrop-blur-xs">
                                <Activity className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-lg font-black tracking-tight text-slate-900">
                                    BloodLens
                                </h1>
                                <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                                    AI
                                </span>
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
                                Clinical Report Intelligence
                            </p>
                        </div>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1 rounded-2xl bg-slate-100/70 p-1 border border-slate-200/60 backdrop-blur-sm">
                        <Link to="/upload" className={navLinkClass('/upload')}>
                            <Upload className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Upload</span>
                        </Link>

                        <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Dashboard</span>
                        </Link>

                        <Link to="/history" className={navLinkClass('/history')}>
                            <FolderClock className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Reports Vault</span>
                        </Link>

                        <Link to="/compare" className={navLinkClass('/compare')}>
                            <GitCompare className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">Compare</span>
                        </Link>

                        <Link to="/chat" className={navLinkClass('/chat')}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span className="hidden md:inline">AI Health Guide</span>
                        </Link>
                    </div>

                    {/* Right Toolbar: Privacy Mask + Auth */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* PII Privacy Toggle */}
                        <button
                            onClick={togglePrivacy}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                                privacyMask
                                    ? "bg-amber-50 text-amber-700 border-amber-300/80 shadow-xs"
                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                            title={privacyMask ? "PII Masking is Active" : "Click to Mask Patient PII on Screen"}
                        >
                            {privacyMask ? (
                                <>
                                    <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                                    <span className="hidden lg:inline">PII Masked</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="hidden lg:inline text-slate-500">Privacy</span>
                                </>
                            )}
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