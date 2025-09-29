import React, { useState, useEffect } from 'react';
import type { Site, ProblemReport } from './types';
import { DUMMY_SITES, DUMMY_REPORTS } from './constants';
import Header from './components/Header';
import DailyReportPage from './components/DailyReportPage';

const App: React.FC = () => {
    
    // --- Data State ---
    const [sites] = useState<Site[]>(DUMMY_SITES);
    const [reports, setReports] = useState<ProblemReport[]>(DUMMY_REPORTS);
    
    // --- UI State ---
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
        }
        return 'dark'; // Default to dark mode
    });

    // Apply theme to document and save to localStorage
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.error("Error saving theme to localStorage:", error);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="min-h-screen bg-[#dfe6e9] dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Header 
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                <DailyReportPage reports={reports} setReports={setReports} sites={sites} />
            </main>
        </div>
    );
};

export default App;
