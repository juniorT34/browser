export type Container = {
  id: string;
  name: string;
  status: string;
  image: string;
  createdAt: string;
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
};

export type DialogState = {
  type: 'delete' | 'restart' | 'edit';
  entity: 'container' | 'user';
  id: string;
} | null;

export type ContainerForm = Container;
export type UserForm = User;
export type FormErrors = Partial<Record<keyof ContainerForm | keyof UserForm, string>>; 