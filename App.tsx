import React, { useState, useEffect, useContext, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, MapPin, Bell, User as UserIcon, Shield, Activity, 
  Calendar, Phone, LogOut, CheckCircle, XCircle, Menu, Globe,
  AlertTriangle, Droplet, Search, Clock, ThumbsUp, ThumbsDown,
  Navigation, Zap, Settings, FileText, Home
} from 'lucide-react';
import { User, BloodRequest, Role, Notification, BloodGroup } from './types';
import { MOCK_USERS, MOCK_REQUESTS, DICTIONARY, BLOOD_GROUPS, MAX_LIFETIME_DONATIONS } from './constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Utility Functions ---

// Haversine formula to calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(1));
};

// --- Global Context ---
interface AppContextType {
  user: User | null;
  register: (userData: Partial<User>) => void;
  login: (email: string, role: Role) => void;
  logout: () => void;
  requests: BloodRequest[];
  createRequest: (req: Omit<BloodRequest, 'id' | 'createdAt' | 'status' | 'acceptedBy'>) => void;
  acceptRequest: (reqId: string) => void;
  confirmDonation: (reqId: string, donorId: string) => void;
  reportNoShow: (reqId: string, donorId: string) => void;
  toggleAvailability: () => void;
  language: 'en' | 'te';
  setLanguage: (lang: 'en' | 'te') => void;
  notifications: Notification[];
  t: (key: string) => string;
  getDonorDetails: (id: string) => User | undefined;
  allUsers: User[];
}

const AppContext = createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Components ---

const Navbar = () => {
  const { user, logout, language, setLanguage, t, notifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Brand Logo - Top Left */}
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
               <div className="absolute inset-0 bg-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
               <div className="bg-gradient-to-tr from-red-600 to-rose-500 p-2.5 rounded-2xl group-hover:scale-105 transition-transform duration-300 shadow-xl relative z-10">
                 <Zap className="h-7 w-7 text-white" fill="white" />
               </div>
            </div>
            <div className="ml-3 flex flex-col">
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 tracking-tight font-heading">
                LifeLink
              </span>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest -mt-1 ml-0.5">Rapid Response</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Language Toggle - Desktop */}
            <button 
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="hidden md:flex px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-all items-center border border-gray-200"
            >
              <Globe className="h-3.5 w-3.5 mr-2 text-gray-500" />
              {language === 'en' ? 'ENGLISH' : 'TELUGU'}
            </button>

            {user && (
              <>
                <div className="relative">
                  <button className="p-3 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-all relative group">
                    <Bell className="h-6 w-6 group-hover:animate-swing" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-red-500 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Hamburger Menu - Top Right */}
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all border border-transparent hover:border-gray-200"
                  >
                    <Menu className="h-6 w-6" />
                  </button>

                  {/* Dropdown Menu Card */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right animate-fade-in-up z-50">
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                         <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                         <p className="text-xs text-gray-500 font-medium">{user.role}</p>
                      </div>
                      <div className="py-2">
                        <button onClick={() => {navigate('/'); setIsMenuOpen(false)}} className="w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                          <Home className="w-4 h-4 mr-3 text-gray-400" /> Dashboard
                        </button>
                        <button className="w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                          <UserIcon className="w-4 h-4 mr-3 text-gray-400" /> My Profile
                        </button>
                        <button className="w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                          <FileText className="w-4 h-4 mr-3 text-gray-400" /> History
                        </button>
                        <button className="w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                          <Settings className="w-4 h-4 mr-3 text-gray-400" /> Settings
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button 
                          onClick={logout} 
                          className="w-full text-left px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-3" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Overlay to close menu */}
      {isMenuOpen && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsMenuOpen(false)}></div>}
    </nav>
  );
};

// --- Pages ---

