import React from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: string;
  isOwn: boolean;
  isDecrypted: boolean;
}

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn('flex mb-4', {
            'justify-end': message.isOwn,
            'justify-start': !message.isOwn,
          })}
        >
          <div
            className={cn('rounded-lg px-4 py-2 max-w-lg', {
              'bg-primary text-primary-foreground': message.isOwn,
              'bg-muted': !message.isOwn,
              'border-red-500 border': !message.isDecrypted,
            })}
          >
            {!message.isOwn && (
              <p className="text-sm font-semibold mb-1">{message.sender}</p>
            )}
            <p>{message.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
