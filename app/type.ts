export type Container = {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  image: string;
  createdAt?: string;
  // add other fields as needed
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  // add other fields as needed
}; 