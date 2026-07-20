export interface NotificationResponse {
  id: string;
  organizationId: string;
  userId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
}

export interface ListNotificationsResult {
  notifications: NotificationResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
