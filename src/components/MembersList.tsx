import React, { useState } from 'react';
import { Member, PRESET_PREFERENCES, RankedPreference } from '../types';
import { Users, Plus, CheckCircle, Clock, UserCheck, Trash2, ArrowRight, Compass, Sparkles } from 'lucide-react';

interface MembersListProps {
  members: Member[];
  onAddMember: (name: string, email: string) => void;
  onRemoveMember: (id: string) => void;
  onEditPreferences: (member: Member) => void;
  onAutofillMember: (memberId: string) => void;
  onProceedToAlignment: () => void;
}

export default function MembersList({
  members,
  onAddMember,
  onRemoveMember,
  onEditPreferences,
  onAutofillMember,
  onProceedToAlignment,
}: MembersListProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorHeader, setErrorHeader] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorHeader('Please provide a name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorHeader('Please provide a valid email address.');
      return;
    }
    setErrorHeader('');
    onAddMember(name.trim(), email.trim());
    setName('');
    setEmail('');
  };

  const getTopPreferenceLabel = (member: Member) => {
    if (member.status === 'pending' || !member.preferences.length) return 'Not configured yet';
    const sorted = [...member.preferences].sort((a, b) => a.rank - b.rank);
    return sorted[0]?.label || 'None';
  };

  const allCompleted = members.length > 0 && members.every((m) => m.status === 'completed');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Invite panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white border border-border-geo rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-geo" />
            <h3 className="font-extrabold font-display text-dark-geo text-sm uppercase tracking-wider">Invite Group Members</h3>
          </div>
          <p className="text-[11px] text-gray-geo mb-5 leading-normal">
            Invite colleagues, friends, or family on this travel date. Each individual will have their own independent, parallel input link.
          </p>

          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 outline-none placeholder-slate-400 bg-light-geo text-dark-geo transition-colors"
                id="member_name_input"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 outline-none placeholder-slate-400 bg-light-geo text-dark-geo transition-colors"
                id="member_email_input"
              />
            </div>

            {errorHeader && <p className="text-xs text-accent-geo font-bold">{errorHeader}</p>}

            <button
              type="submit"
              className="w-full text-[10px] font-black text-white bg-dark-geo hover:bg-black cursor-pointer p-3.5 rounded-full uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
              id="invite_submit_button"
            >
              <Plus className="w-4 h-4" />
              Invite Traveler
            </button>
          </form>
        </div>

        {/* Quick Instructions status panel */}
        <div className="p-4 bg-primary-geo/5 border border-primary-geo/15 rounded-2xl space-y-3">
          <h4 className="text-[10px] font-black text-primary-geo uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-primary-geo" /> Parallel Planning Tracker
          </h4>
          <ul className="space-y-2 text-[11px] text-dark-geo/90 pl-3 leading-relaxed">
            <li>Members receive unique voting sheets to secure consensus feedback.</li>
            <li>Travelers vote across Leisure, Adventure, Recreation, Culture, or Dining.</li>
            <li>You can Autofill members to instantly simulate a multi-person planning poll.</li>
          </ul>
        </div>
      </div>

      {/* Invited Members Grid */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-border-geo rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6 border-b border-border-geo pb-4">
            <div>
              <h3 className="font-extrabold font-display text-dark-geo uppercase text-sm tracking-wider">Active Survey Board</h3>
              <p className="text-[10px] text-gray-geo mt-1">
                {members.length} {members.length === 1 ? 'traveler' : 'travelers'} in list. Let everyone vote in parallel.
              </p>
            </div>
            {allCompleted && (
              <span className="text-[9px] bg-[#55efc4]/40 text-[#006266] border border-[#55efc4]/60 px-3 py-1 rounded font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" /> All Preferences Locked
              </span>
            )}
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border-geo rounded-xl bg-light-geo">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-extrabold text-dark-geo uppercase tracking-wider">No group members yet</p>
              <p className="text-[11px] text-gray-geo mt-1 max-w-sm mx-auto">
                Invite team members on the left side to simulate preferences input. The group leader is always listed first!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-geo">
              {members.map((m) => {
                const isSaved = m.status === 'completed';
                
                return (
                  <div key={m.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg font-display font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-border-geo ${
                        m.isLeader 
                          ? 'bg-primary-geo/15 text-primary-geo border-primary-geo/30' 
                          : 'bg-light-geo text-dark-geo'
                      }`}>
                        {m.name.split(' ').map(n=>n[0]).join('') || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs uppercase tracking-wide text-dark-geo">{m.name}</h4>
                          {m.isLeader && (
                            <span className="bg-warning-geo/55 text-amber-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-geo">{m.email}</p>
                        
                        {/* Selected Preferences Summary Badge */}
                        {isSaved ? (
                          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[9px] text-gray-geo uppercase font-mono tracking-widest">Top Priority:</span>
                            <span className="text-[10px] font-black bg-primary-geo/10 text-primary-geo border border-primary-geo/20 px-2.5 py-0.5 rounded uppercase">
                              {getTopPreferenceLabel(m)}
                            </span>
                            {m.customNotes && (
                              <span className="text-[10px] text-gray-geo italic max-w-xs truncate" title={m.customNotes}>
                                &ldquo;{m.customNotes}&rdquo;
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-geo italic mt-1.5 flex items-center gap-1 font-semibold">
                            <Clock className="w-3 h-3 text-accent-geo" /> Pending feedback link...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Member Survey Panel Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isSaved ? (
                        <>
                          <button
                            onClick={() => onAutofillMember(m.id)}
                            className="text-[10px] text-dark-geo font-bold border border-border-geo bg-white hover:bg-light-geo px-3 py-1.5 rounded-full uppercase tracking-wider transition-all cursor-pointer"
                            title="Auto-fill mock interests to speed up testing"
                          >
                            Autofill
                          </button>
                          <button
                            onClick={() => onEditPreferences(m)}
                            className="text-[10px] text-white bg-primary-geo hover:bg-black font-black px-4 py-1.5 rounded-full uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            Fill Survey
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditPreferences(m)}
                            className="text-[10px] text-gray-geo hover:text-dark-geo font-bold border border-border-geo bg-white hover:bg-light-geo px-4 py-1.5 rounded-full uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Re-Rank
                          </button>
                          {isSaved && (
                            <span className="text-success-geo bg-[#55efc4]/20 border border-[#55efc4]/40 p-1 rounded" title="Locked">
                              <UserCheck className="w-4 h-4" />
                            </span>
                          )}
                        </>
                      )}

                      {!m.isLeader && (
                        <button
                          onClick={() => onRemoveMember(m.id)}
                          className="p-1.5 rounded-full border border-border-geo text-gray-geo hover:text-accent-geo hover:bg-light-geo transition-colors cursor-pointer"
                          title="Remove traveler"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Proceed to Generation Action Screen */}
          <div className="mt-8 pt-6 border-t border-border-geo flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] text-gray-geo text-center sm:text-left font-semibold max-w-sm">
              Ready to coordinate? Click Align below to compile preferences. Any pending traveler surveys will be automatically filled with smart defaults to ensure a rich consensus.
            </div>
            <button
              onClick={onProceedToAlignment}
              disabled={members.length === 0}
              className={`w-full sm:w-auto text-[10px] font-black py-3.5 px-7 rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-widest ${
                members.length > 0
                  ? 'bg-primary-geo hover:bg-black text-white active:scale-98'
                  : 'bg-light-geo border border-border-geo text-slate-300 cursor-not-allowed opacity-80'
              }`}
              id="generate_itinerary_trigger"
            >
              Align & Generate Itinerary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
