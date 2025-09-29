
import React, { useState, useEffect } from 'react';
import type { User, UserGroup } from '../types';
import { EditIcon, DeleteIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';


interface AdminPageProps {
    users: User[];
    onAddUser: (data: { username: string; password: string; group: UserGroup }) => void;
    onUpdateUser: (data: { id: string; username: string; group: UserGroup; password?: string }) => void;
    onDeleteUser: (userId: string) => void;
    currentUser: User | null;
}

const AdminPage: React.FC<AdminPageProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser }) => {
    
    const initialFormState = {
        username: '',
        password: '',
        group: 'NOC Team' as UserGroup,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);


     useEffect(() => {
        if (editingUser) {
            setFormData({
                username: editingUser.username,
                password: '', // Don't show existing password hash
                group: editingUser.group,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [editingUser]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
             const updatedUserData: { id: string; username: string; group: UserGroup; password?: string } = { 
                id: editingUser.id,
                username: formData.username,
                group: formData.group as UserGroup
            };
            if (formData.password) { // Only update password if a new one is entered
                updatedUserData.password = formData.password;
            }
            onUpdateUser(updatedUserData);
        } else {
            onAddUser({
                username: formData.username,
                password: formData.password,
                group: formData.group,
            });
        }
        handleCancelEdit();
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
    }
    
    const handleCancelEdit = () => {
        setEditingUser(null);
        setFormData(initialFormState);
    }

    const handleDeleteClick = (user: User) => {
        if (currentUser && currentUser.id === user.id) {
            alert("You cannot delete yourself.");
            return;
        }
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setIsModalOpen(false);
            setUserToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Delete User"
                message={
                    <>
                        Are you sure you want to delete the user "<strong>{userToDelete?.username}</strong>"? This action cannot be undone.
                    </>
                }
            />
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{editingUser ? 'Edit User' : 'Create New User'}</h1>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                            <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder={editingUser ? "Leave blank to keep same" : ""} required={!editingUser} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                        </div>
                         <div>
                            <label htmlFor="group" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                            <select name="group" id="group" value={formData.group} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700">
                               <option value="Admin">Admin</option>
                               <option value="Network Team">Network Team</option>
                               <option value="NOC Team">NOC Team</option>
                            </select>
                        </div>

                        <div className="lg:col-span-3 flex justify-end space-x-4 mt-4">
                            {editingUser && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>}
                            <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{editingUser ? 'Update User' : 'Create User'}</button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User List</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Username', 'Group', 'Actions'].map(h => 
                                        <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                                                {user.group}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors" title="Edit"><EditIcon /></button>
                                                <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete"><DeleteIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminPage;