import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DocumentModalProps {
  url: string | null;
  title: string;
  type: 'pdf' | 'image' | 'text' | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  url,
  title,
  type,
  onClose,
}) => {
  if (!url || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {type === 'image' ? (
              <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            )}
            <h3 className="font-bold text-base truncate text-slate-100">{title}</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>
            <a
              href={url}
              download
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 overflow-auto p-4 flex flex-col items-center justify-center">
          {type === 'image' ? (
            <div className="max-h-full max-w-full flex items-center justify-center">
              <img
                src={url}
                alt={title}
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-md border border-slate-200 bg-white"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
              <object
                data={url}
                type="application/pdf"
                className="w-full h-full rounded-lg border border-slate-200"
              >
                <div className="text-center p-8 space-y-4">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-base">PDF Preview External Document</h4>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Chrome security settings block embedding external PDFs inside iframes. Click below to view natively in Chrome.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Open PDF Natively
                  </a>
                </div>
              </object>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
