import React, { useState, useEffect, useRef } from 'react';
import type { ProblemReport } from '../types';
import { EditIcon, DeleteIcon, ExportIcon, ImportIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

declare const XLSX: any;

interface DailyReportPageProps {
    reports: ProblemReport[];
    setReports: React.Dispatch<React.SetStateAction<ProblemReport[]>>;
}

const toDisplayDate = (isoDate: string): string => {
    if (!isoDate) return isoDate;
    // Handles yyyy-mm-dd and yyyy-m-d
    const parts = isoDate.split('-');
    if (parts.length === 3 && parts[0].length === 4) { 
        const [year, month, day] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    return isoDate; // Return as is if not in expected format
};

const toIsoDate = (displayDate: string): string => {
    if (!displayDate) return '';
    // If it's already a valid ISO date, return it.
    if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) return displayDate; 
    
    // Allow for d/m/yyyy and dd/mm/yyyy formats using a regex match
    const match = displayDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
        return displayDate; // Return original string if it doesn't match for validation
    }
    
    const [, dayStr, monthStr, yearStr] = match;
    
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        return displayDate; // Invalid numbers, return for validation
    }

    // Create date in UTC to avoid timezone issues and to validate the date itself
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Check if Date object created a valid date that matches the input
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return displayDate; // Invalid date (e.g., Feb 30th), return for validation
    }

    // Return correctly padded ISO 8601 format (yyyy-mm-dd)
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};


