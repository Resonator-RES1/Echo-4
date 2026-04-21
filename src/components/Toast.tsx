import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-highest/90 backdrop-blur-xl text-on-surface px-4 py-2.5 rounded-full border border-white/5 shadow-2xl flex items-center gap-3 z-[100] animate-in slide-in-from-bottom-2 fade-in duration-500">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-label text-[9px] font-black uppercase tracking-[0.2em]">{message}</span>
        </div>
    );
};
