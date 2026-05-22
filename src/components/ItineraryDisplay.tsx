import { useState } from 'react';
import { GroupItinerary, Member, Trip } from '../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Check, 
  Share2, 
  Printer, 
  Lock, 
  Unlock,
  AlertTriangle,
  Map,
  Coins,
  ChevronRight,
  Info
} from 'lucide-react';

interface ItineraryDisplayProps {
  trip: Trip;
  itinerary: GroupItinerary;
  isPublished: boolean;
  onPublish: () => void;
  onReset: () => void;
  aiSource?: string;
}

export default function ItineraryDisplay({
  trip,
  itinerary,
  isPublished,
  onPublish,
  onReset,
  aiSource
}: ItineraryDisplayProps) {
  const [activeTab, setActiveTab] = useState<'group' | 'individual' | 'security'>('group');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(trip.members[0]?.id || '');
  const [showShareNotification, setShowShareNotification] = useState(false);

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (e) {
      return '';
    }
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const handleShare = () => {
    const baseUrl = window.location.href.split('?')[0];
    const dummyLink = `${baseUrl}?tripId=${trip.id}&published=true`;
    
    navigator.clipboard.writeText(dummyLink).then(() => {
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 3000);
    });
  };

  const filteredIndividualRecommendations = itinerary.individualRecommendations.filter(
    (rec) => rec.memberId === selectedMemberId
  );

  const selectedMemberName = trip.members.find((m) => m.id === selectedMemberId)?.name || 'Traveler';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Alert or Info banner regarding Gemini AI Source */}
      {aiSource === 'gemini' ? (
        <div className="bg-[#55efc4]/10 border border-[#55efc4]/40 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-success-geo text-white rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-dark-geo">Synthesized by Gemini AI</p>
              <p className="text-[11px] text-[#006266] font-semibold mt-0.5">Successfully harmonized travel DNA preference rankings and synchronized parallel split activities.</p>
            </div>
          </div>
          <span className="text-[10px] bg-success-geo/25 text-[#006266] font-mono font-black px-2.5 py-0.5 rounded">
            gemini-3.5-flash
          </span>
        </div>
      ) : (
        <div className="bg-warning-geo/10 border border-warning-geo/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-warning-geo text-dark-geo rounded-lg">
              <Info className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-dark-geo">Smart Consensus Algorithm Enabled</p>
              <p className="text-[11px] text-amber-950 font-semibold mt-0.5">Offline fallback planner balanced your traveler profiles in simulated harmony.</p>
            </div>
          </div>
          <span className="text-[10px] bg-warning-geo/30 text-amber-950 font-mono font-black px-2.5 py-0.5 rounded">
            local-optimizer
          </span>
        </div>
      )}

      {/* Main Header Card with Trip Metadata and Actions */}
      <div className="bg-white border border-border-geo rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-light-geo border-b border-border-geo">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-primary-geo text-white font-black px-3 py-1 rounded uppercase tracking-wider">
                {itinerary.destination}
              </span>
              <span className="text-xs text-gray-geo font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateLabel(trip.startDate)} — {formatDateLabel(trip.endDate)}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase font-display text-dark-geo tracking-tight">
              {trip.name || `${itinerary.destination} Escape`}
            </h2>
            <p className="text-xs text-gray-geo max-w-xl leading-relaxed">
              {itinerary.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isPublished ? (
              <div className="bg-[#55efc4] text-[#006266] text-[10px] font-black px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xs uppercase tracking-wider border border-[#00b894]/20">
                <Lock className="w-4 h-4" /> Locked & Published
              </div>
            ) : (
              <button
                onClick={onPublish}
                className="text-[10px] font-black text-white bg-primary-geo hover:bg-black active:scale-98 px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer uppercase tracking-widest"
                id="publish_itinerary_btn"
              >
                <ShieldCheck className="w-4 h-4" /> Publish Plan
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-3 rounded-full border border-border-geo text-dark-geo bg-white hover:bg-light-geo relative cursor-pointer"
              title="Copy link to clipboard"
            >
              <Share2 className="w-4 h-4" />
              {showShareNotification && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-geo text-white text-[9px] font-black uppercase py-1.5 px-3.5 rounded shadow-lg whitespace-nowrap z-50 tracking-wider">
                  Link Copied!
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Tab Navigation Row */}
        <div className="flex border-b border-border-geo overflow-x-auto bg-white">
          <button
            onClick={() => setActiveTab('group')}
            className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'group'
                ? 'border-primary-geo text-primary-geo bg-light-geo/30'
                : 'border-transparent text-gray-geo hover:text-dark-geo hover:bg-light-geo/10'
            }`}
          >
            <Map className="w-4 h-4" /> Group Master Agenda
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'individual'
                ? 'border-primary-geo text-primary-geo bg-light-geo/30'
                : 'border-transparent text-gray-geo hover:text-dark-geo hover:bg-light-geo/10'
            }`}
          >
            <User className="w-4 h-4" /> Tailored Recommendations
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-4 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 cursor-pointer border-b-2 ${
              activeTab === 'security'
                ? 'border-primary-geo text-primary-geo bg-light-geo/30'
                : 'border-transparent text-gray-geo hover:text-dark-geo hover:bg-light-geo/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Security Safeguard Brief
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      <div className="space-y-6">
        
        {/* TAB 1: GROUP MASTER AGENDA */}
        {activeTab === 'group' && (
          <div className="space-y-6">
            {itinerary.days.map((day) => (
              <div key={day.day} className="bg-white border border-border-geo rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-geo"></div>
                
                {/* Day Marker */}
                <div className="shrink-0 w-14 flex flex-row md:flex-col items-center gap-2 md:gap-0.5 justify-start">
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#636E72]">Day</span>
                  <span className="text-3xl font-black leading-none text-dark-geo font-display">0{day.day}</span>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {/* Theme Header */}
                  <div>
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-dark-geo">{day.theme}</h3>
                    <p className="text-[11px] text-gray-geo font-mono uppercase mt-0.5 font-bold">
                      {getDayName(day.date)} • {formatDateLabel(day.date)}
                    </p>
                  </div>

                  <div className="h-[1px] bg-border-geo w-full"></div>

                  {/* Day Activities List */}
                  <div className="divide-y divide-border-geo">
                    {day.activities.map((act) => (
                      <div key={act.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {/* Left Time Badge */}
                          <div className="w-16 shrink-0 flex items-center gap-1.5 text-gray-geo pt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-geo shrink-0" />
                            <span className="font-mono text-xs font-bold text-dark-geo">{act.time}</span>
                          </div>

                          {/* Detail Content */}
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-xs uppercase tracking-wide text-dark-geo">{act.title}</h4>
                              
                              {act.isGroupActivity ? (
                                <span className="bg-[#55efc4]/50 text-[#006266] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                  consensus
                                </span>
                              ) : (
                                <span className="bg-warning-geo/50 text-amber-950 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                  split track
                                </span>
                              )}

                              <span className="text-[8px] font-black bg-light-geo text-gray-geo border border-border-geo px-2 py-0.5 rounded uppercase tracking-wider">
                                {act.type}
                              </span>
                            </div>

                            <p className="text-xs text-paragraph-geo leading-relaxed">{act.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400">
                              {act.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-300" /> {act.location}
                                </span>
                              )}
                              {act.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 border-slate-350" /> Duration: {act.duration}
                                </span>
                              )}
                            </div>

                            {act.targetedMembers && act.targetedMembers.length > 0 && (
                              <div className="mt-2.5">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary-geo bg-primary-geo/5 px-2 py-1 rounded">
                                  Target: {act.targetedMembers.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: TAILORED SIDE RECOMMENDATIONS */}
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left sidebar selector of members */}
            <div className="lg:col-span-1 space-y-2">
              <h4 className="text-[9px] font-black text-gray-geo uppercase tracking-widest px-2 mb-3">
                Select Traveler
              </h4>
              {trip.members.map((m) => {
                const isSelected = m.id === selectedMemberId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-dark-geo bg-[#DFE6E9]/40 text-dark-geo ring-1 ring-dark-geo/10'
                        : 'border-border-geo bg-white text-gray-geo hover:bg-light-geo hover:text-dark-geo'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg font-display font-extrabold text-xs flex items-center justify-center shrink-0 border border-border-geo ${
                        isSelected ? 'bg-primary-geo text-white' : 'bg-light-geo text-dark-geo'
                      }`}>
                        {m.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold truncate leading-tight uppercase tracking-wide">{m.name}</p>
                        <p className="text-[10px] text-gray-geo truncate leading-none mt-1">{m.email}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isSelected ? 'translate-x-1 text-primary-geo' : ''}`} />
                  </button>
                );
              })}
            </div>

            {/* Individual proposal detail */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-border-geo rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-border-geo mb-6">
                  <div>
                    <span className="text-[9px] bg-light-geo text-gray-geo font-black px-2 py-0.5 rounded uppercase tracking-widest">
                      Custom Alignment
                    </span>
                    <h3 className="font-extrabold text-base uppercase text-dark-geo tracking-wide mt-1">
                      Side Highlights: {selectedMemberName}
                    </h3>
                  </div>
                  <User className="w-5 h-5 text-primary-geo" />
                </div>

                <p className="text-[11px] text-gray-geo mb-6 leading-relaxed">
                  These custom-tailored recommendations do not block the central unified trip. They are mapped out for independent free intervals or morning/evening split off blocks matching {selectedMemberName}'s custom notes.
                </p>

                {filteredIndividualRecommendations.length === 0 ? (
                  <div className="text-center py-10 border border-border-geo border-dashed rounded-2xl bg-light-geo">
                    <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-extrabold text-dark-geo uppercase tracking-wide">No private side adventures returned.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIndividualRecommendations.map((rec) => (
                      <div key={rec.id} className="border border-border-geo bg-light-geo rounded-2xl p-5 hover:bg-white hover:shadow-xs transition-all border-l-4 border-l-primary-geo">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h4 className="font-extrabold text-xs uppercase tracking-wider text-dark-geo">{rec.title}</h4>
                          <span className="text-[8px] font-black text-primary-geo bg-primary-geo/10 border border-primary-geo/25 px-2.5 py-0.5 rounded uppercase tracking-wider">
                            {rec.type}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-geo leading-relaxed mb-3">
                          {rec.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-400 mt-2 pt-2 border-t border-border-geo">
                          {rec.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Location: {rec.location}
                            </span>
                          )}
                          {rec.bestFitTime && (
                            <span className="flex items-center gap-1 text-primary-geo font-extrabold">
                              <Clock className="w-3 h-3 text-primary-geo" /> Best Slot: {rec.bestFitTime}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY AND SECURITY BRIEF */}
        {activeTab === 'security' && (
          <div className="bg-white border border-border-geo rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border-geo pb-4">
              <div className="w-10 h-10 rounded-xl bg-light-geo border border-border-geo text-dark-geo flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-geo" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-dark-geo">Security Safeguard Tracker</h3>
                <p className="text-[11px] text-gray-geo">Essential travel safeguards to secure your journey in {itinerary.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {itinerary.securityTips.map((tip, idx) => (
                <div key={idx} className="bg-white border border-border-geo rounded-3xl p-6 shadow-sm flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-[9px] font-mono font-black text-slate-300">
                    S-0{idx + 1}
                  </div>
                  <AlertTriangle className="w-5 h-5 text-accent-geo" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-dark-geo">
                    {idx === 0 ? 'Document Protocols' : idx === 1 ? 'Liaison Safeguards' : 'Awareness & Routes'}
                  </h4>
                  <p className="text-xs text-gray-geo leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-primary-geo/5 border border-primary-geo/15 rounded-2xl p-5 flex items-start gap-4">
              <Info className="w-5 h-5 text-primary-geo shrink-0 mt-0.5" />
              <div className="text-xs text-dark-geo leading-relaxed space-y-2">
                <span className="font-black text-[10px] uppercase tracking-wider text-primary-geo block">Dates & Travel Security Locking</span>
                <p>This group plan locks flight registries and maps lodging addresses. In case of emergency or flight cancellation, you can immediately export this compiled timeline to emergency contacts. Use the top **Share Link** to grant secure live-access endpoints for designated coordinators back home.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
