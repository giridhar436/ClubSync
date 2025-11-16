import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User as UserIcon, LayoutGrid, ShieldCheck, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-[70px] bg-[#260046]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex justify-between items-center">
        <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors" aria-label="Go to Dashboard">
          <ArrowLeft size={28} />
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-white flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all" aria-label="Go to Dashboard">
            <LayoutGrid size={20} className="text-white" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-white/20">
            <UserIcon size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

const GlassCard = ({ title, children, className }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white/20 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30 ${className}`}
  >
    <div className="p-8">
      <h3 className="font-playfair text-2xl font-bold text-[#260046] mb-4 text-center">{title}</h3>
      {children}
    </div>
  </motion.div>
);

const ProfilePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email;
  const userRole = profile?.role || 'user';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-300 via-orange-200 to-pink-200 relative overflow-x-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-marble opacity-50"></div>
      <ProfileHeader />
      
      <main className="relative z-20 pt-[120px] pb-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-playfair text-4xl md:text-5xl font-bold text-[#260046] mb-12 text-center"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
            >
              WELCOME BACK, {userName.toUpperCase()}
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left Column */}
              <div className="space-y-8">
                <GlassCard title="Profile">
                  <div className="flex flex-col items-center text-center -mt-4">
                    <div className="w-24 h-24 rounded-full bg-white/30 border-2 border-white flex items-center justify-center mb-4">
                      <UserIcon size={48} className="text-[#260046]" />
                    </div>
                    <h4 className="font-inter text-xl font-semibold text-[#260046]">{userName}</h4>
                    <p className="font-inter text-base text-[#260046]/80 mb-6">{userEmail}</p>
                    
                    <div className="flex items-center gap-4 bg-white/30 rounded-xl p-3 border border-white/40">
                      <div className="p-2 bg-white/50 rounded-lg">
                        {userRole === 'admin' ? <ShieldCheck className="text-green-700" /> : <UserIcon className="text-[#260046]" />}
                      </div>
                      <div>
                        <p className="font-inter text-xs text-[#260046]/70 text-left">ROLE</p>
                        <p className="font-inter font-bold text-md text-[#260046] capitalize">{userRole}</p>
                      </div>
                    </div>

                    {userRole === 'admin' && (
                      <motion.button
                        onClick={() => navigate('/admin-dashboard')}
                        className="mt-6 w-full bg-[#260046] hover:bg-opacity-90 text-white font-inter font-semibold py-3 rounded-xl shadow-lg transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Go to Admin Dashboard
                      </motion.button>
                    )}
                  </div>
                </GlassCard>
                <GlassCard title="Registered Clubs" className="min-h-[190px]" />
              </div>

              {/* Right Column */}
              <div className="relative">
                <GlassCard title="Events Participated" className="min-h-[412px]" />
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
