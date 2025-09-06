import React, { useState } from 'react';
import UserList from '@/components/chat/UserList';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { useChat } from '@/hooks/useChat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChatPage: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [inputUsername, setInputUsername] = useState('');
  const { users, messages, sendMessage } = useChat(username);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      setUsername(inputUsername.trim());
    }
  };

  if (!username) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <form onSubmit={handleLogin} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="text"
            placeholder="Enter your username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          <Button type="submit">Join Chat</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/4 border-r">
        <UserList
          users={users.filter(u => u.username !== username)}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>
      <div className="flex flex-col w-3/4">
        <MessageList messages={messages} />
        <MessageInput
          onSendMessage={sendMessage}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  );
};

export default ChatPage;
