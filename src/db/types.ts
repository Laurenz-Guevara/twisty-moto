export interface User {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: Date;
  read: boolean;
  category: string;
  priority: string;
  actionLabel: string;
  actionUrl: string;
}
