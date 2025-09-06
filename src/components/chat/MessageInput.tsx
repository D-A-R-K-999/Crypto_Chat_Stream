import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (recipient: string, message: string) => void;
  selectedUser: string | null;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, selectedUser }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (selectedUser) {
      setRecipient(selectedUser);
    }
  }, [selectedUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipient && message) {
      onSendMessage(recipient, message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
      <Input
        type="text"
        placeholder="Recipient"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="mr-2 w-48"
      />
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 mr-2"
      />
      <Button type="submit">Send</Button>
    </form>
  );
};

export default MessageInput;
