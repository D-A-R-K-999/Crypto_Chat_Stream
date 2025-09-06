import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import JSEncrypt from 'jsencrypt';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/lib/socket';

interface User {
  username: string;
  publicKey: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  isOwn: boolean;
  isDecrypted: boolean;
}

export const useChat = (username: string | null) => {
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Initialize JSEncrypt and keys
  useEffect(() => {
    if (username) {
      const crypt = new JSEncrypt({ default_key_size: 2048 });
      const storedPrivateKey = localStorage.getItem(`privateKey_${username}`);
      if (storedPrivateKey) {
        crypt.setPrivateKey(storedPrivateKey);
        setPrivateKey(storedPrivateKey);
        setPublicKey(crypt.getPublicKey());
      } else {
        const newPrivateKey = crypt.getPrivateKey();
        setPrivateKey(newPrivateKey);
        setPublicKey(crypt.getPublicKey());
        localStorage.setItem(`privateKey_${username}`, newPrivateKey);
      }
    }
  }, [username]);

  // Connect to socket and register user
  useEffect(() => {
    if (username && publicKey) {
      const newSocket = socketService.connect();
      setSocket(newSocket);
      socketService.register(username, publicKey);

      return () => {
        socketService.disconnect();
      };
    }
  }, [username, publicKey]);

  // Socket event listeners
  useEffect(() => {
    if (socket && privateKey) {
      socket.on('user_list_update', (userList: Record<string, string>) => {
        const userArray = Object.entries(userList).map(([username, publicKey]) => ({
          username,
          publicKey,
        }));
        setUsers(userArray);
      });

      socket.on('new_private_message', (data: { from: string; message: string }) => {
        const crypt = new JSEncrypt();
        crypt.setPrivateKey(privateKey);
        const decryptedText = crypt.decrypt(data.message);

        const newMessage: Message = {
          id: `${Date.now()}-${Math.random()}`,
          text: decryptedText || 'Failed to decrypt message',
          sender: data.from,
          isOwn: false,
          isDecrypted: !!decryptedText,
        };
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Server error:', error.message);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });

      socket.on('chat_history', (history) => {
        const decryptedHistory = history.map((msg: any) => {
          const crypt = new JSEncrypt();
          crypt.setPrivateKey(privateKey);
          const decryptedText = crypt.decrypt(msg.message);

          return {
            id: `${Date.now()}-${Math.random()}`,
            text: decryptedText || 'Failed to decrypt message',
            sender: msg.from,
            isOwn: msg.from === username,
            isDecrypted: !!decryptedText,
          };
        });
        setMessages(decryptedHistory);
      });

      return () => {
        socket.off('user_list_update');
        socket.off('new_private_message');
        socket.off('error');
        socket.off('chat_history');
      };
    }
  }, [socket, privateKey, username, toast]);

  const sendMessage = useCallback((recipient: string, messageText: string) => {
    if (socket && publicKey && username) {
      const recipientUser = users.find((user) => user.username === recipient);
      if (recipientUser) {
        const crypt = new JSEncrypt();
        crypt.setPublicKey(recipientUser.publicKey);
        const encryptedMessage = crypt.encrypt(messageText);

        if (encryptedMessage) {
          socketService.sendPrivateMessage(recipient, encryptedMessage);

          const newMessage: Message = {
            id: `${Date.now()}-${Math.random()}`,
            text: messageText,
            sender: username,
            isOwn: true,
            isDecrypted: true,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      }
    }
  }, [socket, publicKey, users, username]);

  return { users, messages, sendMessage };
};

