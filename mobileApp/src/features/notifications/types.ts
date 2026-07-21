export type AppNotification = {
  id: string;
  organizationId: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
};

export type NotificationsQuery = {
  page?: number;
  limit?: number;
  isRead?: 'true' | 'false';
};
