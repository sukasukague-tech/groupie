import React, { useState, useEffect } from 'react';
import { Trip, Member, RankedPreference, PRESET_PREFERENCES, GroupItinerary } from './types';
import StepHeader from './components/StepHeader';
import MembersList from './components/MembersList';
import PreferenceForm from './components/PreferenceForm';
import ItineraryDisplay from './components/ItineraryDisplay';

import { 
  Plus, 
  Sparkles, 
  Plane, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  Users,
  Compass,
  AlertCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'group-travel-planner-v1';

export default function App() {
  // Global States
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activePreferenceSheet, setActivePreferenceSheet] = useState<Member | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiSource, setAiSource] = useState<string>('gemini');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initial Form Fields for setup
  const [tripName, setTripName] = useState('Summer Escape');
  const [destination, setDestination] = useState('Bali, Indonesia');
  const [startDate, setStartDate] = useState('2026-07-15');
  const [endDate, setEndDate] = useState('2026-07-20');
  const [leaderName, setLeaderName] = useState('Hendry Jap');
  const [leaderEmail, setLeaderEmail] = useState('hendry.jap@gmail.com');

  // Load state from local storage on bootstrap
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          setTrip(parsed);
          // Pre-populate fields from saved trip for convenience
          setTripName(parsed.name || '');
          setDestination(parsed.destination || '');
          setStartDate(parsed.startDate || '');
          setEndDate(parsed.endDate || '');
          const leader = parsed.members.find((m: Member) => m.isLeader);
          if (leader) {
            setLeaderName(leader.name);
            setLeaderEmail(leader.email);
          }
        }
      } catch (e) {
        console.error('Error loading saved trip state:', e);
      }
    }
  }, []);

  // Save state to local storage when state changes
  const saveTripState = (updatedTrip: Trip | null) => {
    setTrip(updatedTrip);
    if (updatedTrip) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTrip));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Loading screen slideshow of smart travel steps
  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Phase 1: Create Trip (Group Leader initiates)
  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !leaderName.trim() || !leaderEmail.trim()) {
      setErrorMessage('Please fill in destination, group leader name and email details.');
      return;
    }

    // Initialize leader in completing state or pending
    const leaderMember: Member = {
      id: 'leader-id-100',
      name: leaderName,
      email: leaderEmail,
      isLeader: true,
      status: 'pending',
      preferences: []
    };

    // Pre-create two interesting mock members to allow immediate simulated testing
    const companion1: Member = {
      id: 'companion-1',
      name: 'Sarah (Art Critic)',
      email: 'sarah.culture@example.com',
      isLeader: false,
      status: 'pending',
      preferences: []
    };

    const companion2: Member = {
      id: 'companion-2',
      name: 'John (Adrenaline Junkie)',
      email: 'john.extreme@example.com',
      isLeader: false,
      status: 'pending',
      preferences: []
    };

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      name: tripName,
      destination,
      startDate,
      endDate,
      members: [leaderMember, companion1, companion2],
      status: 'preferences'
    };

    saveTripState(newTrip);
  };

  // Phase 2: Add member to travel dates list
  const handleAddMember = (name: string, email: string) => {
    if (!trip) return;
    const newMember: Member = {
      id: `member-${Date.now()}`,
      name,
      email,
      isLeader: false,
      status: 'pending',
      preferences: []
    };

    const updated: Trip = {
      ...trip,
      members: [...trip.members, newMember]
    };
    saveTripState(updated);
  };

  // Remove member from travel dates list
  const handleRemoveMember = (id: string) => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      members: trip.members.filter((m) => m.id !== id)
    };
    saveTripState(updated);
  };

  // Trigger individual preferences sheet setup
  const handleEditPreferences = (member: Member) => {
    setActivePreferenceSheet(member);
  };

  // Save single traveler's preference and ranking setup
  const handleSavePreferences = (memberId: string, preferences: RankedPreference[], notes: string) => {
    if (!trip) return;
    
    const updatedMembers = trip.members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'completed' as const,
          preferences,
          customNotes: notes
        };
      }
      return m;
    });

    const updated: Trip = {
      ...trip,
      members: updatedMembers
    };
    saveTripState(updated);
    setActivePreferenceSheet(null);
  };

  // Quick Autofill a member's preference with a mock preset sequence
  const handleAutofillMember = (memberId: string) => {
    if (!trip) return;

    // Define some distinct, extremely diverse travel personality presets
    const templates: Record<string, { notes: string; favOrder: string[] }> = {
      'leader-id-100': {
        favOrder: ['food', 'leisure', 'recreation', 'culture', 'nightlife', 'extreme adventure'],
        notes: 'Enjoys gourmet fine dining, loves taking lazy afternoon cafe walks, prefers hotels with built-in spa/wellness resources.'
      },
      'companion-1': {
        favOrder: ['culture', 'leisure', 'food', 'recreation', 'nightlife', 'extreme adventure'],
        notes: 'Loves classical art history museums, historical tours, hates loud extreme sports, looking for scenic views to take photos.'
      },
      'companion-2': {
        favOrder: ['extreme adventure', 'nightlife', 'recreation', 'food', 'culture', 'leisure'],
        notes: 'Highly active individual, looking for bungee jumping or volcanic hiking, wants loud electronic music joints in the evenings.'
      },
    };

    // Fallback template if they added a random custom member
    const defaultTemplate = {
      favOrder: ['recreation', 'leisure', 'food', 'culture', 'extreme adventure', 'nightlife'],
      notes: 'Wants a relaxed experience sightseeing, comfortable bus transfers, enjoys regional street food tours.'
    };

    const config = templates[memberId] || defaultTemplate;

    const ranked: RankedPreference[] = config.favOrder.map((cat, idx) => {
      const label = PRESET_PREFERENCES.find((p) => p.category === cat)?.label || cat;
      return {
        category: cat,
        label,
        rank: idx + 1
      };
    });

    const updatedMembers = trip.members.map((m) => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'completed' as const,
          preferences: ranked,
          customNotes: config.notes
        };
      }
      return m;
    });

    const updated: Trip = {
      ...trip,
      members: updatedMembers
    };
    saveTripState(updated);
  };

  // Phase 3: Send list of preferences to server-side Gemini API
  const handleProceedToAlignment = async () => {
    if (!trip) return;
    setIsAnalyzing(true);
    setErrorMessage('');

    // Pre-align any members that are still pending or missing preferences so the planner doesn't fail
    const updatedMembers = trip.members.map((m) => {
      if (m.status === 'completed' && m.preferences && m.preferences.length > 0) {
        return m;
      }

      // Member is pending or empty: Autofill with smart default preset based on traveler ID or fallback
      const templates: Record<string, { notes: string; favOrder: string[] }> = {
        'leader-id-100': {
          favOrder: ['food', 'leisure', 'recreation', 'culture', 'nightlife', 'extreme adventure'],
          notes: 'Enjoys gourmet fine dining, loves taking lazy afternoon cafe walks, prefers hotels with built-in spa/wellness resources.'
        },
        'companion-1': {
          favOrder: ['culture', 'leisure', 'food', 'recreation', 'nightlife', 'extreme adventure'],
          notes: 'Loves classical art history museums, historical tours, hates loud extreme sports, looking for scenic views to take photos.'
        },
        'companion-2': {
          favOrder: ['extreme adventure', 'nightlife', 'recreation', 'food', 'culture', 'leisure'],
          notes: 'Highly active individual, looking for bungee jumping or volcanic hiking, wants loud electronic music joints in the evenings.'
        },
      };

      const defaultTemplate = {
        favOrder: ['recreation', 'leisure', 'food', 'culture', 'extreme adventure', 'nightlife'],
        notes: 'Wants a relaxed experience sightseeing, comfortable bus transfers, enjoys regional street food tours.'
      };

      const config = templates[m.id] || defaultTemplate;

      const ranked: RankedPreference[] = config.favOrder.map((cat, idx) => {
        const label = PRESET_PREFERENCES.find((p) => p.category === cat)?.label || cat;
        return {
          category: cat,
          label,
          rank: idx + 1
        };
      });

      return {
        ...m,
        status: 'completed' as const,
        preferences: ranked,
        customNotes: config.notes
      };
    });

    const tripWithPreparedMembers = {
      ...trip,
      members: updatedMembers
    };

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tripWithPreparedMembers.name,
          destination: tripWithPreparedMembers.destination,
          startDate: tripWithPreparedMembers.startDate,
          endDate: tripWithPreparedMembers.endDate,
          members: tripWithPreparedMembers.members
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error during synthesis.');
      }

      const data = await response.json();
      setAiSource(data.source || 'offline-fallback');

      const updated: Trip = {
        ...tripWithPreparedMembers,
        status: 'itinerary',
        itinerary: data.itinerary
      };
      saveTripState(updated);
    } catch (e: any) {
      console.error(e);
      setErrorMessage('Failed to connect to the itinerary algorithm. Please check your workspace server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Phase 4: Put into locked published state
  const handlePublishItinerary = () => {
    if (!trip) return;
    const updated: Trip = {
      ...trip,
      status: 'published'
    };
    saveTripState(updated);
  };

  // Reset entire state / Start fresh trip
  const handleResetTrip = () => {
    if (window.confirm('Are you sure you want to start a new trip? This will wipe your current local planner outline.')) {
      saveTripState(null);
      // Reset default input fields
      setTripName('Summer Escape');
      setDestination('Bali, Indonesia');
      setStartDate('2026-07-15');
      setEndDate('2026-07-20');
      setErrorMessage('');
    }
  };

  // Loading animation custom slide strings
  const loadingSlides = [
    { title: 'Harmonizing Group Preferences', desc: 'Analyzing ranked votes across adventure, leisure, culture, and dining.' },
    { title: 'Balancing Parallel Breaks', desc: 'Squeezing specialized side-trips into open timeblocks for individual members.' },
    { title: 'Securing the Safe Pathway', desc: 'Formulating localized transit safety guidelines for transit dates.' },
    { title: 'Polishing Master Itinerary', desc: 'Aligning dates and mapping locations for ultimate coordination.' }
  ];

  return (
    <div className="min-h-screen bg-[#F1F2F6] flex flex-col font-sans selection:bg-dark-geo/20 selection:text-dark-geo pb-12">
      {/* HEADER PROGRESS STEPPER */}
      <StepHeader 
        currentStatus={trip ? trip.status : 'setup'} 
        onReset={trip ? handleResetTrip : undefined}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* GLOBAL ERROR DISPLAY */}
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-4 rounded-2xl flex items-center gap-2 max-w-2xl mx-auto uppercase tracking-wide">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* LOADING ENGINE SCREEN OVERLAY */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-[#2D3436]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-lg border border-border-geo">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[#E9ECEF]" />
                <div className="absolute inset-0 rounded-full border-4 border-primary-geo border-t-transparent animate-spin" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-extrabold text-dark-geo font-display text-base uppercase tracking-wider">
                  {loadingSlides[loadingStep]?.title}
                </h3>
                <p className="text-xs text-gray-geo leading-relaxed max-w-xs mx-auto">
                  {loadingSlides[loadingStep]?.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-border-geo text-[9px] font-mono font-black text-primary-geo uppercase tracking-widest">
                Harmonizing preference parameters
              </div>
            </div>
          </div>
        )}

        {/* MODAL POPUP: INDIVIDUAL GUEST PREFERENCE SURVEY INSIDE TRIP DETAILS SCREEN */}
        {activePreferenceSheet && (
          <div className="fixed inset-0 bg-[#2D3436]/60 backdrop-blur-xs z-50 overflow-y-auto px-4 py-8">
            <PreferenceForm
              member={activePreferenceSheet}
              onSave={handleSavePreferences}
              onCancel={() => setActivePreferenceSheet(null)}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* STATE VIEW 1: SETUP TRIP (GROUP LEADER FORM) */}
        {/* ======================================= */}
        {!trip && (
          <div className="max-w-2xl mx-auto space-y-8 py-4">
            
            {/* Visual Header Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-dark-geo text-white p-8 md:p-10 shadow-sm border border-dark-geo">
              <div className="relative space-y-3 max-w-lg">
                <div className="inline-flex items-center gap-1.5 bg-primary-geo text-white text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest">
                  <Plane className="w-3.5 h-3.5" /> Group Travel Setup
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase font-display tracking-tight leading-none">
                  Align preferences, secure the dates.
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Start your journey by defining the target dates and location. Invite travelers to vote on leisure, adventure, and dining. Gemini AI builds the perfect harmonized master agenda.
                </p>
              </div>
            </div>

            {/* Main setup form */}
            <div className="bg-white border border-border-geo rounded-3xl p-6 md:p-8 shadow-sm">
              <h3 className="text-sm font-extrabold uppercase font-display text-dark-geo tracking-widest mb-5 pb-3 border-b border-border-geo">
                Initialize Trip & Security Bounds
              </h3>

              <form onSubmit={handleCreateTrip} className="space-y-6">
                
                {/* Section 1: Destination and Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5" id="field_trip_name">
                    <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Trip Title</label>
                    <input
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="Summer Vacation 2026"
                      className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none placeholder-slate-400 transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5" id="field_trip_destination">
                    <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Target Destination</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="E.g. Paris, France"
                      className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none placeholder-slate-400 transition-colors font-semibold"
                    />
                  </div>
                </div>

                {/* Section 2: Dates bounds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5" id="field_trip_start">
                    <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Departure Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none text-slate-800 transition-colors font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5" id="field_trip_end">
                    <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Return Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none text-slate-800 transition-colors font-semibold"
                    />
                  </div>
                </div>

                {/* Section 3: Group Leader registry credentials */}
                <div className="pt-4 border-t border-border-geo space-y-4">
                  <h4 className="text-[9px] font-black text-gray-geo uppercase tracking-widest font-mono">
                    Group Leader Registry Credentials
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Your Name</label>
                      <input
                        type="text"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none placeholder-slate-400 transition-colors font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-dark-geo uppercase tracking-widest">Your Email</label>
                      <input
                        type="email"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-white outline-none placeholder-slate-400 transition-colors font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full text-[10px] font-black text-white bg-primary-geo hover:bg-black active:scale-99 cursor-pointer py-4 px-6 rounded-full shadow-md transition-all flex items-center justify-center gap-2 mt-2 uppercase tracking-widest"
                  id="create_trip_plan_button"
                >
                  Create & Setup Board
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* STATE VIEW 2: GROUP LEADER PANEL & PARALLEL INVITES */}
        {/* ======================================= */}
        {trip && (trip.status === 'preferences') && (
          <div className="space-y-8">
            {/* Short Trip Header Status */}
            <div className="bg-white border border-border-geo rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[9px] bg-dark-geo font-mono font-black text-white px-2.5 py-1 rounded uppercase tracking-wider">
                    ACTIVE BOARD
                  </span>
                  <span className="text-gray-geo font-black">•</span>
                  <span className="text-gray-geo font-black flex items-center gap-1 uppercase tracking-wider text-[10px]">
                    <MapPin className="w-3.5 h-3.5 text-gray-geo" /> {trip.destination}
                  </span>
                </div>
                <h2 className="text-xl font-black uppercase font-display text-dark-geo leading-tight">
                  {trip.name} Preference Board
                </h2>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[9px] text-gray-geo font-black tracking-widest block">DATES DETECTED</span>
                <span className="text-xs font-black text-dark-geo font-mono">{trip.startDate} — {trip.endDate}</span>
              </div>
            </div>

            {/* List members and control survey links */}
            <MembersList
              members={trip.members}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onEditPreferences={handleEditPreferences}
              onAutofillMember={handleAutofillMember}
              onProceedToAlignment={handleProceedToAlignment}
            />
          </div>
        )}

        {/* ======================================= */}
        {/* STATE VIEW 3 & 4: SYNTHESIZED MASTER ITINERARY DISPLAY */}
        {/* ======================================= */}
        {trip && (trip.status === 'itinerary' || trip.status === 'published') && trip.itinerary && (
          <ItineraryDisplay
            trip={trip}
            itinerary={trip.itinerary}
            isPublished={trip.status === 'published'}
            onPublish={handlePublishItinerary}
            onReset={handleResetTrip}
            aiSource={aiSource}
          />
        )}

      </main>
    </div>
  );
}
