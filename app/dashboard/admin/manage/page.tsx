'use client';
export const dynamic = "force-dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from 'sonner';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import type { Container, User, DialogState, ContainerForm, UserForm, FormErrors } from '@/type';

const mockContainers: Container[] = [
  { id: 'c1', name: 'chromium-1', status: 'running', image: 'lscr.io/linuxserver/chromium:latest', createdAt: '2024-07-01' },
  { id: 'c2', name: 'ubuntu-2', status: 'stopped', image: 'lscr.io/linuxserver/ubuntu-desktop:latest', createdAt: '2024-07-02' },
];
const mockUsers: User[] = [
  { id: 'u1', email: 'admin@ousec.com', fullName: 'Admin User', role: 'admin', createdAt: '2024-07-01' },
  { id: 'u2', email: 'user@ousec.com', fullName: 'Regular User', role: 'user', createdAt: '2024-07-02' },
];

const isAdmin = true; // TODO: Replace with real admin check

function validateContainer(form: ContainerForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.name || form.name.length < 3) errors.name = 'Name is required (min 3 chars)';
  if (!form.status) errors.status = 'Status is required';
  if (!form.image) errors.image = 'Image is required';
  if (!form.createdAt) errors.createdAt = 'Created At is required';
  return errors;
}
function validateUser(form: UserForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.fullName || form.fullName.length < 3) errors.fullName = 'Full name is required (min 3 chars)';
  if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Valid email is required';
  if (!form.role) errors.role = 'Role is required';
  if (!form.createdAt) errors.createdAt = 'Created At is required';
  return errors;
}

function isContainer(obj: unknown): obj is Container {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'status' in obj &&
    'image' in obj
  );
}
function isUser(obj: unknown): obj is User {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'email' in obj &&
    'role' in obj
  );
}

