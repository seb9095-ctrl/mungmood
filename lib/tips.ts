export type MoodType = 'sad' | 'angry' | 'relaxed' | 'happy';
export interface MoodInfo {
  id: MoodType; label: string; emoji: string;
  colorClass: string; bgClass: string; borderClass: string; tip: string;
}
export const MOOD_ORDER: MoodType[] = ['sad', 'angry', 'relaxed', 'happy'];
export const MOOD_CONFIG: Record<MoodType, MoodInfo> = {
  sad: {
    id: 'sad', label: 'Sad', emoji: '😢',
    colorClass: 'bg-blue-500', bgClass: 'bg-blue-50', borderClass: 'border-blue-200',
    tip: 'Spend some quiet time together, offer a favorite toy, and check whether routine, food, or walks have changed recently. If low mood lasts several days, consult a vet.',
  },
  angry: {
    id: 'angry', label: 'Angry', emoji: '��',
    colorClass: 'bg-red-500', bgClass: 'bg-red-50', borderClass: 'border-red-200',
    tip: 'Give the dog space and avoid reaching toward its face. Remove the likely trigger (other dogs, loud noise, strangers) and let it calm down before interacting.',
  },
  relaxed: {
    id: 'relaxed', label: 'Relaxed', emoji: '😌',
    colorClass: 'bg-emerald-500', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200',
    tip: 'Your dog looks relaxed (maybe sleepy or resting). Keep the environment quiet and let it rest; this is a good time for gentle petting.',
  },
  happy: {
    id: 'happy', label: 'Happy', emoji: '😊',
    colorClass: 'bg-amber-500', bgClass: 'bg-amber-50', borderClass: 'border-amber-200',
    tip: 'Your dog seems happy and engaged. Great moment for play, a short training session, or a walk!',
  },
};
