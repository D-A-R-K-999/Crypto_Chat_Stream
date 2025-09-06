import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Shield, LogOut } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  text: string;
  sender: string;
  recipient: string;
  timestamp: Date;
  isDecrypted: boolean;
  isOwn: boolean;
}

interface ChatInterfaceProps {
  selectedUser: string | null;
  currentUser: string;
  messages: Message[];
  onSendMessage: (recipient: string, message: string) => void;
  onLogout: () => void;
}

export function ChatInterface({ 
  selectedUser, 
  currentUser, 
  messages, 
  onSendMessage, 
  onLogout 
}: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedUser || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(selectedUser, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const chatMessages = messages.filter(msg => 
    (msg.sender === currentUser && msg.recipient === selectedUser) ||
    (msg.sender === selectedUser && msg.recipient === currentUser)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">SecureChat</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Logged in as <span className="font-medium">{currentUser}</span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 rounded-t-none border-t-0 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {selectedUser.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedUser}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      End-to-end encrypted
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-[hsl(var(--chat-background))]">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="space-y-3">
                      <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50" />
                      <div>
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">
                          Start a secure conversation with {selectedUser}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`Send a secure message to ${selectedUser}...`}
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={!messageText.trim() || isSending}
                    className="px-4"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="space-y-4">
                <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Select a user to start chatting</h3>
                  <p className="text-muted-foreground">
                    Choose someone from the user list to begin a secure conversation
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}