
export type Role = 'user' | 'model' | 'system';

export interface Message {
  role: Role;
  content: string;
}
