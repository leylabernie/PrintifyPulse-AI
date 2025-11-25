import React, { useState, useEffect } from 'react';
import { Layout, Palette, FileText, Images, Video, Send, Settings, AlertTriangle } from 'lucide-react';
import Step1Trends from './components/Step1Trends';
import Step2Design from './components/Step2Design';
import Step3Listing from './components/Step3Listing';
import Step4Mockups from './components/Step4Mockups';
import Step5Video from './components/Step5Video';
import Step6Publish from './components/Step6Publish';
import SettingsModal from './components/SettingsModal';
import { ProjectState, Trend, GeneratedImage, ListingData } from './types';

const STEPS = [
  { icon: Layout, label: 'Discover' },
  { icon: Palette, label: 'Design' },
  { icon: FileText, label: 'Listing' },
  { icon: Images, label: 'Mockups' },
  { icon: Video, label: 'Video' },
  { icon: Send, label: 'Publish' }
];

const INITIAL_STATE: ProjectState = {
  currentStep: 0,
  selectedTrend: null,
  designImage: null,
  listingData: null,
  mockups: [],
  videoUrl: null,
  isPublished: false
};

const App: React.FC = () => {
  const [project, setProject] = useState<ProjectState>(INITIAL_STATE);
  const [hasKey, setHasKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      // Check for manual key or env key
      if (process.env.API_KEY || localStorage.getItem('gemini_api_key')) {
        setHasKey(true);
      }

      if (window.aistudio) {
        const hasSelectedKey = await window.aistudio.hasSelectedApiKey();
        if (!hasSelectedKey) {
          try {
            await window.aistudio.openSelectKey();
            setHasKey(true);
          } catch (e) {
            console.error("Failed to open key selector", e);
          }
        } else {
          setHasKey(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const nextStep = () => setProject(p => ({ ...p, currentStep: p.currentStep + 1 }));
  
  const handleTrendSelect = (trend: Trend) => {
    setProject(p => ({ ...p, selectedTrend: trend, currentStep: 1 }));
  };

  const handleDesignComplete = (image: GeneratedImage) => {
    setProject(p => ({ ...p, designImage: image, currentStep: 2 }));
  };

  const handleListingComplete = (data: ListingData) => {
    setProject(p => ({ ...p, listingData: data, currentStep: 3 }));
  };

  const handleMockupsComplete = (mockups: GeneratedImage[]) => {
    setProject(p => ({ ...p, mockups, currentStep: 4 }));
  };

  const handleVideoComplete = (url: string) => {
    setProject(p => ({ ...p, videoUrl: url, currentStep: 5 }));
  };

  const handleRestart = () => {
    setProject(INITIAL_STATE);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg"></div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              PrintPulse AI
            </h1>
          </div>
          
          {/* Progress Stepper */}
          <div className="hidden md:flex items-center gap-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = project.currentStep === idx;
              const isCompleted = project.currentStep > idx;
              
              return (
                <div key={idx} className="flex items-center">
                  <div 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 
                      isCompleted ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{step.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-6 h-0.5 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {!hasKey && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                <AlertTriangle size={12} /> Key Required
              </div>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2 rounded-full transition-all ${
                hasKey 
                  ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' 
                  : 'text-amber-600 bg-amber-100 hover:bg-amber-200 animate-pulse'
              }`}
              title="Configure Gemini API Key"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {project.currentStep === 0 && <Step1Trends onSelect={handleTrendSelect} />}
        
        {project.currentStep === 1 && project.selectedTrend && (
          <Step2Design trend={project.selectedTrend} onComplete={handleDesignComplete} />
        )}
        
        {project.currentStep === 2 && project.selectedTrend && project.designImage && (
          <Step3Listing trend={project.selectedTrend} design={project.designImage} onComplete={handleListingComplete} />
        )}
        
        {project.currentStep === 3 && project.designImage && (
          <Step4Mockups design={project.designImage} onComplete={handleMockupsComplete} />
        )}
        
        {project.currentStep === 4 && project.selectedTrend && (
          <Step5Video trend={project.selectedTrend} onComplete={handleVideoComplete} />
        )}
        
        {project.currentStep === 5 && (
          <Step6Publish project={project} onRestart={handleRestart} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} PrintPulse AI. Built with Google Gemini.</p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onKeyUpdate={(status) => setHasKey(status)}
      />
    </div>
  );
};

export default App;