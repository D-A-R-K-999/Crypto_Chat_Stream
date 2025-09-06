import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Key, UserPlus } from 'lucide-react';
import { generateKeyPair, exportKeyPair, type SerializedKeyPair } from '@/lib/encryption';

interface LoginFormProps {
  onLogin: (username: string, keyPair: SerializedKeyPair) => void;
  isConnecting: boolean;
}

export function LoginForm({ onLogin, isConnecting }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) return;

    try {
      setIsGeneratingKeys(true);
      
      // Generate encryption keys
      const keyPair = await generateKeyPair();
      const serializedKeys = await exportKeyPair(keyPair);
      
      onLogin(username.trim(), serializedKeys);
    } catch (error) {
      console.error('Failed to generate keys:', error);
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ background: 'var(--gradient-bg)' }}>
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">SecureChat</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              End-to-end encrypted messaging
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Choose a username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isConnecting || isGeneratingKeys}
                className="h-12"
                autoComplete="username"
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                <span>Your encryption keys will be generated automatically</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Keys are generated locally and never leave your device
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              style={{ background: 'var(--gradient-primary)' }}
              disabled={!username.trim() || isConnecting || isGeneratingKeys}
            >
              {isGeneratingKeys ? (
                <>
                  <Key className="w-4 h-4 mr-2 animate-spin" />
                  Generating Keys...
                </>
              ) : isConnecting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join SecureChat
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}