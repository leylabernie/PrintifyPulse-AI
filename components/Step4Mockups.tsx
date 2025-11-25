import React, { useState, useEffect } from 'react';
import { Layers, Loader2, CheckCircle } from 'lucide-react';
import { generateMockup } from '../services/gemini';
import { GeneratedImage } from '../types';

interface Props {
  design: GeneratedImage;
  onComplete: (mockups: GeneratedImage[]) => void;
}

const VARIATIONS = [
  { color: 'white', setting: 'folded neatly on a wooden table' },
  { color: 'black', setting: 'hanging on a minimal rack' },
  { color: 'heather grey', setting: 'worn by a smiling person in a coffee shop' },
  { color: 'navy', setting: 'flat lay with holiday decorations' },
  { color: 'red', setting: 'worn by a person outdoors' },
  { color: 'white', setting: 'close up on the print texture' },
  { color: 'black', setting: 'back view worn by model' },
  { color: 'forest green', setting: 'folded with jeans' },
  { color: 'maroon', setting: 'lifestyle shot at a party' }
];

const Step4Mockups: React.FC<Props> = ({ design, onComplete }) => {
  const [mockups, setMockups] = useState<GeneratedImage[]>([]);
  const [generatingIdx, setGeneratingIdx] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const generateAll = async () => {
      const results: GeneratedImage[] = [];
      
      // We generate sequentially to avoid rate limits and show progress
      for (let i = 0; i < VARIATIONS.length; i++) {
        setGeneratingIdx(i);
        try {
          const v = VARIATIONS[i];
          const result = await generateMockup(design.base64, v.color, v.setting);
          const img: GeneratedImage = {
            url: `data:image/png;base64,${result.base64}`,
            base64: result.base64,
            prompt: `Mockup ${v.color}`
          };
          results.push(img);
          setMockups(prev => [...prev, img]);
        } catch (e) {
          console.error(`Failed mockup ${i}`, e);
        }
      }
      setIsDone(true);
    };

    generateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Layers className="text-indigo-600" /> Product Mockups
        </h2>
        {!isDone && (
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm font-medium">Generating variation {generatingIdx + 1} of {VARIATIONS.length}</span>
          </div>
        )}
        {isDone && (
           <button 
             onClick={() => onComplete(mockups)}
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
           >
             Next Step <CheckCircle size={18} />
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockups.map((img, idx) => (
          <div key={idx} className="relative aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-sm group">
            <img src={img.url} alt="Mockup" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-medium text-sm">Variation {idx + 1}</span>
            </div>
          </div>
        ))}
        {!isDone && (
          <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
            <Loader2 className="text-slate-300 animate-spin" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4Mockups;
