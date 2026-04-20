import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3.5 rounded-[0.75rem] shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-label text-sm font-medium tracking-wide">{message}</span>
        </div>
    );
};
