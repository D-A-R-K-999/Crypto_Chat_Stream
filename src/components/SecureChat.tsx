import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { LoginForm } from './LoginForm';
import { ChatInterface } from './ChatInterface';
import { UserList } from './UserList';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/lib/socket';
import { 
  encryptMessage, 
  decryptMessage, 
  importKeyPair, 
  importPublicKey, 
  type SerializedKeyPair 
} from '@/lib/encryption';

interface User {
  username: string;
  publicKey: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  isDecrypted: boolean;
  isOwn: boolean;
}

export function SecureChat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userKeys, setUserKeys] = useState<SerializedKeyPair | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { toast } = useToast();

  const handleLogin = useCallback(async (username: string, keyPair: SerializedKeyPair) => {
    try {
      setIsConnecting(true);
      
      // Connect to socket
      const newSocket = socketService.connect();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        
        newSocket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        newSocket.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      // Register user
      socketService.register(username, keyPair.publicKey);
      
      setSocket(newSocket);
      setCurrentUser(username);
      setUserKeys(keyPair);

      // Set up event listeners
      setupSocketListeners(newSocket, keyPair, username);
      
    } catch (error) {
      console.error('Failed to connect:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the chat server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const setupSocketListeners = useCallback((socket: Socket, keyPair: SerializedKeyPair, loggedInUser: string) => {
    socket.on('user_list_update', (userList: Record<string, string>) => {
      const userArray = Object.entries(userList).map(([username, publicKey]) => ({
        username,
        publicKey,
        isOnline: true,
      }));
      setUsers(userArray);
    });

    // Load persisted chat history and decrypt it into local message bubbles
    socket.on('chat_history', async (history: Array<{ from: string; to: string; message: string }>) => {
      try {
        const keyPairObj = await importKeyPair(keyPair);
        const decrypted = await Promise.all(
          history.map(async (msg) => {
            const isOwn = msg.from === loggedInUser;
            try {
              const text = await decryptMessage(msg.message, keyPairObj.privateKey);
              return {
                id: `${Date.now()}-${Math.random()}`,
                text,
                sender: msg.from,
                recipient: isOwn ? msg.to : loggedInUser,
                timestamp: new Date(),
                isDecrypted: true,
                isOwn,
              } as Message;
            } catch {
              return {
                id: `${Date.now()}-${Math.random()}`,
                text: 'Failed to decrypt message',
                sender: msg.from,
                recipient: isOwn ? msg.to : loggedInUser,
                timestamp: new Date(),
                isDecrypted: false,
                isOwn,
              } as Message;
            }
          })
        );
        setMessages(decrypted);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    });

    socket.on('new_private_message', async (data: { from: string; message: string }) => {
      try {
        // Ignore echo for sender; we already add the bubble locally on send
        if (loggedInUser === data.from) {
          return;
        }

        // Auto-select the sender if no conversation is open yet
        setSelectedUser(prev => prev ?? data.from);

        // Decrypt the message
        const keyPairObj = await importKeyPair(keyPair);
        const decryptedText = await decryptMessage(data.message, keyPairObj.privateKey);
        
        const message: Message = {
          id: `${Date.now()}-${Math.random()}`,
          text: decryptedText,
          sender: data.from,
          recipient: loggedInUser,
          timestamp: new Date(),
          isDecrypted: true,
          isOwn: false,
        };

        setMessages(prev => [...prev, message]);
        
        // Show notification if not currently chatting with sender
        if (selectedUser !== data.from) {
          toast({
            title: `New message from ${data.from}`,
            description: decryptedText.length > 50 ? `${decryptedText.substring(0, 50)}...` : decryptedText,
          });
        }
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        
        const message: Message = {
          id: `${Date.now()}-${Math.random()}`,
          text: 'Failed to decrypt message',
          sender: data.from,
          recipient: currentUser || '',
          timestamp: new Date(),
          isDecrypted: false,
          isOwn: false,
        };

        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('error', (data: { message: string }) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    });

    socket.on('disconnect', () => {
      toast({
        title: "Disconnected",
        description: "Connection to server lost",
        variant: "destructive",
      });
    });
  }, [currentUser, selectedUser, toast]);

  const handleSendMessage = useCallback(async (recipient: string, messageText: string) => {
    if (!socket || !userKeys) return;

    try {
      // Find recipient's public key
      const recipientUser = users.find(user => user.username === recipient);
      if (!recipientUser) {
        throw new Error('Recipient not found');
      }

      // Encrypt message with recipient's public key
      const recipientPublicKey = await importPublicKey(recipientUser.publicKey);
      const encryptedMessage = await encryptMessage(messageText, recipientPublicKey);

      // Send encrypted message
      socketService.sendPrivateMessage(recipient, encryptedMessage);

      // Add message to local state (for sender)
      const message: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text: messageText,
        sender: currentUser || '',
        recipient,
        timestamp: new Date(),
        isDecrypted: true,
        isOwn: true,
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [socket, userKeys, users, currentUser, toast]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (socket) {
        socketService.disconnect();
      }
    };
  }, [socket]);

  const handleLogout = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setCurrentUser(null);
    setUserKeys(null);
    setUsers([]);
    setSelectedUser(null);
    setMessages([]);
  }, []);

  if (!currentUser || !socket) {
    return <LoginForm onLogin={handleLogin} isConnecting={isConnecting} />;
  }

  return (
    <div className="h-screen flex bg-background">
      {/* User List Sidebar */}
      <div className="w-80 border-r border-border/50 p-4 bg-[hsl(var(--sidebar-bg))]">
        <UserList
          users={users}
          currentUser={currentUser}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          selectedUser={selectedUser}
          currentUser={currentUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}