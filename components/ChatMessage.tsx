
import React from 'react';
import type { Message } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content } = message;

  const isUser = role === 'user';
  const isModel = role === 'model';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="text-center text-sm text-red-400 px-4 py-1 bg-red-900/50 rounded-md mx-auto max-w-md">
        {content}
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <BotIcon />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-xl px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 rounded-br-none'
            : 'bg-gray-700 rounded-bl-none'
        }`}
      >
        <p className="text-white whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