const DailyReportPage: React.FC<DailyReportPageProps> = ({ reports, setReports }) => {
    const getTodayISO = () => new Date().toISOString().split('T')[0];
    const importInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const initialFormState = {
        siteName: '',
        ticketId: '',
        status: 'UP' as 'UP' | 'DOWN',
        reason: '',
        lastUpdate: '',
        issueDate: toDisplayDate(getTodayISO()),
        lastFollowUp: toDisplayDate(getTodayISO()),
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingReportId, setEditingReportId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<ProblemReport | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importedReports, setImportedReports] = useState<ProblemReport[] | null>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as 'UP' | 'DOWN' }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = {
            ...formData,
            issueDate: toIsoDate(formData.issueDate),
            lastFollowUp: toIsoDate(formData.lastFollowUp),
        };

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dataToSave.issueDate) || !/^\d{4}-\d{2}-\d{2}$/.test(dataToSave.lastFollowUp)) {
            alert('Please enter valid dates in dd/mm/yyyy format.');
            return;
        }

        if (editingReportId) {
            setReports(prev => prev.map(r => r.id === editingReportId ? { ...dataToSave, id: editingReportId } : r));
            setEditingReportId(null);
        } else {
            setReports(prev => [...prev, { ...dataToSave, id: Date.now().toString() }]);
        }
        setFormData(initialFormState);
    };
    
    const handleEdit = (report: ProblemReport) => {
        setEditingReportId(report.id);
        setFormData({
            ...report,
            issueDate: toDisplayDate(report.issueDate),
            lastFollowUp: toDisplayDate(report.lastFollowUp),
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    const handleDeleteClick = (report: ProblemReport) => {
        setReportToDelete(report);
        setIsModalOpen(true);
    };

    const confirmDelete = () => {
        if (reportToDelete) {
            setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
            setIsModalOpen(false);
            setReportToDelete(null);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setReportToDelete(null);
    };
    
    const handleCancelEdit = () => {
        setEditingReportId(null);
        setFormData(initialFormState);
    }

    const exportToCSV = () => {
        const headers = ['Site Name', 'Ticket ID', 'Status', 'Reason', 'Last Update', 'Issue Date', 'Last Follow Up'];
        
        const rows = reports.map(report => 
            [report.siteName, report.ticketId, report.status, `"${report.reason.replace(/"/g, '""')}"`, `"${report.lastUpdate.replace(/"/g, '""')}"`, toDisplayDate(report.issueDate), toDisplayDate(report.lastFollowUp)].join(',')
        );
        
        const csvString = [headers.join(','), ...rows].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "daily_problem_report.csv");
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = event.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const headerRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (headerRows.length === 0) {
                    alert('The imported file is empty.');
                    return;
                }
                
                const headers = headerRows[0];
                const expectedHeaders = ['Site Name', 'Ticket ID', 'Status', 'Reason', 'Last Update', 'Issue Date', 'Last Follow Up'];
                const lowerCaseHeaders = headers.map((h: any) => String(h).toLowerCase());
                const lowerCaseExpected = expectedHeaders.map(h => h.toLowerCase());

                if (lowerCaseHeaders.length < lowerCaseExpected.length || !lowerCaseExpected.every(h => lowerCaseHeaders.includes(h))) {
                    alert(`Invalid file format. Expected headers: ${expectedHeaders.join(', ')}`);
                    return;
                }

                const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                const newReports: ProblemReport[] = jsonRows.map((row: any, index: number): ProblemReport | null => {
                    const status = row['Status']?.toUpperCase();
                    if (status !== 'UP' && status !== 'DOWN') {
                        console.warn(`Invalid status "${row['Status']}" on row ${index + 2}. Skipping.`);
                        return null;
                    }

                    const formatDate = (date: any): string => {
                        if (!date) return getTodayISO();
                        
                        // Handle JS Date objects (which SheetJS might create despite options)
                        if (date instanceof Date) {
                            // Adjust for timezone offset to get the intended date as seen by the user,
                            // not the UTC date which might be a day off.
                            const tzOffsetMs = date.getTimezoneOffset() * 60000;
                            const correctedDate = new Date(date.getTime() - tzOffsetMs);
                            return correctedDate.toISOString().split('T')[0];
                        }

                        // Handle string dates (expected from raw: false).
                        // Our toIsoDate function correctly parses dd/mm/yyyy.
                        if (typeof date === 'string') {
                            const isoDate = toIsoDate(date.trim());
                            if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
                                return isoDate;
                            }
                        }

                        // Fallback for Excel serial numbers.
                        if (typeof date === 'number') {
                            // This formula converts Excel serial number to a JS Date object at UTC midnight.
                            const jsDate = new Date(Math.round((date - 25569) * 86400000));
                             // toISOString gives UTC date, so splitting is safe.
                            return jsDate.toISOString().split('T')[0];
                        }

                        console.warn(`Could not parse date from imported file, row ${index + 2}:`, date);
                        return getTodayISO();
                    };

                    return {
                        id: `imported-${Date.now()}-${index}`,
                        siteName: String(row['Site Name'] || ''),
                        ticketId: String(row['Ticket ID'] || ''),
                        status: status,
                        reason: String(row['Reason'] || ''),
                        lastUpdate: String(row['Last Update'] || ''),
                        issueDate: formatDate(row['Issue Date']),
                        lastFollowUp: formatDate(row['Last Follow Up']),
                    };
                }).filter((r): r is ProblemReport => r !== null && !!r.siteName && !!r.ticketId);
                
                if (newReports.length > 0) {
                    setImportedReports(newReports);
                    setIsImportModalOpen(true);
                } else if (jsonRows.length > 0) {
                    alert('No valid reports found in the file. Please check the data format.');
                } else {
                    alert('The imported file contains no data rows.');
                }

            } catch (error) {
                console.error("Error importing file:", error);
                alert("There was an error processing the file.");
            }
        };
        reader.readAsBinaryString(file);
    };
    
    const confirmImport = () => {
        if (importedReports) {
            setReports(importedReports);
            alert(`${importedReports.length} reports imported successfully!`);
        }
        closeImportModal();
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setImportedReports(null);
        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    };


    const canManageReports = true;

    return (
        <>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onConfirm={confirmDelete}
                title="Delete Report"
                message={
                     <>
                        Are you sure you want to delete the report for site "<strong>{reportToDelete?.siteName}</strong>" with ticket ID "<strong>{reportToDelete?.ticketId}</strong>"?
                    </>
                }
            />
             <ConfirmationModal
                isOpen={isImportModalOpen}
                onClose={closeImportModal}
                onConfirm={confirmImport}
                title="Confirm Data Import"
                message="Importing this file will replace all existing reports. Are you sure you want to continue?"
                confirmButtonText="Import and Replace"
                confirmButtonClass="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            />
            <div className="space-y-8">
                {canManageReports && (
                    <div ref={formRef} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
                        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{editingReportId ? 'Edit Report' : 'Add New Problem Report'}</h1>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Location</label>
                                <input type="text" name="siteName" id="siteName" value={formData.siteName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                            </div>
                            <div className="lg:col-span-1">
                                <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ticket ID</label>
                                <input type="text" name="ticketId" id="ticketId" value={formData.ticketId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                            </div>
                            <div className="lg:col-span-1">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700">
                                <option value="UP">UP</option>
                                <option value="DOWN">DOWN</option>
                                </select>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                                <textarea name="reason" id="reason" value={formData.reason} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"></textarea>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label htmlFor="lastUpdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Update</label>
                                <textarea name="lastUpdate" id="lastUpdate" value={formData.lastUpdate} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"></textarea>
                            </div>
                            <div>
                                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                                <input type="text" placeholder="dd/mm/yyyy" name="issueDate" id="issueDate" value={formData.issueDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                            </div>
                            <div>
                                <label htmlFor="lastFollowUp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Follow Up</label>
                                <input type="text" placeholder="dd/mm/yyyy" name="lastFollowUp" id="lastFollowUp" value={formData.lastFollowUp} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700"/>
                            </div>

                            <div className="lg:col-span-3 flex justify-end space-x-4">
                                {editingReportId && <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>}
                                <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">{editingReportId ? 'Update Report' : 'Add Report'}</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Reports</h2>
                         <div className="flex flex-col sm:flex-row gap-4">
                            <input type="file" ref={importInputRef} onChange={handleFileImport} accept=".xlsx, .xls, .csv" className="hidden" aria-hidden="true" />
                            <button onClick={handleImportClick} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                <ImportIcon />
                                Import
                            </button>
                            <button onClick={exportToCSV} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                                <ExportIcon />
                                Export to CSV
                            </button>
                         </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {[ 'Site Location', 'Ticket ID', 'Status', 'Reason', 'Last Update', 'Issue Date', 'Last Follow Up', 'Actions'].map(h => 
                                        <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{report.siteName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{report.ticketId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                report.status === 'DOWN' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                                            }`}>{report.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate" title={report.reason}>{report.reason}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate" title={report.lastUpdate}>{report.lastUpdate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{toDisplayDate(report.issueDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{toDisplayDate(report.lastFollowUp)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {canManageReports && (
                                                <div className="flex items-center space-x-4">
                                                    <button onClick={() => handleEdit(report)} className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors" title="Edit"><EditIcon /></button>
                                                    <button onClick={() => handleDeleteClick(report)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors" title="Delete"><DeleteIcon /></button>
                                                </div>
                                            )}
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

export default DailyReportPage;
