import React, { useState, useEffect } from 'react';
import { RankedPreference, PRESET_PREFERENCES, Member } from '../types';
import { Star, ArrowUp, ArrowDown, Sparkles, Check, ChevronRight } from 'lucide-react';

interface PreferenceFormProps {
  member: Member;
  onSave: (memberId: string, preferences: RankedPreference[], notes: string) => void;
  onCancel: () => void;
}

export default function PreferenceForm({ member, onSave, onCancel }: PreferenceFormProps) {
  // Pre-load current ranked preferences, or create fresh sequence from presets
  const [preferences, setPreferences] = useState<RankedPreference[]>([]);
  const [notes, setNotes] = useState(member.customNotes || '');

  useEffect(() => {
    if (member.preferences && member.preferences.length > 0) {
      setPreferences([...member.preferences].sort((a, b) => a.rank - b.rank));
    } else {
      // Create initial rankings in the sequential order
      const initial = PRESET_PREFERENCES.map((p, idx) => ({
        category: p.category,
        label: p.label,
        rank: idx + 1
      }));
      setPreferences(initial);
    }
  }, [member]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPrefs = [...preferences];
    // Swap elements
    const temp = newPrefs[index];
    newPrefs[index] = newPrefs[index - 1];
    newPrefs[index - 1] = temp;
    
    // Reset consecutive ranks
    const updated = newPrefs.map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
    setPreferences(updated);
  };

  const moveDown = (index: number) => {
    if (index === preferences.length - 1) return;
    const newPrefs = [...preferences];
    // Swap elements
    const temp = newPrefs[index];
    newPrefs[index] = newPrefs[index + 1];
    newPrefs[index + 1] = temp;

    // Reset consecutive ranks
    const updated = newPrefs.map((p, idx) => ({
      ...p,
      rank: idx + 1
    }));
    setPreferences(updated);
  };

  const getPresetDescription = (category: string) => {
    return PRESET_PREFERENCES.find(p => p.category === category)?.description || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(member.id, preferences, notes);
  };

  return (
    <div className="bg-white border border-border-geo rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Header Banner */}
      <div className="bg-dark-geo text-white px-6 py-6 border-b border-border-geo">
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-primary-geo text-white font-black px-2.5 py-0.5 rounded uppercase tracking-widest">
            Parallel Survey
          </span>
          {member.isLeader && (
            <span className="text-[9px] bg-warning-geo text-dark-geo font-black px-2 py-0.5 rounded uppercase tracking-widest">
              Lead Organizer
            </span>
          )}
        </div>
        <h2 className="text-xl font-extrabold font-display uppercase tracking-tight mt-2.5">
          Travel DNA: {member.name}
        </h2>
        <p className="text-[11px] text-gray-geo mt-1">
          {member.email} • Setup preferences to balance the master consensus algorithm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Helper Note */}
        <div className="bg-primary-geo/5 border border-primary-geo/20 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary-geo shrink-0 mt-0.5" />
          <div className="text-xs text-dark-geo leading-relaxed">
            <span className="font-bold text-primary-geo uppercase text-[10px] tracking-wider block mb-0.5">Ranking Instructions</span>
            Arrange your travel priorities from 1 to 6. Use the <strong className="font-extrabold">Up & Down arrows</strong>. The alignment engine compromises across parallel member tracks with respect to higher priority indexes.
          </div>
        </div>

        {/* Priorities Section */}
        <div>
          <h3 className="text-xs font-bold text-dark-geo mb-3 uppercase tracking-wider flex items-center justify-between">
            <span>Interest Rank Order</span>
            <span className="text-[9px] text-gray-geo font-mono">Ranked Tracks</span>
          </h3>
          <div className="space-y-3">
            {preferences.map((pref, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isLast = index === preferences.length - 1;
              
              return (
                <div 
                  key={pref.category}
                  className={`flex items-center justify-between border rounded-xl p-3.5 transition-all bg-light-geo border-border-geo ${
                    isFirst 
                      ? 'ring-1 ring-primary-geo/30 border-primary-geo/40' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 text-center shrink-0`}>
                      <span className={`text-[10px] px-2 py-1 rounded font-black uppercase inline-block ${
                        isFirst 
                          ? 'bg-[#55efc4] text-[#006266]' 
                          : isSecond
                          ? 'bg-warning-geo/50 text-amber-950'
                          : 'bg-[#DFE6E9] text-dark-geo'
                      }`}>
                        Rank {pref.rank}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-dark-geo leading-tight">
                        {pref.label}
                      </h4>
                      <p className="text-[11px] text-gray-geo leading-snug">
                        {getPresetDescription(pref.category)}
                      </p>
                      
                      {/* Geometric Match DNA Indicators */}
                      <div className="flex gap-1 pt-1 w-32">
                        <div className={`h-1 flex-1 rounded-full ${pref.rank <= 5 ? 'bg-primary-geo' : 'bg-[#DFE6E9]'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${pref.rank <= 4 ? 'bg-primary-geo' : 'bg-[#DFE6E9]'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${pref.rank <= 3 ? 'bg-primary-geo' : 'bg-[#DFE6E9]'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${pref.rank <= 2 ? 'bg-primary-geo' : 'bg-[#DFE6E9]'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${pref.rank <= 1 ? 'bg-primary-geo' : 'bg-[#DFE6E9]'}`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Rank Controllers */}
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={isFirst}
                      className={`p-1.5 rounded-md border text-slate-500 transition-colors ${
                        isFirst 
                          ? 'opacity-30 cursor-not-allowed border-transparent' 
                          : 'border-border-geo hover:bg-white hover:text-primary-geo'
                      }`}
                      title="Promote Priority"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={isLast}
                      className={`p-1.5 rounded-md border text-slate-500 transition-colors ${
                        isLast 
                          ? 'opacity-30 cursor-not-allowed border-transparent' 
                          : 'border-border-geo hover:bg-white hover:text-primary-geo'
                      }`}
                      title="Demote Priority"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom notes box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-dark-geo">
            Personal Flight, Food, or Security Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="E.g., Vegetarian, dreads high cliffs, flight lands on Day 1 at 2:00 PM, highly active early mornings but wants relaxing late evenings."
            className="w-full text-xs rounded-xl border border-border-geo focus:border-primary-geo focus:ring-1 focus:ring-primary-geo p-3 bg-light-geo outline-none placeholder-slate-400 transition-colors text-dark-geo"
          />
          <p className="text-[10px] text-gray-geo font-semibold">
            Detail specific timelines or limitations. Our consensus planner reads and secures them gracefully.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-geo">
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold text-dark-geo uppercase tracking-widest px-5 py-2.5 rounded-full border border-border-geo hover:bg-light-geo transition-colors shrink-0 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-[10px] font-bold text-white bg-primary-geo hover:bg-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-md cursor-pointer transition-all flex items-center gap-1.5 shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            Save DNA Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
