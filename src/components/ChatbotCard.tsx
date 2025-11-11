import { Bot, Calendar, MessageSquare } from 'lucide-react';
import type { Chatbot } from '../types';

interface ChatbotCardProps {
  chatbot: Chatbot;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export default function ChatbotCard({ chatbot, onSelect, isSelected }: ChatbotCardProps) {
  return (
    <div
      onClick={() => onSelect(chatbot._id)}
      className={`card cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary-500 border-primary-500' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100' : 'bg-gray-100'}`}>
            <Bot className={`w-6 h-6 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{chatbot.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{chatbot.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(chatbot.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageSquare className="w-3 h-3" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}