const AuthPage = () => {
  const { login, register } = useAppContext();
  const [activeTab, setActiveTab] = useState<Role>('DONOR');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    area: '',
    bloodGroup: 'O+' as BloodGroup,
    password: ''
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    // 10 Digit Phone Validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (isRegistering) {
      // Create new user logic
      if (!formData.name || !formData.area) {
        alert("Please fill in all details");
        return;
      }
      
      const lat = 17.3850 + (Math.random() - 0.5) * 0.1; // Random lat nearby
      const lng = 78.4867 + (Math.random() - 0.5) * 0.1; // Random lng nearby

      const newUser: Partial<User> = {
        name: formData.name,
        role: activeTab,
        email: formData.email || `${formData.phone}@lifelink.com`,
        phone: formData.phone,
        bloodGroup: (activeTab === 'DONOR' || activeTab === 'PATIENT') ? formData.bloodGroup : undefined,
        location: {
          lat: lat,
          lng: lng,
          address: formData.area
        },
        trustScore: 100, // Starting score
        donationCount: 0,
        badges: ['New Member']
      };
      
      register(newUser);
    } else {
      // Login Logic (Simulation)
      // For demo, if 10 digits are entered, allow login
      const mockUser = MOCK_USERS.find(u => u.role === activeTab);
      if (mockUser) {
        login(mockUser.email, activeTab);
      } else {
         // Create a temporary session user if not in mock list
         login('demo@user.com', activeTab);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200 rounded-full blur-[120px] opacity-30 animate-float"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px] opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-5xl rounded-3xl shadow-2xl border border-white flex overflow-hidden relative z-10 animate-fade-in-up">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 p-12 flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461168409-7d884764d2b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
           
           <div className="relative z-10">
             <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-500 p-2 rounded-lg">
                  <Heart className="w-6 h-6 text-white" fill="white"/>
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">LifeLink</span>
             </div>
             <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
               Be the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Hero</span><br/>
               Someone Needs.
             </h1>
             <p className="text-gray-400 text-lg">
               Join the fastest growing real-time blood donation network. Connect instantly, save lives effortlessly.
             </p>
           </div>

           <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                 <div className="bg-green-500/20 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-green-400" />
                 </div>
                 <div>
                    <p className="text-white font-bold">Verified Donors</p>
                    <p className="text-gray-400 text-sm">Trust-based scoring system</p>
                 </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                 <div className="bg-blue-500/20 p-2 rounded-full">
                    <Zap className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                    <p className="text-white font-bold">Real-time Matching</p>
                    <p className="text-gray-400 text-sm">Location-based instant alerts</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegistering ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500">
                {isRegistering ? 'Enter your details to join the network' : 'Enter your credentials to access account'}
              </p>
            </div>

            <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
              {(['DONOR', 'PATIENT', 'HOSPITAL', 'ADMIN'] as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                    activeTab === role 
                      ? 'bg-white text-gray-900 shadow-md' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {isRegistering && (
                <div className="animate-fade-in-down">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="pl-10 w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>
              )}

              {isRegistering && (activeTab === 'DONOR' || activeTab === 'PATIENT') && (
                <div className="flex gap-4 animate-fade-in-down">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={e => setFormData({...formData, bloodGroup: e.target.value as BloodGroup})}
                      className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 font-medium"
                    >
                      {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="w-1/2">
                     <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Area / City</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        <input
                          required
                          type="text"
                          placeholder="Jubilee Hills"
                          value={formData.area}
                          onChange={e => setFormData({...formData, area: e.target.value})}
                          className="pl-10 w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all font-medium"
                        />
                     </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})} // Only digits
                    className="pl-10 w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all font-medium"
                  />
                </div>
              </div>

              {!isRegistering && (
                <div>
                   <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">OTP</label>
                   <input
                     type="password"
                     placeholder="••••"
                     className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 transition-all text-center tracking-widest font-bold text-lg"
                   />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 shadow-lg transform transition-all active:scale-95 hover:shadow-xl"
              >
                {isRegistering ? 'Complete Registration' : 'Secure Login'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                {isRegistering ? 'Already have an account?' : 'New to LifeLink?'}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 font-bold text-red-600 hover:text-red-700 underline decoration-2 underline-offset-4"
                >
                  {isRegistering ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonorDashboard = () => {
  const { user, toggleAvailability, requests, acceptRequest, t } = useAppContext();
  
  // Logic: 90 day cooldown AND max lifetime donation limit
  const getRestrictionStatus = () => {
    if ((user?.donationCount || 0) >= MAX_LIFETIME_DONATIONS) {
      return { restricted: true, reason: 'MAX_LIMIT', message: 'You have reached the lifetime donation limit. Thank you for being a hero!' };
    }
    
    if (user?.lastDonationDate) {
      const last = new Date(user.lastDonationDate);
      const diff = Date.now() - last.getTime();
      const days = diff / (1000 * 3600 * 24);
      if (days < 90) {
        const daysLeft = Math.ceil(90 - days);
        return { restricted: true, reason: 'COOLDOWN', message: `Recovery Period Active. You can donate again in ${daysLeft} days.` };
      }
    }
    return { restricted: false, reason: null, message: '' };
  };

  const restriction = getRestrictionStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in-up">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`p-4 rounded-2xl ${!restriction.restricted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                <Activity className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('available')}</p>
                <div className="mt-2">
                  <button 
                    onClick={toggleAvailability}
                    disabled={restriction.restricted}
                    className={`relative inline-flex h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${user?.isAvailable ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-7 w-7 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user?.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
             <span className={`text-sm font-bold flex items-center ${user?.isAvailable ? 'text-emerald-600' : 'text-gray-400'}`}>
                {user?.isAvailable ? <CheckCircle className="w-4 h-4 mr-2"/> : <XCircle className="w-4 h-4 mr-2"/>}
                {user?.isAvailable ? 'You are visible to patients' : 'You are currently hidden'}
             </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-6 shadow-xl text-white hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-indigo-100 font-bold uppercase tracking-wide text-xs">{t('trust_score')}</p>
              <p className="text-5xl font-black mt-2 tracking-tight">{user?.trustScore}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          {user?.badges?.includes('Verified Hero') && (
            <div className="mt-6 inline-flex items-center bg-yellow-400/20 border border-yellow-400/50 rounded-xl px-3 py-1.5">
              <Shield className="w-4 h-4 text-yellow-300 mr-2" fill="currentColor" />
              <span className="text-xs font-bold text-yellow-100 tracking-wide uppercase">Verified Hero</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-6 shadow-xl text-white hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
           <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
           <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-red-100 font-bold uppercase tracking-wide text-xs">{t('lives_saved')}</p>
              <p className="text-5xl font-black mt-2 tracking-tight">{(user?.donationCount || 0) * 3}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm animate-pulse-fast shadow-inner">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          <div className="mt-6 w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${((user?.donationCount || 0) / MAX_LIFETIME_DONATIONS) * 100}%` }}></div>
          </div>
          <p className="text-xs text-red-100 mt-2 text-right font-medium">Goal: {user?.donationCount} / {MAX_LIFETIME_DONATIONS} donations</p>
        </div>
      </div>

      {restriction.restricted && (
        <div className={`rounded-2xl p-6 border-l-4 ${restriction.reason === 'MAX_LIMIT' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'} shadow-sm animate-fade-in-up`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-6 w-6 ${restriction.reason === 'MAX_LIMIT' ? 'text-red-500' : 'text-amber-500'}`} />
            </div>
            <div className="ml-4">
              <h3 className={`text-lg font-bold ${restriction.reason === 'MAX_LIMIT' ? 'text-red-800' : 'text-amber-800'}`}>
                {restriction.reason === 'MAX_LIMIT' ? 'Lifetime Limit Reached' : 'Safety Cooldown Active'}
              </h3>
              <div className={`mt-1 text-sm ${restriction.reason === 'MAX_LIMIT' ? 'text-red-700' : 'text-amber-700'}`}>
                <p>{restriction.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Requests */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
          <span className="bg-red-100 p-2 rounded-xl mr-3">
             <AlertTriangle className="w-6 h-6 text-red-600" />
          </span>
          {t('emergency_alert')}
        </h3>
        <div className="space-y-4">
          {requests.filter(r => r.status === 'PENDING').map((req) => (
            <div key={req.id} className={`bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-300 group ${req.isPreBooking ? 'bg-blue-50/30' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform ${req.isPreBooking ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                    <span className="text-xl font-black">{req.bloodGroup}</span>
                  </div>
                  <div className="ml-5">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{req.units} Units Needed</h4>
                      {req.isPreBooking ? (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center">
                          <Calendar className="w-3 h-3 mr-1"/> Scheduled
                        </span>
                      ) : (
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center uppercase tracking-wide ${
                          req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 
                          req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {t(req.urgency.toLowerCase())}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {req.location.address} <span className="mx-2 text-gray-300">|</span> <span className="text-red-500 font-bold">2.3 km away</span>
                      </p>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <Activity className="w-4 h-4 mr-2 text-gray-400" />
                        {req.hospitalName || 'Individual Request'}
                      </p>
                      {req.isPreBooking && (
                        <p className="flex items-center text-sm text-blue-600 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded-md">
                          <Clock className="w-4 h-4 mr-1.5" />
                          Required: {new Date(req.requiredDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 sm:mt-0 flex flex-col items-end justify-center pl-0 sm:pl-4">
                  <button 
                    onClick={() => acceptRequest(req.id)}
                    disabled={restriction.restricted}
                    className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-wide ${
                      !restriction.restricted 
                      ? 'bg-gray-900 text-white hover:bg-black shadow-gray-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {!restriction.restricted ? 'Accept & Donate' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {requests.filter(r => r.status === 'PENDING').length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
               <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <Heart className="h-10 w-10 text-green-500" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
               <p className="text-gray-500">No active emergency requests in your area.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateRequestForm = ({ isHospital }: { isHospital: boolean }) => {
  const { createRequest, t } = useAppContext();
  const [formData, setFormData] = useState({
    bloodGroup: 'O+' as const,
    units: 1,
    urgency: 'NORMAL' as const,
    isPreBooking: false,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest({
      requesterId: 'h1', // mocking
      requesterName: isHospital ? 'Apollo Hospital' : 'Current User',
      hospitalName: isHospital ? 'Apollo Hospital' : undefined,
      bloodGroup: formData.bloodGroup,
      units: formData.units,
      urgency: formData.urgency,
      isPreBooking: formData.isPreBooking,
      requiredDate: new Date(formData.date).toISOString(),
      location: { lat: 17, lng: 78, address: 'Current Location' }
    });
    // Simulated SMS Broadcast
    alert('Request Broadcasted! SMS sent to 5 nearby donors matching blood group.');
  };

  return (
    <div className="bg-white shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 overflow-hidden mb-10 transition-all hover:shadow-2xl">
      <div className="px-8 py-5 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Droplet className="w-5 h-5 text-red-400 mr-2" fill="currentColor"/>
          {t('request_blood')}
        </h3>
        <span className="text-[10px] font-bold text-gray-900 bg-white px-3 py-1 rounded-full uppercase tracking-widest">New Request</span>
      </div>
      <div className="p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-8 gap-x-8 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Blood Group</label>
            <div className="relative">
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({...formData, bloodGroup: e.target.value as any})}
                className="block w-full py-3 px-4 border border-gray-200 bg-gray-50 text-gray-900 font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors appearance-none"
              >
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Units</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.units}
              onChange={e => setFormData({...formData, units: parseInt(e.target.value)})}
              className="block w-full py-3 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 font-bold shadow-sm focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Urgency</label>
            <div className="relative">
              <select
                value={formData.urgency}
                onChange={e => setFormData({...formData, urgency: e.target.value as any})}
                className="block w-full py-3 px-4 border border-gray-200 bg-gray-50 text-gray-900 font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors appearance-none"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
               <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
             <div className="flex items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setFormData({...formData, isPreBooking: !formData.isPreBooking})}>
              <div className="flex items-center h-5">
                <input
                  id="prebooking"
                  type="checkbox"
                  checked={formData.isPreBooking}
                  onChange={e => setFormData({...formData, isPreBooking: e.target.checked})}
                  className="focus:ring-red-500 h-5 w-5 text-red-600 border-gray-300 rounded cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="prebooking" className="font-bold text-gray-800 cursor-pointer">{t('pre_booking')}</label>
                <p className="text-gray-500 text-xs mt-0.5">Is this for a scheduled surgery?</p>
              </div>
            </div>
          </div>

          {formData.isPreBooking && (
             <div className="sm:col-span-6 animate-fade-in-up">
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Required Date</label>
                 <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="block w-full py-3 px-4 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 font-bold shadow-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
                 />
             </div>
          )}

          <div className="sm:col-span-6 pt-2">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-4 px-6 border border-transparent shadow-lg shadow-red-500/30 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Broadcast Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HospitalDashboard = () => {
  const { requests, getDonorDetails, confirmDonation, reportNoShow } = useAppContext();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <CreateRequestForm isHospital={true} />
      
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
        <h3 className="text-2xl font-black text-gray-900">Live Request Status</h3>
      </div>
      
      <div className="space-y-4">
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white mr-4 shadow-md ${
                      req.status === 'FULFILLED' ? 'bg-green-500' : 'bg-red-500'
                   }`}>
                      {req.bloodGroup}
                   </div>
                   <div>
                      <p className="text-base font-bold text-gray-900">
                        {req.units} Units {req.isPreBooking ? '(Pre-booking)' : ''}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Created: {new Date(req.createdAt).toLocaleTimeString()}</p>
                   </div>
                </div>
                <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-lg border ${
                  req.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                  req.status === 'FULFILLED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {req.status}
                </span>
              </div>
              
              {/* Donor Response Section */}
              {req.acceptedBy && req.acceptedBy.length > 0 && req.status !== 'FULFILLED' && (
                <div className="bg-gray-50/80 rounded-2xl p-4 mt-4 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                    <UserIcon className="w-3 h-3 mr-1"/> Responding Donors
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {req.acceptedBy.map(donorId => {
                       const donor = getDonorDetails(donorId);
                       if (!donor) return null;
                       return (
                         <div key={donorId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                            <div className="flex items-center">
                              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {donor.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{donor.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{donor.phone}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => confirmDonation(req.id, donorId)}
                                className="p-2 rounded-lg text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm shadow-green-200"
                                title="Verify Donation"
                              >
                                <CheckCircle className="h-4 w-4"/>
                              </button>
                              <button 
                                onClick={() => reportNoShow(req.id, donorId)}
                                className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Report No-Show"
                              >
                                <ThumbsDown className="h-4 w-4"/>
                              </button>
                            </div>
                         </div>
                       );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">ID: {req.id}</span>
               {req.acceptedBy?.length === 0 && <span className="text-xs text-gray-400 italic font-medium">Waiting for heroes...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MapView = ({ donors }: { donors: User[] }) => {
  const { user } = useAppContext();

  // Filter only available donors
  const activeDonors = donors.filter(d => d.role === 'DONOR' && d.isAvailable);

  return (
    <div className="w-full h-96 rounded-3xl relative overflow-hidden border-4 border-white shadow-2xl bg-[#eef2f6]">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{
             backgroundImage: 'linear-gradient(#64748b 2px, transparent 2px), linear-gradient(90deg, #64748b 2px, transparent 2px)', 
             backgroundSize: '40px 40px'
           }}>
      </div>
      
      {/* Patient Pin (Center) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
        <div className="relative group">
          <div className="absolute -inset-6 bg-blue-500/20 rounded-full animate-pulse"></div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-full shadow-xl border-4 border-white transform transition-transform hover:scale-110 cursor-pointer relative z-10">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="bg-gray-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-xl mt-3 tracking-widest uppercase">
          You
        </div>
      </div>

      {/* Donor Pins - Distributed Randomly relative to center for demo visualization */}
      {activeDonors.map((donor, i) => {
        // Mock positioning logic for demo visualization
        // In a real app, this would use actual lat/lng projection to pixels
        const offsetLat = (donor.location.lat - (user?.location.lat || 17.3850)) * 2000; 
        const offsetLng = (donor.location.lng - (user?.location.lng || 78.4867)) * 2000;
        
        // Clamp for visual boundaries in this mock container
        const top = `calc(50% - ${offsetLat}px)`;
        const left = `calc(50% + ${offsetLng}px)`;

        const distance = user ? calculateDistance(user.location.lat, user.location.lng, donor.location.lat, donor.location.lng) : 0;

        return (
          <div key={donor.id} 
               className="absolute flex flex-col items-center cursor-pointer group z-10 hover:z-30 transition-all duration-300 animate-fade-in-up" 
               style={{ top, left, transitionDelay: `${i*100}ms` }}>
             
             {/* Tooltip on Hover */}
             <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-white rounded-xl shadow-xl p-3 w-40 transition-opacity pointer-events-none z-50">
                <p className="font-bold text-gray-900">{donor.name}</p>
                <p className="text-xs text-gray-500">{donor.location.address}</p>
                <div className="flex items-center mt-1 text-red-500 font-bold text-xs">
                   <Navigation className="w-3 h-3 mr-1" />
                   {distance} km away
                </div>
             </div>

             <div className="relative hover:-translate-y-2 transition-transform duration-300 ease-out">
               <div className="bg-gradient-to-br from-red-500 to-rose-600 p-2 rounded-full shadow-lg border-2 border-white">
                 <Droplet className="h-4 w-4 text-white" fill="white" />
               </div>
               {donor.badges?.includes('Verified Hero') && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 border border-white rounded-full p-0.5" title="Verified Hero">
                      <Shield className="w-2.5 h-2.5 text-yellow-900" fill="currentColor"/>
                  </div>
               )}
               {/* Always visible Distance Badge */}
               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap font-bold">
                 {distance}km
               </div>
             </div>
          </div>
        );
      })}
    </div>
  );
};

const PatientDashboard = () => {
  const { t, allUsers } = useAppContext();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="animate-fade-in-up">
           <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
             <span className="bg-blue-100 p-2 rounded-xl mr-3">
                <Search className="w-6 h-6 text-blue-600" />
             </span>
             {t('find_donors')}
           </h3>
           <MapView donors={allUsers} />
           <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start">
             <Shield className="w-6 h-6 text-blue-600 mr-4 mt-0.5 flex-shrink-0" />
             <div>
                <p className="text-blue-900 font-bold mb-1">Privacy Protected</p>
                <p className="text-sm text-blue-700/80 font-medium leading-relaxed">
                   Donors' exact locations are slightly obfuscated for safety until they accept your request. Distances shown are approximate.
                </p>
             </div>
           </div>
        </div>
        <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <CreateRequestForm isHospital={false} />
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  // Mock Data for Charts
  const data = [
    { name: 'A+', supply: 400, demand: 240 },
    { name: 'B+', supply: 300, demand: 139 },
    { name: 'O+', supply: 200, demand: 980 },
    { name: 'AB-', supply: 278, demand: 39 },
  ];
  const pieData = [
    { name: 'Fulfilled', value: 400 },
    { name: 'Pending', value: 300 },
    { name: 'Expired', value: 50 },
  ];
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-8 border-indigo-600 pl-6">Admin Analytics Console</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.01] transition-transform">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
             <div className="bg-indigo-100 p-2 rounded-lg mr-3">
               <Activity className="w-5 h-5 text-indigo-600"/>
             </div>
             Supply vs Demand
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} tick={{fontFamily: 'Outfit', fontSize: 12, fontWeight: 600}}/>
                <YAxis axisLine={false} tickLine={false} tick={{fontFamily: 'Outfit', fontSize: 12}}/>
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Outfit'}}/>
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontFamily: 'Outfit'}}/>
                <Bar dataKey="supply" fill="#10b981" name="Supply (Units)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="demand" fill="#ef4444" name="Demand (Units)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.01] transition-transform">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
             <div className="bg-blue-100 p-2 rounded-lg mr-3">
               <CheckCircle className="w-5 h-5 text-blue-600"/>
             </div>
             Request Status
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontFamily: 'Outfit'}}/>
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontFamily: 'Outfit', fontWeight: 600}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/50 overflow-hidden sm:rounded-3xl border border-slate-100">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg leading-6 font-bold text-gray-900">Hospital Verification Queue</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          <li className="px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center">
               <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-5 group-hover:scale-110 transition-transform">
                  C
               </div>
               <div>
                  <p className="text-base font-bold text-gray-900">City General Hospital</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">License: LIC-998877</p>
               </div>
            </div>
            <div className="flex space-x-3">
              <button className="p-2.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-all">
                 <CheckCircle className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                 <XCircle className="w-5 h-5" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

// --- Main App Logic ---

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [requests, setRequests] = useState<BloodRequest[]>(MOCK_REQUESTS);
  const [language, setLanguage] = useState<'en' | 'te'>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Update current user if allUsers changes and we are logged in
  useEffect(() => {
    if (user) {
      const updatedMe = allUsers.find(u => u.id === user.id);
      if (updatedMe) setUser(updatedMe);
    }
  }, [allUsers]);

  // Simulate incoming emergency (Real-time effect)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.role === 'DONOR' && user.isAvailable && Math.random() > 0.8) {
        // Add a random emergency
        const newReq: BloodRequest = {
           id: `r-${Date.now()}`,
           requesterId: 'h-auto',
           requesterName: 'Auto Generated Emergency',
           hospitalName: 'General Hospital',
           bloodGroup: user.bloodGroup || 'O+',
           units: 1,
           urgency: 'CRITICAL',
           isPreBooking: false,
           requiredDate: new Date().toISOString(),
           location: { lat: 17, lng: 78, address: 'Nearby Location' },
           status: 'PENDING',
           createdAt: new Date().toISOString(),
           acceptedBy: []
        };
        // Don't duplicate in state for demo simplicity, just notify
        setNotifications(prev => [...prev, {
          id: `n-${Date.now()}`,
          title: 'Emergency Nearby!',
          message: 'Someone needs your blood group nearby.',
          type: 'ALERT',
          timestamp: new Date().toISOString(),
          read: false
        }]);
      }
    }, 12000); 
    return () => clearInterval(interval);
  }, [user]);

  const login = (email: string, role: Role) => {
    const u = allUsers.find(u => u.role === role);
    if (u) {
       setUser(u);
    } else {
       // Mock for unregistered phone/email flow in demo
       const demoUser: User = {
          id: `u-${Date.now()}`,
          name: 'Demo User',
          role: role,
          email: email,
          phone: '9876543210',
          location: { lat: 17.3850, lng: 78.4867, address: 'Demo Location' },
          bloodGroup: 'O+',
          trustScore: 100,
          donationCount: 0,
          badges: [],
          isAvailable: true
       };
       setAllUsers(prev => [...prev, demoUser]);
       setUser(demoUser);
    }
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: userData.name || 'New User',
      role: userData.role as Role,
      email: userData.email || '',
      phone: userData.phone || '',
      location: userData.location || { lat: 0, lng: 0, address: '' },
      bloodGroup: userData.bloodGroup,
      trustScore: 100,
      donationCount: 0,
      badges: ['New Member'],
      isAvailable: true,
      lastDonationDate: undefined
    };
    
    setAllUsers(prev => [...prev, newUser]);
    setUser(newUser);
  };

  const logout = () => setUser(null);

  const getDonorDetails = (id: string) => allUsers.find(u => u.id === id);

  const createRequest = (reqData: Omit<BloodRequest, 'id' | 'createdAt' | 'status' | 'acceptedBy'>) => {
    const newReq: BloodRequest = {
      ...reqData,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      acceptedBy: []
    };
    setRequests(prev => [newReq, ...prev]);
  };

  const acceptRequest = (reqId: string) => {
    let reqAccepted = false;
    
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        // Prevent traffic: If already fulfilled or enough donors (assuming 1 donor needed per unit for simple demo)
        if (r.status === 'FULFILLED' || (r.acceptedBy?.length || 0) >= r.units) {
           return r;
        }

        // Avoid duplicate acceptance
        if (r.acceptedBy?.includes(user!.id)) return r;

        reqAccepted = true;
        
        // Check if this acceptance fills the request
        const newAccepted = [...(r.acceptedBy || []), user?.id || ''];
        
        return { 
           ...r, 
           status: 'ACCEPTED', 
           acceptedBy: newAccepted 
        };
      }
      return r;
    }));

    if (reqAccepted) {
       alert("Thank you! The hospital has been notified. You are a hero!");
       
       // Notify Requester (SMS Simulation)
       // In a real app, this would be a backend push. Here we find the requester logic if they were logged in.
       // For demo, we just add to our notification list which simulates the requester's inbox
       setNotifications(prev => [...prev, {
          id: `n-${Date.now()}`,
          title: 'Donor Found!',
          message: `${user?.name} has accepted your request. Contact: ${user?.phone}`,
          type: 'SUCCESS',
          timestamp: new Date().toISOString(),
          read: false
       }]);
    } else {
       alert("This request has already been fulfilled by other donors.");
    }
  };

  const confirmDonation = (reqId: string, donorId: string) => {
    // 1. Update Request
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'FULFILLED' } : r));

    // 2. Update Donor Stats
    setAllUsers(prevUsers => prevUsers.map(u => {
      if (u.id === donorId) {
        const newCount = (u.donationCount || 0) + 1;
        const newScore = (u.trustScore || 0) + 50; // +50 points for donating
        const newBadges = [...(u.badges || [])];
        if (newScore > 500 && !newBadges.includes('Verified Hero')) {
          newBadges.push('Verified Hero');
        }

        return {
          ...u,
          donationCount: newCount,
          trustScore: newScore,
          badges: newBadges,
          lastDonationDate: new Date().toISOString(),
          isAvailable: false // Enter cooldown automatically
        };
      }
      return u;
    }));
    alert("Donation Verified! Trust score updated.");
  };

  const reportNoShow = (reqId: string, donorId: string) => {
     // 1. Remove donor from accepted list, set back to pending if no other donors
     setRequests(prev => prev.map(r => {
       if (r.id === reqId) {
         const newAccepted = r.acceptedBy?.filter(id => id !== donorId) || [];
         return { ...r, acceptedBy: newAccepted, status: newAccepted.length === 0 ? 'PENDING' : 'ACCEPTED' };
       }
       return r;
     }));

     // 2. Penalize Donor
     setAllUsers(prevUsers => prevUsers.map(u => {
       if (u.id === donorId) {
         return {
           ...u,
           trustScore: Math.max(0, (u.trustScore || 0) - 20) // -20 points penalty
         };
       }
       return u;
     }));
     alert("No-show reported. Trust score deducted.");
  };

  const toggleAvailability = () => {
    if (user) {
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, isAvailable: !u.isAvailable } : u));
    }
  };

  const t = (key: string) => DICTIONARY[key]?.[language] || key;

  return (
    <AppContext.Provider value={{ 
      user, login, register, logout, requests, createRequest, acceptRequest, toggleAvailability, 
      language, setLanguage, notifications, t, getDonorDetails, confirmDonation, reportNoShow, allUsers 
    }}>
      {children}
    </AppContext.Provider>
  );
};

const MainLayout = () => {
  const { user } = useAppContext();
  
  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900">
      <Navbar />
      <main className="pb-12">
        {user.role === 'DONOR' && <DonorDashboard />}
        {user.role === 'HOSPITAL' && <HospitalDashboard />}
        {user.role === 'PATIENT' && <PatientDashboard />}
        {user.role === 'ADMIN' && <AdminDashboard />}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
        </Routes>
      </AppProvider>
    </Router>
  );
};

export default App;