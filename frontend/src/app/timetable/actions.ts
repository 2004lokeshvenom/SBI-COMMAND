"use server";

import { TimetableResponse } from "@/types/timetable";
import { TimeBlock } from "@/lib/scheduleEngine";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateAITimetable(startTimeMs: number): Promise<TimetableResponse> {
  try {
    const now = new Date(startTimeMs);
    
    // --- FIX: WE DO THE ROUNDING IN THE BACKEND ---
    // Round down to the nearest 10 minutes (e.g., 10:13 becomes 10:10)
    now.setMinutes(Math.floor(now.getMinutes() / 10) * 10, 0, 0);
    // ----------------------------------------------

    const currentHour = now.getHours(); // 0-23 format
    const startTimeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    let targetHours = 0;
    let expectedEndTime = "";

    if (currentHour < 11) {
      targetHours = 9;
      expectedEndTime = "12:00 AM (Midnight)";
    } else if (currentHour >= 11 && currentHour < 13) {
      targetHours = 8;
      expectedEndTime = "1:30 AM";
    } else if (currentHour >= 13 && currentHour < 15) {
      targetHours = 7;
      expectedEndTime = "2:00 AM";
    } else if (currentHour >= 15 && currentHour < 17) {
      targetHours = 6;
      expectedEndTime = "3:00 AM";
    } else {
      return {
        success: false,
        error: "Come tomorrow early morning. Wasted a lot of time till now."
      };
    }

    const prompt = `You are a strict, highly logical AI scheduling algorithm. Your single purpose is to generate a mathematically perfect daily study timetable.

**HARD ANCHOR INPUT VARIABLES FOR TIME CONSTRAINTS:**
- Current Time: ${startTimeStr}
- Target Focus Time: ${targetHours * 60} minutes
- Expected End Time: Roughly ${expectedEndTime}

**HARD ANCHOR TIMESTAMPS (CRITICAL):**
You MUST use these exact readable times for meals.
- Lunch: 01:00 PM to 02:00 PM
- Dinner: 09:00 PM to 10:00 PM

**CRITICAL TIMELINE RULES:**
1. **Continuous Timeline:** There must be ZERO gaps and ZERO overlaps between blocks. Every block's \`endTime\` MUST perfectly match the next block's \`startTime\`.
2. **Readable Time Format:** Provide \`startTime\` and \`endTime\` in human-readable "HH:MM AM/PM" format (e.g., "02:30 PM"). DO NOT use Unix timestamps or milliseconds.

**BLOCK TYPE CONSTRAINTS:**
1. **Fixed Meals (Non-Negotiable):**
   - **Lunch (\`type: "lunch"\`):** If the schedule starts before 01:00 PM, you MUST insert a exactly 60-minute block where \`startTime\` is "01:00 PM" and \`endTime\` is "02:00 PM".
   - **Dinner (\`type: "dinner"\`):** You MUST insert a 60-minute block where \`startTime\` is "09:00 PM" and \`endTime\` is "10:00 PM".
2. **Warmup (\`type: "warmup"\`):**
   - The schedule MUST start with exactly ONE 50-minute warmup block EXACTLY at ${startTimeStr}. 
   - *Note:* This block has \`isFocusBlock: true\`, but its 50 minutes DO NOT count toward the ${targetHours * 60} minute focus target.
3. **Primary Study (\`type: "study"\`):**
   - ALL study blocks MUST be exactly 90 minutes long.
   - *Exception:* Only the VERY LAST study block of the day can be adjusted (shorter or longer, in 10-minute increments) to ensure the sum of all "study" block durations equals exactly ${targetHours * 60} minutes. 
   - These are the ONLY blocks that count toward the target.
4. **Breaks (\`type: "break"\`):**
   - Insert breaks to seamlessly bridge the time between study slots and meal times.
   - Break durations must be 10, 20, or 30 minutes to ensure 10-minute rounding.
5. **10-Minute Boundary Rule (CRITICAL):**
   - The "Current Time" provided above is ALREADY rounded perfectly. You MUST start exactly at that time.
   - ALL generated time slots across the entire schedule MUST have a \`durationMinutes\` that is an exact multiple of 10 (e.g., 10, 20, 50, 60, 90).
   - Consequently, EVERY single \`startTime\` and \`endTime\` MUST end in :00, :10, :20, :30, :40, or :50. Do NOT generate any times ending in numbers like 13, 15, or 37.

**JSON OUTPUT FORMAT:**
Return EXACTLY a valid JSON array of objects matching the interface below. 
Do NOT wrap the output in markdown code blocks (no \` \`\`\`json \`\`\` \`). Do NOT include any conversational text.

[
  {
    "id": "uuid",
    "type": "warmup" | "study" | "break" | "lunch" | "dinner",
    "label": "String",
    "description": "String",
    "emoji": "String",
    "startTime": "String (HH:MM AM/PM)",
    "endTime": "String (HH:MM AM/PM)",
    "durationMinutes": Number,
    "isFocusBlock": Boolean
  }
]`;

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not defined. Get a free key at console.groq.com and add it to your .env file.");
    }

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Groq API Error:", response.status, errBody);
      throw new Error(`Groq API returned ${response.status}: ${errBody.substring(0, 200)}`);
    }

    const data = await response.json();
    let body = data.choices?.[0]?.message?.content;
    if (!body) throw new Error("No response content from Groq AI");

    console.log("\n================ GROQ API RESPONSE ================\n");
    console.log(body);
    console.log("\n===================================================\n");

    // Clean up potential markdown formatting if the LLM ignores instructions
    body = body.trim();
    if (body.startsWith("```json")) {
      body = body.replace(/^```json/, "").replace(/```$/, "");
    } else if (body.startsWith("```")) {
      body = body.replace(/^```/, "").replace(/```$/, "");
    }
    
    // Some models may prefix with "Here is the JSON..." before the array starts
    const arrayStartIndex = body.indexOf("[");
    const arrayEndIndex = body.lastIndexOf("]");
    if (arrayStartIndex !== -1 && arrayEndIndex !== -1 && arrayEndIndex > arrayStartIndex) {
      body = body.substring(arrayStartIndex, arrayEndIndex + 1);
    }

    const parsedData = JSON.parse(body);
    const parsedBlocks = Array.isArray(parsedData) ? parsedData : (parsedData.blocks || []);

    if (parsedBlocks.length === 0) {
      throw new Error("AI returned an empty schedule. Please try again.");
    }
    
    // Helper to carefully parse LLM string times back into absolute ms
    let currentDayMarker = new Date(startTimeMs);
    currentDayMarker.setHours(0, 0, 0, 0);

    function parseTimeStr(timeStr: any, prevMs: number): number | null {
      if (!timeStr || typeof timeStr !== 'string') return null;
      const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return null;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const ampm = match[3]?.toUpperCase();
      
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      
      const d = new Date(currentDayMarker);
      d.setHours(h, m, 0, 0);
      let ms = d.getTime();
      
      // If we jumped backward by more than 4 hours, we likely crossed midnight
      while (ms < prevMs - 4 * 3600 * 1000) {
         currentDayMarker.setDate(currentDayMarker.getDate() + 1);
         const nd = new Date(currentDayMarker);
         nd.setHours(h, m, 0, 0);
         ms = nd.getTime();
      }
      return ms;
    }

    // Sequential fallback cursor in case LLM math is wrong or unparseable
    // --- FIX: Base cumulativeCursor on the ROUNDED time too ---
    let cumulativeCursor = now.getTime(); 

    const blocks: TimeBlock[] = parsedBlocks.map((b: any) => {
      const dur = Number(b.durationMinutes);
      
      const parsedSt = parseTimeStr(b.startTime, cumulativeCursor);
      const st = parsedSt !== null ? parsedSt : cumulativeCursor;
      
      const parsedEt = parseTimeStr(b.endTime, st);
      const et = parsedEt !== null ? parsedEt : (st + (dur * 60000));
      
      cumulativeCursor = et;

      return {
        id: b.id || Math.random().toString(36).substring(7),
        type: b.type,
        label: b.label,
        description: b.description,
        emoji: b.emoji,
        startTime: st,
        endTime: et,
        durationMinutes: dur,
        isFocusBlock: b.type === "study" || b.type === "warmup"
      } as TimeBlock;
    });

    return {
      success: true,
      blocks
    };
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return {
      success: false,
      error: err.message || "Failed to generate timetable"
    };
  }
}