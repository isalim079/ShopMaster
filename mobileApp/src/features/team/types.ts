export type TeamMember = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTeamMemberInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  roleSlug: 'MANAGER' | 'EMPLOYEE';
};
