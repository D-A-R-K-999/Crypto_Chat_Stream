import { formatDistanceToNow } from 'date-fns';
import { Lock, Check } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  isDecrypted: boolean;
  isOwn: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isOwn = message.isOwn;

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isOwn 
          ? 'bg-[hsl(var(--message-sent))] text-[hsl(var(--message-sent-foreground))] rounded-br-md' 
          : 'bg-[hsl(var(--message-received))] text-[hsl(var(--message-received-foreground))] rounded-bl-md'
      }`}>
        {!isOwn && (
          <div className="text-xs text-muted-foreground mb-1 font-medium">
            {message.sender}
          </div>
        )}
        
        <div className="break-words">
          {message.isDecrypted ? (
            message.text
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span className="text-sm italic">Encrypted message</span>
            </div>
          )}
        </div>
        
        <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
          {isOwn && <Check className="w-3 h-3" />}
        </div>
      </div>
    </div>
  );
}