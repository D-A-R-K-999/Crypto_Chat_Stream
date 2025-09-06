import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  username: string;
}

interface UserListProps {
  users: User[];
  selectedUser: string | null;
  onUserSelect: (username: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUser, onUserSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Users</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {users.map((user) => (
            <li
              key={user.username}
              onClick={() => onUserSelect(user.username)}
              className={`p-2 cursor-pointer rounded-md ${
                selectedUser === user.username ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UserList;
