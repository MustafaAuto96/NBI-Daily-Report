
import React, { useState, useEffect } from 'react';
import type { Site } from '../types';

interface AddSitePageProps {
    onAddSite: (newSite: Omit<Site, 'id'>) => void;
    onUpdateSite: (updatedSite: Site) => void;
    editingSite: Site | null;
    clearEditing: () => void;
}

const initialFormData = {
    siteLocationName: '',
    deviceName: '',
    sdwanSiteId: '',
    lanIp: '',
    elInfo: { info: '', capacity: '', l2Ip: '' },
    ilevantInfo: { info: '', capacity: '' },
    horizonInfo: { info: '', capacity: '', l2Ip: '' },
};

const AddSitePage: React.FC<AddSitePageProps> = ({ onAddSite, onUpdateSite, editingSite, clearEditing }) => {
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (editingSite) {
            setFormData({
                siteLocationName: editingSite.siteLocationName,
                deviceName: editingSite.deviceName,
                sdwanSiteId: editingSite.sdwanSiteId,
                lanIp: editingSite.lanIp,
                elInfo: editingSite.elInfo,
                ilevantInfo: editingSite.ilevantInfo,
                horizonInfo: editingSite.horizonInfo,
            });
        } else {
            setFormData(initialFormData);
        }
    }, [editingSite]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as 'elInfo' | 'ilevantInfo' | 'horizonInfo'],
                    [child]: value,
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSite) {
            onUpdateSite({ ...editingSite, ...formData });
        } else {
            onAddSite(formData);
        }
        clearForm();
    };

    const clearForm = () => {
        setFormData(initialFormData);
        clearEditing();
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{editingSite ? 'Edit Site' : 'Submit New Site'}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label htmlFor="siteLocationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Location Name</label>
                        <input type="text" name="siteLocationName" id="siteLocationName" value={formData.siteLocationName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                    </div>
                    <div>
                         <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Device Name</label>
                        <input type="text" name="deviceName" id="deviceName" value={formData.deviceName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="sdwanSiteId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SDWAN Site ID</label>
                        <input type="text" name="sdwanSiteId" id="sdwanSiteId" value={formData.sdwanSiteId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                    </div>
                    <div>
                        <label htmlFor="lanIp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">LAN IP</label>
                        <input type="text" name="lanIp" id="lanIp" value={formData.lanIp} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                    </div>
                </div>

                <div className="space-y-4 rounded-md border border-gray-300 dark:border-gray-600 p-4">
                    <label className="block text-md font-semibold text-gray-700 dark:text-gray-300">EL ISP Information</label>
                    <textarea name="elInfo.info" placeholder="ISP Details" value={formData.elInfo.info} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="elInfo.capacity" placeholder="Capacity" value={formData.elInfo.capacity} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                        <input type="text" name="elInfo.l2Ip" placeholder="L2 IP" value={formData.elInfo.l2Ip} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                    </div>
                </div>

                <div className="space-y-4 rounded-md border border-gray-300 dark:border-gray-600 p-4">
                     <label className="block text-md font-semibold text-gray-700 dark:text-gray-300">Ilevant ISP Information</label>
                     <textarea name="ilevantInfo.info" placeholder="ISP Details" value={formData.ilevantInfo.info} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"></textarea>
                     <div className="grid grid-cols-2 gap-4">
                         <input type="text" name="ilevantInfo.capacity" placeholder="Capacity" value={formData.ilevantInfo.capacity} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                     </div>
                </div>

                 <div className="space-y-4 rounded-md border border-gray-300 dark:border-gray-600 p-4">
                     <label className="block text-md font-semibold text-gray-700 dark:text-gray-300">Horizon ISP Information</label>
                     <textarea name="horizonInfo.info" placeholder="ISP Details" value={formData.horizonInfo.info} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"></textarea>
                     <div className="grid grid-cols-2 gap-4">
                         <input type="text" name="horizonInfo.capacity" placeholder="Capacity" value={formData.horizonInfo.capacity} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                         <input type="text" name="horizonInfo.l2Ip" placeholder="L2 IP" value={formData.horizonInfo.l2Ip} onChange={handleChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                     </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={clearForm} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        {editingSite ? 'Update Site' : 'Add Site'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSitePage;