import React from 'react';
import { RefinedVersion } from '../../types';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';
import { useDisplayStore } from '../../stores/useDisplayStore';

interface PolishedViewProps {
  version: RefinedVersion;
  onBack: () => void;
  showToast: (message: string) => void;
}

export const PolishedView: React.FC<PolishedViewProps> = ({
  version,
  onBack,
  showToast
}) => {
  const [copied, setCopied] = React.useState(false);
  const displayPrefs = useDisplayStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(version.text);
    setCopied(true);
    showToast('Text copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([version.text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.title || 'polished-version'}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Version downloaded');
  };

  return (
    <div className="flex flex-col h-full w-full bg-surface-container-lowest overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex-shrink-0 h-20 border-b border-white/5 flex items-center justify-between px-8 bg-surface-container-low/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-surface-container-highest rounded-full transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h3 className="font-headline text-xl font-bold tracking-tight">Full Polished Version</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">
              {version.title || 'Unlabeled Audit'} • {new Date(version.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-outline-variant/10 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-4 lg:p-20">
        <div 
          className="mx-auto bg-surface-container-low/30 p-4 md:p-5 rounded-xl border border-white/5 shadow-2xl"
          style={{ 
            maxWidth: displayPrefs.maxWidth,
            fontSize: `${displayPrefs.fontSize}px`,
            lineHeight: displayPrefs.lineHeight,
            fontFamily: displayPrefs.fontFamily === 'serif' ? 'Georgia, serif' : 'inherit'
          }}
        >
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-on-surface leading-relaxed">
            {version.text}
          </div>
        </div>
      </main>
    </div>
  );
};
