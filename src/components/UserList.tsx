import { Users, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  username: string;
  publicKey: string;
  isOnline: boolean;
}

interface UserListProps {
  users: User[];
  currentUser: string;
  selectedUser: string | null;
  onUserSelect: (username: string) => void;
}

export function UserList({ users, currentUser, selectedUser, onUserSelect }: UserListProps) {
  const otherUsers = users.filter(user => user.username !== currentUser);

  return (
    <Card className="h-full bg-[hsl(var(--sidebar-bg))] border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Online Users
          <span className="text-sm text-muted-foreground ml-auto">
            {otherUsers.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-2">
        {otherUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other users online</p>
            <p className="text-xs mt-1">Waiting for others to join...</p>
          </div>
        ) : (
          otherUsers.map((user) => (
            <button
              key={user.username}
              onClick={() => onUserSelect(user.username)}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-accent/50 ${
                selectedUser === user.username 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Circle 
                    className="absolute -bottom-1 -right-1 w-4 h-4 fill-[hsl(var(--online-indicator))] text-[hsl(var(--online-indicator))] border-2 border-background rounded-full" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}