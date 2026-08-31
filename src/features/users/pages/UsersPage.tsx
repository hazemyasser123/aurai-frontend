import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useUsers, useCreateUser, useUpdateUser } from "@/shared/queries/users/usersHooks";
import { Button, InputField, Modal, Select, Badge } from "@/shared/components/ui";
import { WithNavbar } from "@/shared/components/hoc/WithNavbar";
import { getErrorMessage } from "@/shared/utils/errorHandler";
import type { RootState } from "@/shared/redux/store/store";
import type { User, CreateUserPayload, UpdateUserPayload, UserRole } from "@/features/auth/types/authTypes";

const UsersPageContent: React.FC = () => {
    const { data: users, isLoading, error } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const { user: currentUser } = useSelector((state: RootState) => state.auth);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<CreateUserPayload>({
        username: '',
        password: '',
        role: 'USER',
    });
    const [formErrors, setFormErrors] = useState<Partial<CreateUserPayload>>({});

    const handleOpenCreateModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'USER' });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({ username: user.username, password: '', role: user.role });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'USER' });
        setFormErrors({});
    };

    const validateForm = (): boolean => {
        const errors: Partial<CreateUserPayload> = {};
        if (!formData.username.trim()) errors.username = 'Username is required';
        if (!editingUser && !formData.password.trim()) errors.password = 'Password is required';
        if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            if (editingUser) {
                const updatePayload: UpdateUserPayload = {
                    role: formData.role,
                    ...(formData.password && { password: formData.password }),
                };
                await updateUserMutation.mutateAsync({ userId: editingUser.id, payload: updatePayload });
                toast.success(`User "${editingUser.username}" updated successfully.`);
            } else {
                const payload: CreateUserPayload = {
                    username: formData.username.trim(),
                    password: formData.password,
                    role: formData.role,
                };
                await createUserMutation.mutateAsync(payload);
                toast.success(`User "${payload.username}" created successfully.`);
            }
            handleCloseModal();
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const handleToggleStatus = async (user: User) => {
        const nextActive = !user.is_active;
        try {
            await updateUserMutation.mutateAsync({
                userId: user.id,
                payload: { is_active: nextActive },
            });
            toast.success(`User "${user.username}" ${nextActive ? 'enabled' : 'disabled'} successfully.`);
        } catch (err) {
            toast.error(getErrorMessage(err));
        }
    };

    const isSubmitting = createUserMutation.isPending || updateUserMutation.isPending;
    // Mutating flag — with optimistic updates the table reflects instantly,
    // but we keep buttons locked until the server confirms to prevent double-clicks
    const isMutating = createUserMutation.isPending || updateUserMutation.isPending;

    return (
        <div className="flex flex-col gap-6 h-full p-6 overflow-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="font-sans font-bold text-2xl tracking-tight text-fg">Users</h1>
                    <p className="font-sans text-sm text-fg-body mt-1">
                        Manage user accounts and their access levels
                    </p>
                </div>
                <Button variant="gradient" onClick={handleOpenCreateModal} className="lg:ml-auto">
                    + Add User
                </Button>
            </div>

            {/* Users Table */}
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-fg-body">Loading users...</div>
                ) : error ? (
                    <div className="p-12 text-center text-danger">Failed to load users</div>
                ) : users && users.length === 0 ? (
                    <div className="p-12 text-center text-fg-body">No users found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-bg-muted/50">
                                    <th className="px-6 py-4 text-left font-sans font-semibold text-xs tracking-tight text-fg-muted uppercase">Username</th>
                                    <th className="px-6 py-4 text-left font-sans font-semibold text-xs tracking-tight text-fg-muted uppercase">Role</th>
                                    <th className="px-6 py-4 text-left font-sans font-semibold text-xs tracking-tight text-fg-muted uppercase">Status</th>
                                    <th className="px-6 py-4 text-right font-sans font-semibold text-xs tracking-tight text-fg-muted uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users?.map((user) => {
                                    const isSelf = currentUser?.id === user.id;
                                    const isRowBusy = isMutating;
                                    return (
                                        <tr key={user.id} className="hover:bg-bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-sans font-medium text-sm text-fg">
                                                {user.username}
                                                {isSelf && <span className="ml-2 text-xs text-fg-muted">(you)</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.role === 'ADMIN' ? 'primary' : 'ghost'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={user.is_active ? 'success' : 'ghost'}>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleOpenEditModal(user)}
                                                        disabled={isRowBusy}
                                                        isLoading={updateUserMutation.isPending}
                                                        className="text-xs px-3 py-1.5 min-w-[70px] h-8"
                                                    >
                                                        Edit
                                                    </Button>
                                                    {!isSelf && (
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={isRowBusy}
                                                            isLoading={updateUserMutation.isPending}
                                                            className="text-xs px-3 py-1.5 min-w-[70px] h-8"
                                                        >
                                                            {user.is_active ? 'Disable' : 'Enable'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit User Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Edit User' : 'Add User'}>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <InputField
                        label="Username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        error={formErrors.username}
                        disabled={!!editingUser}
                    />
                    <InputField
                        label="Password"
                        type="password"
                        placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={formErrors.password}
                    />
                    <Select
                        label="Role"
                        id="user-role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                        disabled={!!editingUser && editingUser.id === currentUser?.id}
                        hint={editingUser && editingUser.id === currentUser?.id ? 'You cannot change your own role' : undefined}
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </Select>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" type="button" onClick={handleCloseModal} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="gradient" type="submit" isLoading={isSubmitting}>
                            {editingUser ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export const UsersPage = WithNavbar(UsersPageContent);