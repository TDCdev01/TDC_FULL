import React from 'react';

export default function LoadingSpinner({ size = 'default' }) {
    const sizeClasses = {
        small: 'w-6 h-6',
        default: 'w-12 h-12',
        large: 'w-16 h-16'
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className={`${sizeClasses[size]} relative`}>
                <div className="absolute w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
        </div>
    );
} 