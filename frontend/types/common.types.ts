export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName?: string | null;
}