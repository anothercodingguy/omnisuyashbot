import { CitationItem } from '@/lib/knowledge/grounding';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isInterim?: boolean;
}
