import React, { useState } from 'react';
import { Search, Loader2, TrendingUp, ArrowRight, Palette, Music, Type, Smile, User } from 'lucide-react';
import { discoverTrends } from '../services/gemini';
import { Trend, DesignStyle } from '../types';

interface Props {
  onSelect: (trend: Trend) => void;
}

const DESIGN_STYLES: DesignStyle[] = [
  {
    id: "retro",
    name: "Retro/Vintage",
    description: "Designs inspired by the 1970s, 80s, and 90s.",
    elements: "Wavy text, distressed graphics, muted or retro color palettes (mustard yellow, burnt orange, avocado green), groovy fonts."
  },
  {
    id: "minimalist",
    name: "Minimalist/Typography",
    description: "Simple, clean text-based designs that are easy to read.",
    elements: "Short, witty, or sentimental phrases. Clean typography. High contrast. 'Merry & Bright', 'In My Christmas Era'."
  },
  {
    id: "personalization",
    name: "Personalization",
    description: "Designs that allow for custom names, dates, or family titles.",
    elements: "Layouts with clear space for names like 'Mama Claus', 'Est. 2024'. Family crest styles."
  },
  {
    id: "humor",
    name: "Niche Humor",
    description: "Targeting specific groups or interests with a holiday twist.",
    elements: "Puns, specific hobbies (nurses, teachers), funny holiday twists. 'All I Want for Christmas is More Coffee'."
  }
];

const Step1Trends: React.FC<Props> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const results = await discoverTrends(query, selectedStyle || undefined);
      setTrends(results);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch trends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStyleIcon = (id: string) => {
    switch(id) {
      case 'retro': return <Music size={20} />;
      case 'minimalist': return <Type size={20} />;
      case 'personalization': return <User size={20} />;
      case 'humor': return <Smile size={20} />;
      default: return <Palette size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full">
          <TrendingUp size={24} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Discover Niche Trends</h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Choose a style and use Gemini's Search Grounding to find real-time winning product ideas.
        </p>
      </div>

      {/* Style Selection */}
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Select a Design Style</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DESIGN_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(selectedStyle?.id === style.id ? null : style)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedStyle?.id === style.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className={`mb-3 ${selectedStyle?.id === style.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}`}>
                {getStyleIcon(style.id)}
              </div>
              <h3 className={`font-bold text-sm mb-1 ${selectedStyle?.id === style.id ? 'text-blue-900' : 'text-slate-700'}`}>
                {style.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {style.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., Cats, Nurses, Fishing, Yoga..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
          Search
        </button>
      </div>

      {/* Results Grid */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {trends.map((trend, idx) => (
            <div 
              key={idx}
              onClick={() => onSelect(trend)}
              className="group cursor-pointer bg-white p-6 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                  {trend.title}
                </h3>
                {trend.sourceUrl && (
                   <a href={trend.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline" onClick={(e) => e.stopPropagation()}>Source</a>
                )}
              </div>
              
              {/* Style Badge */}
              {trend.style && (
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 mb-2">
                  {trend.style.name}
                </div>
              )}

              <p className="text-slate-600 text-sm leading-relaxed mb-4">{trend.description}</p>
              <div className="flex items-center text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Select Trend <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step1Trends;