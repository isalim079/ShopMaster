export interface UploadResponse {
  id: string;
  organizationId: string;
  userId: string | null;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string | null;
  createdAt: Date;
}

export interface ListUploadsResult {
  uploads: UploadResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
