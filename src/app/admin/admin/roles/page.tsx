interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: (string | { resource?: string; name?: string; _id?: string })[];
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}
