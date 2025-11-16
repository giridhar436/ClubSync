import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, CalendarDays, LayoutGrid, User, ArrowLeft, Bell, Loader2 } from 'lucide-react';
import { clubs } from '../data/dashboardData';
import { supabase } from '../supabaseClient';

const DashboardHeader = ({ onMenuToggle, isMobileMenuOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 p-4">
      <div className="flex justify-between items-center max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="text-white p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors" aria-label="Go to Landing Page">
            <ArrowLeft size={24} />
          </button>
          <button onClick={onMenuToggle} className="text-white p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors lg:hidden" aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm p-2 rounded-full">
          <button className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"><CalendarDays size={20} /></button>
          <button className="p-2 text-white bg-white/20 rounded-full transition-colors"><LayoutGrid size={20} /></button>
          <button onClick={() => navigate('/profile')} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

const ClubsPanel = ({ selectedClub, onSelectClub, isOpen, onClose }) => {
  const handleClubClick = (clubId) => {
    onSelectClub(clubId);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-40 lg:relative lg:inset-auto lg:z-auto lg:block lg:w-[320px] lg:flex-shrink-0"
        >
          <div className="bg-dash-purple h-full rounded-none lg:rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col">
            <h2 className="font-playfair text-4xl font-bold text-white mb-8">CLUBS</h2>
            <nav className="space-y-3">
              {clubs.map((club) => {
                const Icon = club.Icon;
                return (
                  <motion.button
                    key={club.id}
                    onClick={() => handleClubClick(club.id)}
                    className={`w-full text-left p-3 rounded-xl border border-white/20 transition-all duration-300 flex items-center gap-4 ${selectedClub === club.id ? 'bg-dash-purple-light shadow-inner' : 'hover:bg-white/10'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-white/80" />}
                    </div>
                    <span className="font-inter font-medium text-white">{club.name}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EventsPanel = ({ club, events, loading }) => (
  <div className="flex-grow p-6 lg:p-8">
    <h2 className="font-playfair text-4xl font-bold text-white mb-8">EVENTS</h2>
    <AnimatePresence mode="wait">
      <motion.div
        key={club.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg"
            >
              <h3 className="font-playfair text-xl font-bold text-black mb-2">{event.title}</h3>
              <p className="font-inter text-gray-700 mb-4">{event.description}</p>
              <div className="font-inter text-sm text-gray-600 space-y-1">
                <p><strong>Date:</strong> {new Date(event.event_date).toLocaleString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
              </div>
              {event.registration_link && (
                <div className="mt-4">
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#260046] text-white font-inter font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-opacity-90 transition-all hover:scale-105"
                  >
                    Register Now
                  </a>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center text-white/70 font-inter p-8 bg-white/10 rounded-2xl">
            No events found for this club.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
);

const WelcomeView = ({ announcements, loading }) => (
  <div className="w-full max-w-4xl mx-auto text-center pt-24 px-4">
    <h1 className="font-playfair text-5xl md:text-6xl font-bold text-white mb-4">WELCOME BACK</h1>
    <p className="font-inter text-lg text-white/80 mb-8">Here’s what’s happening in your clubs today!</p>
    <div className="bg-white/30 backdrop-blur-md rounded-3xl p-8 min-h-[300px] shadow-xl text-left">
      <h3 className="font-playfair text-2xl font-bold text-black/80 mb-4 flex items-center gap-2">
        <Bell /> Announcements
      </h3>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-10 h-10 text-black/60 animate-spin" />
          </div>
        ) : announcements.length > 0 ? (
          announcements.map(ann => (
            <div key={ann.id} className="bg-white/50 p-4 rounded-lg">
              <h4 className="font-inter font-bold text-black/90">{ann.title}</h4>
              <p className="font-inter text-sm text-black/70">{ann.description}</p>
              <p className="text-xs text-black/50 mt-2">
                {clubs.find(c => c.id === ann.club_id)?.name || 'General'} - {new Date(ann.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-black/60 font-inter pt-8">No announcements yet.</p>
        )}
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [selectedClub, setSelectedClub] = useState('finite-loop');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState('welcome');
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setView('dashboard');
    }, 3000);
    
    fetchAnnouncements();

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchEvents(selectedClub);
  }, [selectedClub]);

  const fetchEvents = async (clubId) => {
    setEventsLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('club_id', clubId)
      .order('event_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data);
    }
    setEventsLoading(false);
  };

  const fetchAnnouncements = async () => {
    setAnnouncementsLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching announcements:', error);
    } else {
      setAnnouncements(data);
    }
    setAnnouncementsLoading(false);
  };

  const selectedClubData = clubs.find(c => c.id === selectedClub);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-dash-bg-start via-dash-bg-mid to-dash-bg-end relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-marble opacity-50"></div>

      <DashboardHeader 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <main className="relative z-20 pt-20 lg:pt-8 min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WelcomeView announcements={announcements} loading={announcementsLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-screen-2xl mx-auto lg:flex lg:items-start lg:space-x-8 h-full"
            >
              <div className="lg:hidden">
                <ClubsPanel
                  selectedClub={selectedClub}
                  onSelectClub={setSelectedClub}
                  isOpen={isMobileMenuOpen}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </div>
              <div className="hidden lg:block">
                 <ClubsPanel
                  selectedClub={selectedClub}
                  onSelectClub={setSelectedClub}
                  isOpen={true}
                />
              </div>
              <EventsPanel club={selectedClubData} events={events} loading={eventsLoading} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default DashboardPage;
