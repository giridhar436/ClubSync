import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User as UserIcon, LayoutGrid, CalendarPlus, BellPlus, Building2, Loader2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { clubs } from '../data/dashboardData';
import { supabase } from '../supabaseClient';

const AdminHeader = () => {
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
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-white/20">
            <UserIcon size={20} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

const GlassCard = ({ title, children, className, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white/20 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30 ${className}`}
  >
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        {Icon && <Icon className="text-[#260046]" />}
        <h3 className="font-playfair text-2xl font-bold text-[#260046] text-center">{title}</h3>
      </div>
      {children}
    </div>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { user, profile } = useAuth();
  const [selectedClub, setSelectedClub] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const adminName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';

  const showFeedback = (message, type) => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-300 via-orange-200 to-pink-200 relative overflow-x-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-marble opacity-50"></div>
      <AdminHeader />
      
      <main className="relative z-20 pt-[100px] pb-16 px-4 sm:px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-playfair text-4xl md:text-5xl font-bold text-[#260046] mb-12 text-center"
              style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
            >
              WELCOME BACK, {adminName.toUpperCase()}
            </motion.h1>
            
            {feedback.message && (
              <div className={`p-4 mb-4 rounded-lg text-center ${feedback.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                {feedback.message}
              </div>
            )}

            <GlassCard title="Content Publisher" icon={Building2}>
              <div>
                <label htmlFor="club-select" className="font-inter text-sm font-medium text-[#260046]/80 mb-2 block">
                  Select club to create content for
                </label>
                <select
                  id="club-select"
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/50 border-2 border-transparent focus:border-violet-soft focus:bg-white focus:outline-none font-inter text-[#260046] transition-all"
                >
                  <option value="" disabled>-- Select a Club --</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedClub && (
                <div className="mt-8 space-y-12 border-t-2 border-white/20 pt-8">
                  <EventForm clubId={selectedClub} showFeedback={showFeedback} />
                  <AnnouncementForm clubId={selectedClub} showFeedback={showFeedback} />
                </div>
              )}
            </GlassCard>
        </div>
      </main>
    </div>
  );
};

const EventForm = ({ clubId, showFeedback }) => {
  const [formData, setFormData] = useState({ title: '', event_date: '', venue: '', description: '', registration_link: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submissionData = { ...formData, club_id: clubId };
    if (!submissionData.registration_link) {
      delete submissionData.registration_link;
    }

    const { error } = await supabase.from('events').insert(submissionData);
    setLoading(false);
    if (error) {
      showFeedback(`Error creating event: ${error.message}`, 'error');
    } else {
      showFeedback('Event published successfully!', 'success');
      setFormData({ title: '', event_date: '', venue: '', description: '', registration_link: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-playfair text-xl font-bold text-[#260046] flex items-center gap-2"><CalendarPlus size={20}/> New Event</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} />
          <FormInput label="Date" name="event_date" type="datetime-local" value={formData.event_date} onChange={handleChange} />
          <FormInput label="Venue" name="venue" value={formData.venue} onChange={handleChange} />
          <FormInput label="Link for Registration (Optional)" name="registration_link" type="url" value={formData.registration_link} onChange={handleChange} required={false} icon={LinkIcon} />
        </div>
        <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <PublishButton loading={loading} />
    </form>
  );
};

const AnnouncementForm = ({ clubId, showFeedback }) => {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('announcements').insert({ ...formData, club_id: clubId });
    setLoading(false);
    if (error) {
      showFeedback(`Error creating announcement: ${error.message}`, 'error');
    } else {
      showFeedback('Announcement published successfully!', 'success');
      setFormData({ title: '', description: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-playfair text-xl font-bold text-[#260046] flex items-center gap-2"><BellPlus size={20}/> New Announcement</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} />
        <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <PublishButton loading={loading} />
    </form>
  );
};

const FormInput = ({ label, icon: Icon, required = true, ...props }) => (
  <div>
    <label className="font-inter text-sm font-medium text-[#260046]/80 mb-1 block">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy/40" />}
      <input 
        {...props}
        className={`w-full px-4 py-2 rounded-lg bg-white/50 border-2 border-transparent focus:border-violet-soft focus:bg-white focus:outline-none font-inter text-[#260046] transition-all ${Icon ? 'pl-9' : ''}`}
        required={required}
      />
    </div>
  </div>
);

const FormTextarea = ({ label, required = true, ...props }) => (
  <div>
    <label className="font-inter text-sm font-medium text-[#260046]/80 mb-1 block">{label}</label>
    <textarea 
      {...props}
      rows="5"
      className="w-full h-full px-4 py-2 rounded-lg bg-white/50 border-2 border-transparent focus:border-violet-soft focus:bg-white focus:outline-none font-inter text-[#260046] transition-all resize-none"
      required={required}
    ></textarea>
  </div>
);

const PublishButton = ({ loading }) => (
  <div className="flex justify-end pt-2">
    <motion.button
      type="submit"
      disabled={loading}
      className="bg-[#260046] text-white font-inter font-semibold px-8 py-2 rounded-lg shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center disabled:opacity-60"
      whileHover={{ scale: loading ? 1 : 1.05 }}
      whileTap={{ scale: loading ? 1 : 0.95 }}
    >
      {loading ? <Loader2 className="animate-spin" /> : 'PUBLISH'}
    </motion.button>
  </div>
);

export default AdminDashboardPage;
