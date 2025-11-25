import React, { useState } from 'react';
import { Video, Loader2, Play, AlertCircle } from 'lucide-react';
import { generateMarketingVideo } from '../services/gemini';
import { Trend } from '../types';

interface Props {
  trend: Trend;
  onComplete: (videoUrl: string) => void;
}

const Step5Video: React.FC<Props> = ({ trend, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
         await window.aistudio.openSelectKey();
      }

      const prompt = `10 second cinematic product commercial for a ${trend.title} t-shirt. High fashion, trendy, 4k resolution, upbeat vibe.`;
      const url = await generateMarketingVideo(prompt);
      onComplete(url);
    } catch (e) {
      console.error(e);
      setError("Video generation failed. Please try again or ensure you have a valid key selected.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-12 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <div className="inline-flex p-4 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Video size={48} className="text-purple-200" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Create Engaging Video Content</h2>
          <p className="text-purple-100 mb-8 max-w-md mx-auto">
            Use Veo 3.1 to generate a 1080p vertical video for TikTok and Instagram Reels.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="group bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Generating Video (This takes ~1 min)...
              </>
            ) : (
              <>
                <Play className="fill-indigo-900" size={20} />
                Generate with Veo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step5Video;