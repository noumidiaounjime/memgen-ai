import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Type, 
  Image as ImageIcon, 
  Share2, 
  Trash2,
  ChevronRight,
  Loader2,
  Wand2
} from 'lucide-react';
import { generateMemeImage, suggestMemePrompt } from './services/gemini';

interface MemeState {
  id: string;
  imageUrl: string;
  topText: string;
  bottomText: string;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMeme, setCurrentMeme] = useState<MemeState | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [history, setHistory] = useState<MemeState[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const imageUrl = await generateMemeImage(prompt);
      setCurrentMeme({
        id: Date.now().toString(),
        imageUrl,
        topText: '',
        bottomText: ''
      });
      setTopText('');
      setBottomText('');
    } catch (error: any) {
      console.error(error);
      alert("Erreur lors de la génération de l'image.\n\nDétails: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSurpriseMe = async () => {
    const suggested = await suggestMemePrompt();
    setPrompt(suggested);
  };

  const drawMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMeme) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentMeme.imageUrl;
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Setup text style
      const fontSize = canvas.width / 10;
      ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Draw Top Text
      if (topText) {
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
      }

      // Draw Bottom Text
      ctx.textBaseline = 'bottom';
      if (bottomText) {
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      }
    };
  };

  useEffect(() => {
    if (currentMeme) {
      drawMeme();
    }
  }, [currentMeme, topText, bottomText]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // Add to history
    if (currentMeme) {
      setHistory(prev => [{
        ...currentMeme,
        topText,
        bottomText,
        imageUrl: canvas.toDataURL('image/png')
      }, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">MemeGen <span className="text-indigo-500">AI</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              Générateur
            </button>
            <button 
              onClick={() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
            >
              Galerie
            </button>
          </nav>
          <button 
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: 'MemeGen AI',
                    text: 'Regardez ce générateur de mèmes incroyable !',
                    url: window.location.href,
                  });
                } else {
                  await navigator.clipboard.writeText(window.location.href);
                  alert('Lien copié dans le presse-papier !');
                }
              } catch (err) {
                console.error('Erreur lors du partage:', err);
              }
            }}
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-700 active:scale-95"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">1. Créez votre base</h2>
                <button 
                  onClick={handleSurpriseMe}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Surprenez-moi
                </button>
              </div>
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez l'image de votre mème... (ex: Un astronaute qui réalise qu'il a oublié ses clés sur Terre)"
                  className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
                />
                <button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Générer
                    </>
                  )}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {currentMeme && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-display font-bold">2. Ajoutez l'humour</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <Type className="w-4 h-4" /> Texte du haut
                      </label>
                      <input
                        type="text"
                        value={topText}
                        onChange={(e) => setTopText(e.target.value)}
                        placeholder="TOP TEXT"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <Type className="w-4 h-4" /> Texte du bas
                      </label>
                      <input
                        type="text"
                        value={bottomText}
                        onChange={(e) => setBottomText(e.target.value)}
                        placeholder="BOTTOM TEXT"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      Télécharger le mème
                    </button>
                    <button
                      onClick={() => setCurrentMeme(null)}
                      className="p-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-square bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden group shadow-2xl">
              {currentMeme ? (
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <ImageIcon className="w-10 h-10 text-zinc-600" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-400">Aperçu du mème</h3>
                  <p className="text-zinc-600 max-w-xs mx-auto">
                    Générez une image pour commencer à créer votre chef-d'œuvre.
                  </p>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <Sparkles className="w-6 h-6 text-indigo-400 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <p className="text-indigo-400 font-medium animate-pulse">L'IA réfléchit...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <section id="history-section" className="mt-24 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display font-bold">Vos créations récentes</h2>
              <button 
                onClick={() => setHistory([])}
                className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
              >
                Effacer l'historique
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {history.map((meme) => (
                <motion.div
                  key={meme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
                >
                  <img 
                    src={meme.imageUrl} 
                    alt="Recent meme" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = `meme-${meme.id}.png`;
                        link.href = meme.imageUrl;
                        link.click();
                      }}
                      className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Download className="w-3 h-3" /> Télécharger
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

    </div>
  );
}