export default function AdminManagePage() {
  const [containers, setContainers] = useState<Container[]>(mockContainers);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [editForm, setEditForm] = useState<ContainerForm | UserForm | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Edit handlers
  const openEditContainer = (container: Container) => {
    setEditForm({ ...container });
    setFormErrors({});
    setDialog({ type: 'edit', entity: 'container', id: container.id });
  };
  const openEditUser = (user: User) => {
    setEditForm({ ...user });
    setFormErrors({});
    setDialog({ type: 'edit', entity: 'user', id: user.id });
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(editForm ? { ...editForm, [e.target.name]: e.target.value } : null);
  };
  const saveEditContainer = () => {
    if (!editForm) return;
    const errors = validateContainer(editForm as ContainerForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setContainers(containers.map(c => c.id === editForm.id ? { ...c, ...(editForm as ContainerForm) } : c));
    toast.success('Container updated');
    setDialog(null);
    setEditForm(null);
    setFormErrors({});
  };
  const saveEditUser = () => {
    if (!editForm) return;
    const errors = validateUser(editForm as UserForm);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setUsers(users.map(u => u.id === editForm.id ? { ...u, ...(editForm as UserForm) } : u));
    toast.success('User updated');
    setDialog(null);
    setEditForm(null);
    setFormErrors({});
  };

  // Confirmed actions
  const confirmDeleteContainer = (id: string) => {
    setContainers(containers.filter(c => c.id !== id));
    toast.success('Container deleted');
    setDialog(null);
  };
  const confirmDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    toast.success('User deleted');
    setDialog(null);
  };
  const confirmRestartContainer = () => {
    toast.success('Container restarted');
    setDialog(null);
  };

  if (!isAdmin) {
    return <div className="max-w-xl mx-auto mt-16 text-center text-xl font-bold text-red-600">Access Denied: Admins only</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-orange-600">Admin Management</h1>
      <Tabs defaultValue="containers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="containers">
          <table className="w-full text-left border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-orange-100 dark:bg-zinc-900">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Status</th>
                <th className="p-2">Image</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {containers.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="p-2">{c.id}</td>
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.status}</td>
                  <td className="p-2">{c.image}</td>
                  <td className="p-2">{c.createdAt}</td>
                  <td className="p-2 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditContainer(c)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      {dialog && dialog.type === 'edit' && dialog.entity === 'container' && dialog.id === c.id && (
                        <DialogContent>
                          <DialogTitle>Edit Container</DialogTitle>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-orange-700">Name</label>
                              <input name="name" value={(editForm as Container)?.name || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.name ? 'border-orange-500' : 'border-gray-300'}`} />
                              {formErrors.name && <p className="text-sm text-orange-600 mt-1">{formErrors.name}</p>}
                            </div>
                            {isContainer(editForm) && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-orange-700">Status</label>
                                  <select name="status" value={editForm.status || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.status ? 'border-orange-500' : 'border-gray-300'}`}>
                                    <option value="">Select status</option>
                                    <option value="running">running</option>
                                    <option value="stopped">stopped</option>
                                  </select>
                                  {formErrors.status && <p className="text-sm text-orange-600 mt-1">{formErrors.status}</p>}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-orange-700">Image</label>
                                  <input name="image" value={editForm.image || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.image ? 'border-orange-500' : 'border-gray-300'}`} />
                                  {formErrors.image && <p className="text-sm text-orange-600 mt-1">{formErrors.image}</p>}
                                </div>
                              </>
                            )}
                            <div>
                              <label className="block text-sm font-medium mb-1 text-orange-700">Created At</label>
                              <input name="createdAt" type="date" value={editForm?.createdAt || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.createdAt ? 'border-orange-500' : 'border-gray-300'}`} />
                              {formErrors.createdAt && <p className="text-sm text-orange-600 mt-1">{formErrors.createdAt}</p>}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => { setDialog(null); setEditForm(null); setFormErrors({}); }}>Cancel</Button>
                            <Button variant="default" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={saveEditContainer}>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" onClick={() => setDialog({ type: 'restart', entity: 'container', id: c.id })}>
                          Restart
                        </Button>
                      </DialogTrigger>
                      {dialog && dialog.type === 'restart' && dialog.entity === 'container' && dialog.id === c.id && (
                        <DialogContent>
                          <DialogTitle>Restart Container</DialogTitle>
                          <div>Are you sure you want to restart container <b>{c.name}</b>?</div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => confirmRestartContainer()}>Restart</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setDialog({ type: 'delete', entity: 'container', id: c.id })}>
                          Delete
                        </Button>
                      </DialogTrigger>
                      {dialog && dialog.type === 'delete' && dialog.entity === 'container' && dialog.id === c.id && (
                        <DialogContent>
                          <DialogTitle>Delete Container</DialogTitle>
                          <div>Are you sure you want to delete container <b>{c.name}</b>? This action cannot be undone.</div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => confirmDeleteContainer(c.id)}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        <TabsContent value="users">
          <table className="w-full text-left border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-orange-100 dark:bg-zinc-900">
                <th className="p-2">ID</th>
                <th className="p-2">Full Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Created At</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.fullName}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.createdAt}</td>
                  <td className="p-2 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      {dialog && dialog.type === 'edit' && dialog.entity === 'user' && dialog.id === u.id && (
                        <DialogContent>
                          <DialogTitle>Edit User</DialogTitle>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-orange-700">Full Name</label>
                              <input name="fullName" value={(editForm as User)?.fullName || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.fullName ? 'border-orange-500' : 'border-gray-300'}`} />
                              {formErrors.fullName && <p className="text-sm text-orange-600 mt-1">{formErrors.fullName}</p>}
                            </div>
                            {isUser(editForm) && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-orange-700">Email</label>
                                  <input name="email" value={editForm.email || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.email ? 'border-orange-500' : 'border-gray-300'}`} />
                                  {formErrors.email && <p className="text-sm text-orange-600 mt-1">{formErrors.email}</p>}
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1 text-orange-700">Role</label>
                                  <select name="role" value={editForm.role || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.role ? 'border-orange-500' : 'border-gray-300'}`}>
                                    <option value="">Select role</option>
                                    <option value="admin">admin</option>
                                    <option value="user">user</option>
                                  </select>
                                  {formErrors.role && <p className="text-sm text-orange-600 mt-1">{formErrors.role}</p>}
                                </div>
                              </>
                            )}
                            <div>
                              <label className="block text-sm font-medium mb-1 text-orange-700">Created At</label>
                              <input name="createdAt" type="date" value={editForm?.createdAt || ''} onChange={handleEditFormChange} className={`w-full border rounded p-2 focus:ring-2 focus:ring-orange-500 ${formErrors.createdAt ? 'border-orange-500' : 'border-gray-300'}`} />
                              {formErrors.createdAt && <p className="text-sm text-orange-600 mt-1">{formErrors.createdAt}</p>}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => { setDialog(null); setEditForm(null); setFormErrors({}); }}>Cancel</Button>
                            <Button variant="default" className="bg-orange-600 hover:bg-orange-700 text-white" onClick={saveEditUser}>Save</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" onClick={() => setDialog({ type: 'delete', entity: 'user', id: u.id })}>
                          Delete
                        </Button>
                      </DialogTrigger>
                      {dialog && dialog.type === 'delete' && dialog.entity === 'user' && dialog.id === u.id && (
                        <DialogContent>
                          <DialogTitle>Delete User</DialogTitle>
                          <div>Are you sure you want to delete user <b>{u.email}</b>? This action cannot be undone.</div>
                          <DialogFooter>
                            <Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => confirmDeleteUser(u.id)}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
      </Tabs>
    </div>
  );
}