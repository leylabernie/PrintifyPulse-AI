import React, { useState } from 'react';
import { ProjectState } from '../types';
import { Check, Rocket, ExternalLink, RefreshCw } from 'lucide-react';

interface Props {
  project: ProjectState;
  onRestart: () => void;
}

const Step6Publish: React.FC<Props> = ({ project, onRestart }) => {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    setPublishing(true);
    // Simulate API call to Printify
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2500);
  };

  if (published) {
    return (
      <div className="text-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 text-green-600 rounded-full mb-4">
          <Check size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800">Published Successfully!</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-lg">
          Your product is now live on Printify with 9 mockups, SEO optimized metadata, and a promotional video.
        </p>
        <button 
          onClick={onRestart}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all inline-flex items-center gap-2 mt-8"
        >
          <RefreshCw size={20} /> Start New Project
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Final Review</h2>
          <p className="text-slate-500">Review all assets before publishing to Printify.</p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all flex items-center gap-3"
        >
          {publishing ? <RefreshCw className="animate-spin" /> : <Rocket />}
          {publishing ? 'Publishing...' : 'Publish to Printify'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Listing Info */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="font-bold text-xl text-slate-800 border-b pb-4">Etsy Listing Data</h3>
          
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Title</span>
            <p className="font-medium text-slate-900 mt-1">{project.listingData?.title}</p>
          </div>
          
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Description</span>
            <p className="text-slate-600 mt-1 text-sm whitespace-pre-wrap">{project.listingData?.description}</p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Tags</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {project.listingData?.tags.map((t, i) => (
                <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Media Assets */}
        <div className="space-y-6">
          
          {/* Main Design */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Source Design</h3>
            <div className="bg-slate-100 rounded-lg p-4 flex justify-center">
              <img src={project.designImage?.url} className="max-h-48 object-contain" alt="Design" />
            </div>
          </div>

          {/* Video */}
          {project.videoUrl && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Marketing Video</h3>
              <video 
                src={project.videoUrl} 
                controls 
                className="w-full rounded-lg bg-black aspect-[9/16]"
              />
            </div>
          )}

        </div>
      </div>

      {/* Mockups Grid */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-xl text-slate-800 mb-6">Generated Mockups ({project.mockups.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {project.mockups.map((m, i) => (
            <img key={i} src={m.url} alt={`Mockup ${i}`} className="rounded-lg hover:scale-105 transition-transform cursor-pointer shadow-sm" />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Step6Publish;
