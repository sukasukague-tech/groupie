import React from 'react';
import { Calendar, Users, Cpu, ShieldCheck } from 'lucide-react';

interface StepHeaderProps {
  currentStatus: 'setup' | 'preferences' | 'itinerary' | 'published';
  onReset?: () => void;
}

export default function StepHeader({ currentStatus, onReset }: StepHeaderProps) {
  const steps = [
    {
      id: 'setup',
      label: '1. Setup Trip',
      sub: 'Leader registry details',
      icon: Calendar,
      activeColor: 'bg-primary-geo text-white ring-2 ring-primary-geo/20'
    },
    {
      id: 'preferences',
      label: '2. Travel Surveys',
      sub: 'Parallel member votes',
      icon: Users,
      activeColor: 'bg-primary-geo text-white ring-2 ring-primary-geo/20'
    },
    {
      id: 'itinerary',
      label: '3. Consensus Engine',
      sub: 'AI Itinerary harmony',
      icon: Cpu,
      activeColor: 'bg-primary-geo text-white ring-2 ring-primary-geo/20'
    },
    {
      id: 'published',
      label: '4. Publish & Secure',
      sub: 'Locked flight & guides',
      icon: ShieldCheck,
      activeColor: 'bg-primary-geo text-white ring-2 ring-primary-geo/20'
    },
  ];

  const getStatusIndex = (status: string) => {
    if (status === 'setup') return 0;
    if (status === 'preferences') return 1;
    if (status === 'itinerary') return 2;
    return 3;
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <header className="h-16 border-b border-border-geo bg-white flex items-center sticky top-0 z-40 px-6 sm:px-8 shrink-0">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-geo rounded-lg flex items-center justify-center text-white shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold tracking-tight uppercase leading-none font-display text-dark-geo">
              Group Travel Planner
            </h1>
            <p className="text-[9px] text-gray-geo tracking-[0.14em] uppercase font-bold mt-1">
              Concierge AI Setup
            </p>
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="hidden md:flex items-center gap-4 overflow-x-auto pb-0">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                      isActive 
                        ? step.activeColor 
                        : isCompleted
                        ? 'bg-primary-geo/10 text-primary-geo border border-primary-geo/20'
                        : 'bg-light-geo text-slate-350 border border-border-geo'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold leading-tight ${isActive ? 'text-dark-geo font-black' : isCompleted ? 'text-gray-geo' : 'text-slate-400'}`}>
                      {step.label}
                    </p>
                    <p className="text-[9px] text-slate-400 leading-none">{step.sub}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-[1px] w-6 shrink-0 ${isCompleted ? 'bg-primary-geo' : 'bg-border-geo'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {currentIndex > 0 && onReset && (
            <button
              onClick={onReset}
              className="text-[10px] text-dark-geo border border-border-geo rounded-full px-4 py-2 font-bold hover:bg-light-geo uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
            >
              Reset Trip
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
