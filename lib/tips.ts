export type Mood = "sad" | "angry" | "relaxed" | "happy";

export interface MoodInfo {
  label: string;
  emoji: string;
  colorClass: string;
  barClass: string;
  message: string;
  tip: string;
}

export const MOOD_INFO: Record<Mood, MoodInfo> = {
  happy: {
    label: "Happy",
    emoji: "🐶",
    colorClass: "bg-amber-100 text-amber-800 border-amber-200",
    barClass: "bg-amber-400",
    message: "Your dog looks happy and upbeat!",
    tip: "Great time for praise, interactive play, a short training session, or an outdoor walk."
  },
  relaxed: {
    label: "Relaxed",
    emoji: "😌",
    colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    barClass: "bg-emerald-400",
    message: "Your dog looks relaxed (maybe sleepy or resting).",
    tip: "Let your dog rest peacefully in a comfortable spot without unnecessary disturbance."
  },
  sad: {
    label: "Sad",
    emoji: "🥺",
    colorClass: "bg-blue-100 text-blue-800 border-blue-200",
    barClass: "bg-blue-400",
    message: "Your dog may be feeling down or low-energy.",
    tip: "Offer gentle reassurance and bonding time. If this mood persists alongside appetite or behavior changes, consult a veterinarian."
  },
  angry: {
    label: "Angry",
    emoji: "😠",
    colorClass: "bg-red-100 text-red-800 border-red-200",
    barClass: "bg-red-500",
    message: "Your dog appears tense or agitated.",
    tip: "Safety first: give your dog space, avoid reaching toward its face, and calmly remove nearby triggers."
  }
};
