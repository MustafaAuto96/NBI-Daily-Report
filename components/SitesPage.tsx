import React, { useState } from 'react';
import type { Site, User } from '../types';
import { EditIcon, DeleteIcon, SearchIcon, ExportIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

// Declare XLSX to be available from the script tag in index.html
declare const XLSX: any;

interface SitesPageProps {
    sites: Site[];
    onEdit: (site: Site) => void;
    onDelete: (siteId: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentUser: User | null;
}

const SitesPage: React.FC<SitesPageProps> = ({ sites, onEdit, onDelete, searchTerm, setSearchTerm, currentUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);

    const handleDeleteClick = (site: Site) => {
        setSiteToDelete(site);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (siteToDelete) {
            onDelete(siteToDelete.id);
            setIsModalOpen(false);
            setSiteToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSiteToDelete(null);
    };

    const canManage = currentUser?.group === 'Admin' || currentUser?.group === 'Network Team';

    const exportToExcel = () => {
        const flattenedSites = sites.map(site => ({
            'Site Location': site.siteLocationName,
            'Device Name': site.deviceName,
            'SDWAN Site ID': site.sdwanSiteId,
            'LAN IP': site.lanIp,
            'EL Info': site.elInfo.info,
            'EL Capacity': site.elInfo.capacity,
            'EL L2 IP': site.elInfo.l2Ip,
            'Ilevant Info': site.ilevantInfo.info,
            'Ilevant Capacity': site.ilevantInfo.capacity,
            'Horizon Info': site.horizonInfo.info,
            'Horizon Capacity': site.horizonInfo.capacity,
            'Horizon L2 IP': site.horizonInfo.l2Ip,
        }));
        const ws = XLSX.utils.json_to_sheet(flattenedSites);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sites");
        XLSX.writeFile(wb, "SiteData.xlsx");
    };

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Delete Site"
                message={
                    <>
                        Are you sure you want to delete the site "<strong>{siteToDelete?.siteLocationName}</strong>"? This action cannot be undone.
                    </>
                }
            />
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Site Data</h1>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for any site detail..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon />
                        </div>
                    </div>
                     <button onClick={exportToExcel} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                        <ExportIcon />
                        Export to Excel
                     </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Site Location</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SDWAN Site ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">LAN IP</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">EL ISP Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ilevant ISP Info</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horizon ISP Info</th>
                                {canManage && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sites.length > 0 ? sites.map((site) => (
                                <tr key={site.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{site.siteLocationName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{site.deviceName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{site.sdwanSiteId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{site.lanIp}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        <div className="font-semibold">{site.elInfo.info}</div>
                                        <div className="text-xs text-gray-400">Capacity: {site.elInfo.capacity}</div>
                                        <div className="text-xs text-gray-400">L2 IP: {site.elInfo.l2Ip}</div>
                                    </td>
                                     <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        <div className="font-semibold">{site.ilevantInfo.info}</div>
                                        <div className="text-xs text-gray-400">Capacity: {site.ilevantInfo.capacity}</div>
                                    </td>
                                     <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                        <div className="font-semibold">{site.horizonInfo.info}</div>
                                        <div className="text-xs text-gray-400">Capacity: {site.horizonInfo.capacity}</div>
                                        <div className="text-xs text-gray-400">L2 IP: {site.horizonInfo.l2Ip}</div>
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <button onClick={() => onEdit(site)} className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors" title="Edit">
                                                    <EditIcon />
                                                </button>
                                                <button onClick={() => handleDeleteClick(site)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete">
                                                    <DeleteIcon />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={canManage ? 8: 7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No sites found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SitesPage;