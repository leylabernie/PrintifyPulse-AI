import React, { useState, useEffect } from 'react';
import { FileText, Loader2, Sparkles, Tag, Zap } from 'lucide-react';
import { generateListing, quickTitleFix } from '../services/gemini';
import { Trend, ListingData, GeneratedImage } from '../types';

interface Props {
  trend: Trend;
  design: GeneratedImage;
  onComplete: (data: ListingData) => void;
}

const Step3Listing: React.FC<Props> = ({ trend, design, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [titleFixing, setTitleFixing] = useState(false);
  const [data, setData] = useState<ListingData | null>(null);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const result = await generateListing(trend.title, design.prompt);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQuickFix = async () => {
    if (!data) return;
    setTitleFixing(true);
    try {
      const newTitle = await quickTitleFix(data.title);
      setData({ ...data, title: newTitle });
    } finally {
      setTitleFixing(false);
    }
  };

  const handleContinue = () => {
    if (data) onComplete(data);
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
        <Sparkles className="text-amber-500 w-12 h-12" />
        <p className="text-lg font-medium text-slate-600">Gemini is thinking deeply about SEO strategies...</p>
        <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Budget: 32k tokens</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" /> Listing Details
          </h2>
          <button 
            onClick={handleQuickFix}
            disabled={titleFixing}
            className="text-sm bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-2"
          >
            {titleFixing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Make Title Punchier (Lite)
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Product Title</label>
            <textarea 
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px]"
            />
            <p className="text-right text-xs text-slate-400 mt-1">{data.title.length} chars</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea 
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[200px]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Tag size={16} /> Optimized Tags (13)
            </label>
            <div className="flex flex-wrap gap-2">
              {data.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            Approve & Generate Mockups
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3Listing;
