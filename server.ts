import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize server-side Gemini client
  // It handles missing API key gracefully by allowing fallback generation instead of crashing server load
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('Gemini AI client successfully initialized server-side');
    } catch (e) {
      console.error('Failed to initialize server-side Gemini Client:', e);
    }
  } else {
    console.log('No valid GEMINI_API_KEY found in process.env. Server will run in smart procedural fallback mode.');
  }

  // API Route: Check Health & Key Status
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: !!(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    });
  });

  // API Route: Generate Cohesive Travel Itinerary
  app.post('/api/generate-itinerary', async (req, res) => {
    const { name, destination, startDate, endDate, members } = req.body;

    if (!destination || !startDate || !endDate || !members || !members.length) {
      return res.status(400).json({ error: 'Missing required trip parameters: destination, dates, or members list.' });
    }

    // Try Gemini generation first if client is available
    if (ai) {
      try {
        console.log(`Querying Gemini (gemini-3.5-flash) to generate itinerary for ${destination}...`);
        
        // Build textual prompt with details of members and preferences
        const membersPromptText = members.map((m: any) => {
          const preferencesText = m.preferences
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((p: any) => `${p.label} (Rank ${p.rank})`)
            .join(', ');
          return `Member: ${m.name} (ID: ${m.id}), Email: ${m.email}, Lead: ${m.isLeader ? 'Yes' : 'No'}. Preferences ordered: ${preferencesText}. Notes: ${m.customNotes || 'None'}`;
        }).join('\n');

        const prompt = `
Generate a cohesive travel itinerary and individual side activity recommendations for a group trip.

Trip Details:
Trip Name: ${name || 'Our Adventure'}
Destination: ${destination}
Dates: ${startDate} to ${endDate}

Travellers & Preferences:
${membersPromptText}

Your Requirements:
1. Generate an overall unified main itinerary ("days" field) that brings everyone together for group activities (e.g., group dining, iconic sights, leisure strolls) that find a balance between their varying preferences (adventure, leisure, food, culture, etc.).
2. If some team members have highly diverging preferences (e.g., Sarah loves museum culture but John hates it and loves extreme adventure), schedule smart parallel options: one event might be "isGroupActivity: false" and targeted specifically at John for the morning, while Sarah explores a cultural museum, followed by a joint lunch.
3. For each activity, include a unique ID (e.g. "act-1"), a clean logical time (like "09:00 AM", "Afternoon", "Evening"), title, description (explaining why it appeals to specific members or fits the consensus), location, and of course "isGroupActivity".
4. Provide structured "individualRecommendations" in a separate sidebar: 1-2 distinct side-trips or specialized recommendations for each single traveler based on their top ranked preferences and notes. These are customized, high-relevance additions they can do individually.
5. Create exactly 3 secure, practical travel or safety tips for this target destination to safeguard/secure the trip ("securityTips").
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an advanced group travel itinerary synthesizer and security planner. You specialize in consensus-building, designing paths that harmonize highly divergent group interests, offering custom split-tracks when needed, and ensuring travel security and safety.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              required: ['destination', 'summary', 'securityTips', 'days', 'individualRecommendations'],
              properties: {
                destination: { type: Type.STRING },
                summary: { 
                  type: Type.STRING, 
                  description: 'A detailed executive summary (2-3 sentences) explaining how this itinerary harmonizes all traveler preferences (e.g., consensus, split blocks, custom highlights) and ensures safety.' 
                },
                securityTips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Exactly 3 secure travel safety guidelines specific to this destination.'
                },
                days: {
                  type: Type.ARRAY,
                  description: 'Day-by-day unified planning',
                  items: {
                    type: Type.OBJECT,
                    required: ['day', 'date', 'theme', 'activities'],
                    properties: {
                      day: { type: Type.INTEGER },
                      date: { type: Type.STRING },
                      theme: { type: Type.STRING },
                      activities: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ['id', 'time', 'title', 'description', 'isGroupActivity', 'type'],
                          properties: {
                            id: { type: Type.STRING },
                            time: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            location: { type: Type.STRING },
                            duration: { type: Type.STRING },
                            isGroupActivity: { type: Type.BOOLEAN },
                            targetedMembers: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: 'List of member names or empty if for all'
                            },
                            type: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  }
                },
                individualRecommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ['id', 'memberId', 'memberName', 'title', 'description', 'type'],
                    properties: {
                      id: { type: Type.STRING },
                      memberId: { type: Type.STRING },
                      memberName: { type: Type.STRING },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING },
                      location: { type: Type.STRING },
                      bestFitTime: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const result = JSON.parse(textOutput.trim());
          return res.json({
            source: 'gemini',
            itinerary: result,
          });
        }
      } catch (geminiError) {
        console.error('Gemini API execution failed, switching to backup procedural generator:', geminiError);
      }
    }

    // Fallback: Smart Procedural Planner (guarantees zero crashes and works without an API key nicely)
    console.log('Generating itinerary using procedural algorithm (Offline / Offline-Fallback Mode)...');
    
    // Simple mock procedural responses
    const daysCount = Math.max(1, Math.min(7, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1));
    const datesStr: string[] = [];
    const dateObj = new Date(startDate);
    for (let d = 0; d < daysCount; d++) {
      datesStr.push(dateObj.toISOString().split('T')[0]);
      dateObj.setDate(dateObj.getDate() + 1);
    }

    // Pull high preferences for members
    const mainCategories = members.map((m: any) => {
      const topPref = m.preferences.sort((a: any, b: any) => a.rank - b.rank)[0];
      return { memberName: m.name, memberId: m.id, top: topPref ? topPref.category : 'leisure' };
    });

    const days: any[] = [];
    for (let idx = 0; idx < daysCount; idx++) {
      const dayNum = idx + 1;
      const date = datesStr[idx] || startDate;

      let theme = 'Local Explorer Day';
      let dayActivities: any[] = [];

      if (idx === 0) {
        theme = 'Arrival & Evening Vibe';
        dayActivities = [
          {
            id: `back-act-${dayNum}-1`,
            time: '02:00 PM',
            title: `Check-in & Relax at ${destination} Stay`,
            description: 'Unpack, settle down, and recover from the journey. Enjoy the property amenities.',
            location: 'Stay / Central Hotel',
            duration: '2 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: 'leisure'
          },
          {
            id: `back-act-${dayNum}-2`,
            time: '06:30 PM',
            title: 'Welcome Dinner & Taste of the Town',
            description: `All travelers gather for local specialties. Complies with any dietary notes.`,
            location: 'Traditional Restaurant Row',
            duration: '2.5 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: 'food'
          }
        ];
      } else if (idx === daysCount - 1) {
        theme = 'Wander, Souvenirs & Farewells';
        dayActivities = [
          {
            id: `back-act-${dayNum}-1`,
            time: '09:30 AM',
            title: 'Morning Leisure Walk & Gift Hunting',
            description: `A stroll to grab custom memorabilia and local crafts representing ${destination}.`,
            location: 'Old Town Markets',
            duration: '3 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: 'leisure'
          },
          {
            id: `back-act-${dayNum}-2`,
            time: '02:00 PM',
            title: 'Departure prep & airport transit',
            description: 'Pack belongings and head for departure with fond shared memories.',
            location: 'In-Transit',
            duration: '2 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: 'recreation'
          }
        ];
      } else {
        // Core activity days: dynamically craft some activities reflecting user top preferences
        const cycle = idx % Math.max(1, mainCategories.length);
        const focusedPref = mainCategories[cycle];
        const prefType = focusedPref ? focusedPref.top : 'leisure';

        theme = focusedPref 
          ? `Consensus Day: Focus on ${focusedPref.memberName}'s Favorite Highlight (${prefType.toUpperCase()})`
          : 'Scenic Group Discoveries';

        dayActivities = [
          {
            id: `back-act-${dayNum}-1`,
            time: '09:00 AM',
            title: `Signature Group Highlight - Grand Explore`,
            description: `An immersive excursion in ${destination} centered on ${prefType}. Beautifully satisfies interests.`,
            location: 'Central Landmark',
            duration: '4 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: prefType
          },
          {
            id: `back-act-${dayNum}-2`,
            time: '02:00 PM',
            title: `Split Afternoon - Adventure vs. Chill`,
            description: 'A dedicated block where members spend 3 hours pursuing split-interest activities before coming back for dinner.',
            location: 'Activity Center / Cafe District',
            duration: '3 hours',
            isGroupActivity: false,
            targetedMembers: mainCategories.slice(0, 2).map(m => m.memberName),
            type: 'recreation'
          },
          {
            id: `back-act-${dayNum}-3`,
            time: '07:00 PM',
            title: 'Twilight Food Exploration & Sharing Stories',
            description: 'Gather to swap findings, enjoy delicious meals, and rest up for tomorrow.',
            location: 'Riverside Street Food Stalls',
            duration: '2 hours',
            isGroupActivity: true,
            targetedMembers: [],
            type: 'food'
          }
        ];
      }

      days.push({
        day: dayNum,
        date,
        theme,
        activities: dayActivities
      });
    }

    // Build side individual recommendations based on preferences
    const individualRecommendations = members.flatMap((m: any, mIdx: number) => {
      const sortedPrefs = m.preferences.sort((a: any, b: any) => a.rank - b.rank);
      const topPref = sortedPrefs[0]?.category || 'leisure';
      const secondPref = sortedPrefs[1]?.category || 'food';

      const recs = [
        {
          id: `indiv-rec-${m.id}-1`,
          memberId: m.id,
          memberName: m.name,
          title: `Exclusive ${m.name} Spot - ${topPref.toUpperCase()} Tour`,
          description: `A highly-reviewed specific encounter centered around ${topPref}. Fits your comments: "${m.customNotes || 'highly customized'}".`,
          type: topPref,
          location: 'Varies based on city guide',
          bestFitTime: 'Day 2 Free afternoon block'
        }
      ];

      // Add a food one too
      if (secondPref && secondPref !== topPref) {
        recs.push({
          id: `indiv-rec-${m.id}-2`,
          memberId: m.id,
          memberName: m.name,
          title: `Custom Dining Recommendation - Secondary ${secondPref.toUpperCase()}`,
          description: `An artisan spot to experience elite culinary flavors fitting your specific search preference.`,
          type: secondPref,
          location: 'Gourmet Row',
          bestFitTime: 'Day 3 Dinner break'
        });
      }

      return recs;
    });

    const mockSecurityTips = [
      `Secure your personal items: Keep passports and extra money locked in your group accommodation safe and carry only soft copies or secure digital wallets.`,
      `Verify travel transits ahead: Always check with accredited group shuttle lines or licensed rideapps when leaving the airport/hotel area in ${destination}.`,
      `Stay updated on weather/local conditions: Designate the group leader to check for localized safety briefs daily to ensure continuous coordination.`
    ];

    const fallbackItinerary = {
      destination,
      summary: `Coordinated journey in ${destination} for ${members.map((m: any) => m.name).join(', ')}. This fallback itinerary uses a compromise algorithm to align your ranked preferences for food, adventure, and relaxation, safely planning group activities alongside split-tracks limit blocks.`,
      securityTips: mockSecurityTips,
      days,
      individualRecommendations
    };

    res.json({
      source: 'offline-fallback',
      itinerary: fallbackItinerary,
      notes: 'No Gemini key set, or default error occurred. Enjoy this procedural result!'
    });
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
