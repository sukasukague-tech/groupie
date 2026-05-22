export interface RankedPreference {
  category: string;
  label: string;
  rank: number; // 1 is highest (most preferred), higher number is lower preference
}

export interface Member {
  id: string;
  name: string;
  email: string;
  isLeader: boolean;
  status: 'pending' | 'completed';
  preferences: RankedPreference[];
  customNotes?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  members: Member[];
  status: 'setup' | 'preferences' | 'itinerary' | 'published';
  itinerary?: GroupItinerary;
}

export interface ItineraryActivity {
  id: string;
  time: string; // e.g. "09:00 AM" or "Morning"
  title: string;
  description: string;
  location?: string;
  duration?: string;
  isGroupActivity: boolean;
  targetedMembers?: string[]; // IDs of members this is highly relevant to
  type: string; // 'leisure' | 'adventure' | 'culture' | 'recreation' | 'food' etc.
}

export interface ItineraryDay {
  day: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface SideRecommendation {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  description: string;
  type: string; // category of preference it satisfies
  location?: string;
  bestFitTime?: string;
}

export interface GroupItinerary {
  tripId: string;
  destination: string;
  summary: string;
  securityTips: string[]; // brief safety tips for security/peace of mind
  days: ItineraryDay[];
  individualRecommendations: SideRecommendation[];
}

export const PRESET_PREFERENCES = [
  { category: 'leisure', label: 'Leisure & Relaxation', description: 'Spa, beach side, slow walks, cafes, and light activities.' },
  { category: 'extreme adventure', label: 'Extreme Adventure', description: 'Skydiving, hiking, bungee jumping, zip-lining, water rafting.' },
  { category: 'culture', label: 'Culture & History', description: 'Museums, historic tours, architecture, heritage sites, art galleries.' },
  { category: 'recreation', label: 'Recreation & Play', description: 'Amusement parks, sightseeing cruises, sports, shopping malls.' },
  { category: 'food', label: 'Food & Dining', description: 'Local street food, wine tasting, culinary workshops, fine dining.' },
  { category: 'nightlife', label: 'Nightlife & Entertainment', description: 'Clubs, bars, live music venues, theaters, night markets.' },
];
