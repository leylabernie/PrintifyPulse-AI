import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, Trash2, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdate: (hasKey: boolean) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, onKeyUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (key) setSavedKey(key);
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setSavedKey(apiKey.trim());
      setApiKey('');
      onKeyUpdate(true);
    }
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_api_key');
    setSavedKey(null);
    onKeyUpdate(false);
  };

  const handleAIStudioSelect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        onKeyUpdate(true);
        onClose();
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Key className="text-blue-600" size={20} /> API Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Studio Integration Section */}
          {window.aistudio && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Google AI Studio</h3>
              <p className="text-sm text-blue-700 mb-4">
                Use the secure key selector provided by the platform.
              </p>
              <button
                onClick={handleAIStudioSelect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Select Project / Key <ExternalLink size={16} />
              </button>
            </div>
          )}

          {/* Manual Entry Section */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Manual API Key</h3>
            <p className="text-sm text-slate-500 mb-4">
              If you are running locally or outside AI Studio, paste your Gemini API key here.
              It will be stored securely in your browser's local storage.
            </p>

            {savedKey ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <CheckCircle size={18} />
                  <span>Key is saved locally</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove Key"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API key here (AIza...)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={handleSave}
                  disabled={!apiKey.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Save Key Locally
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors"
            >
              Get a Gemini API Key <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;