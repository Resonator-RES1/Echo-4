import React from 'react';
import { motion } from 'motion/react';
import { 
    Edit, 
    Trash2, 
    Calendar, 
    Tag, 
    Target, 
    Info, 
    Book, 
    User, 
    History, 
    GitBranch,
    LucideIcon
} from 'lucide-react';

interface MetadataField {
    label: string;
    value: string | number | undefined;
}

interface EntityInspectorProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    iconColor?: string;
    tags?: string[];
    metadata?: MetadataField[];
    onEdit: () => void;
    onDelete?: () => void;
    extraContent?: React.ReactNode;
    subtitle?: string;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
    title,
    description,
    icon: Icon,
    iconColor = 'text-primary',
    tags = [],
    metadata = [],
    onEdit,
    onDelete,
    extraContent,
    subtitle
}) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 lg:p-12 max-w-5xl mx-auto space-y-12"
        >
            {/* Header Section */}
            <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-white/5 shadow-inner flex-shrink-0 ${iconColor}`}>
                        <Icon size={32} />
                    </div>
                    <div className="space-y-2">
                        {subtitle && (
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                                {subtitle}
                            </span>
                        )}
                        <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight leading-tight">
                            {title}
                        </h2>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-surface-container-highest border border-white/5 text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onEdit}
                        className="flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-black text-[10px] uppercase tracking-widest border border-primary/20 transition-all shadow-primary-glow/10"
                    >
                        <Edit size={14} />
                        Modify
                    </button>
                    {onDelete && (
                        <button 
                            onClick={onDelete}
                            className="p-3 bg-surface-container-highest text-on-surface-variant/40 hover:text-error hover:bg-error/10 rounded-xl border border-white/5 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Primary Content (2/3) */}
                <div className="lg:col-span-2 space-y-10">
                    {description && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 flex items-center gap-2">
                                <Info size={12} /> Narrative Context
                            </h3>
                            <p className="text-lg text-on-surface/80 leading-relaxed font-sans font-light italic">
                                "{description}"
                            </p>
                        </div>
                    )}
                    
                    {extraContent}
                </div>

                {/* Metadata Sidebar (1/3) */}
                <div className="space-y-8">
                    <div className="bg-surface-container-lowest/30 rounded-3xl p-6 border border-white/5 space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Technical Specs</h3>
                        <div className="space-y-4">
                            {metadata.map((field, idx) => (
                                <div key={idx} className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-30">{field.label}</p>
                                    <p className="text-xs font-mono font-medium text-on-surface">{field.value || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
