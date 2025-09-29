import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <nav className="bg-gray-800 dark:bg-gray-900 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-white text-xl font-bold">NBI Site Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                         <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-label="Toggle theme"
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
