import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Loader2, Upload, Maximize2, Wand2 } from 'lucide-react';
import { generateDesign } from '../services/gemini';
import { Trend, GeneratedImage, AspectRatio, ImageResolution } from '../types';

interface Props {
  trend: Trend;
  onComplete: (image: GeneratedImage) => void;
}

const Step2Design: React.FC<Props> = ({ trend, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [ratio, setRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution.RES_1K);
  const [refImage, setRefImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
         await window.aistudio.openSelectKey();
      }

      // Pass the full trend object which now contains style info
      const result = await generateDesign(trend, ratio, resolution, refImage);
      const url = `data:${result.mimeType};base64,${result.base64}`;
      onComplete({
        url,
        base64: result.base64,
        prompt: trend.title
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate design. Ensure you have selected a valid API Key with billing enabled for Pro models.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setRefImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Controls */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wand2 size={20} className="text-purple-500"/> Design Settings
            </h3>

            {/* Display Selected Style Info */}
            {trend.style && (
               <div className="mb-6 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm">
                 <span className="block text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Active Style</span>
                 <p className="font-medium text-purple-900">{trend.style.name}</p>
                 <p className="text-purple-700/80 text-xs mt-1">{trend.style.elements}</p>
               </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(AspectRatio).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRatio(r)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        ratio === r 
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Resolution (Nano Banana Pro)
                </label>
                <div className="flex gap-2">
                  {Object.values(ImageResolution).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                        resolution === res 
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-medium' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Reference Image (Optional)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:bg-slate-50 hover:border-purple-300 transition-colors text-center"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  {refImage ? (
                    <div className="text-green-600 text-sm font-medium flex items-center justify-center gap-2">
                      <ImageIcon size={16}/> Image Loaded
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm flex flex-col items-center gap-1">
                      <Upload size={20} />
                      <span>Click to upload sketch</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Maximize2 size={20} />}
              Generate High-Res Design
            </button>
            <p className="text-xs text-center text-slate-400 mt-2">Powered by Gemini 3 Pro Image</p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-full md:w-2/3 bg-slate-100 rounded-3xl flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-200">
           <div className="text-center text-slate-400">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>Your generated design will appear here</p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Step2Design;