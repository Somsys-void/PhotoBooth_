import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import html2canvas from "html2canvas";
import Draggable from "react-draggable"; 
import { Camera, Download, RefreshCcw, Sparkles, Palette, Image as ImageIcon, Upload, Fish, PartyPopper, Flame, Gift, X } from "lucide-react";

const FILTERS = [
  { name: "Normal", value: "none", color: "#fee2e2" },
  { name: "Soft", value: "contrast(90%) brightness(110%) saturate(90%)", color: "#fce7f3" },
  { name: "B&W", value: "grayscale(100%) contrast(110%)", color: "#f3f4f6" },
  { name: "Vintage", value: "sepia(50%) contrast(90%)", color: "#ffedd5" },
];

const STRIP_THEMES = [
  { name: "Classic White", bg: "bg-white", text: "text-gray-800" },
  { name: "Midnight Black", bg: "bg-gray-900", text: "text-white" },
  { name: "Baby Pink", bg: "bg-pink-100", text: "text-pink-600" },
  { name: "Sky Blue", bg: "bg-blue-100", text: "text-blue-600" },
];

const STICKER_CATEGORIES = {
  "New Year": {
    icon: <PartyPopper size={16} />,
    items: ["🥂", "🍾", "🎆", "🎊", "🎉", "🕛", "🎩", "🎇", "🥳", "🗓️"]
  },
  "Christmas": {
    icon: <Gift size={16} />,
    items: ["🎄", "🎅", "🤶", "🦌", "☃️", "❄️", "🍪", "🥛", "🎁", "🧦"]
  },
  "Diwali": {
    icon: <Flame size={16} />,
    items: ["🪔", "🕯️", "💥", "✨", "🕉️", "🧡", "🎆", "🍬", "🙏", "🏺"]
  },
  "Fish & Sea": {
    icon: <Fish size={16} />,
    items: ["🐟", "🐠", "🐡", "🦈", "🐙", "🐚", "🐳", "🦀", "🦞", "🌊"]
  }
};

const DraggableSticker = ({ id, content, type, onDelete }) => {
  const nodeRef = useRef(null);
  return (
    <Draggable nodeRef={nodeRef} bounds="parent">
      <div 
        ref={nodeRef} 
        className="group absolute cursor-move hover:scale-110 transition-transform pointer-events-auto select-none touch-none drop-shadow-lg" 
        style={{ zIndex: 50, touchAction: "none" }}
      >
        <button
            onClick={() => onDelete(id)}
            onTouchEnd={() => onDelete(id)}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-50 hover:bg-red-600"
            title="Delete Sticker"
        >
            <X size={12} strokeWidth={3} />
        </button>

        {type === 'image' ? (
           <img src={content} alt="sticker" className="w-24 h-auto pointer-events-none" />
        ) : (
           <span className="text-5xl">{content}</span>
        )}
      </div>
    </Draggable>
  );
};

const App = () => {
  const webcamRef = useRef(null);
  const stripRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [captures, setCaptures] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(FILTERS[0]);
  const [currentTheme, setCurrentTheme] = useState(STRIP_THEMES[0]);
  const [countdown, setCountdown] = useState(null);
  
  const [myStickers, setMyStickers] = useState([]); 
  const [activeCategory, setActiveCategory] = useState("New Year");

  const startBurst = useCallback(() => {
    setIsCapturing(true);
    setCaptures([]);
    setMyStickers([]); 
    let photosTaken = 0;

    const takePhoto = () => {
      let count = 3; 
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(timer);
          setCountdown("✨");
          const imageSrc = webcamRef.current.getScreenshot();
          setCaptures(prev => [...prev, imageSrc]);
          photosTaken++;
          if (photosTaken < 3) {
            setTimeout(() => takePhoto(), 1500);
          } else {
            setCountdown(null);
            setIsCapturing(false);
          }
        }
      }, 1000);
    };
    takePhoto();
  }, [webcamRef]);

  const addEmojiSticker = (emoji) => {
    setMyStickers([...myStickers, { id: Date.now() + Math.random(), content: emoji, type: 'text' }]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setMyStickers([...myStickers, { id: Date.now() + Math.random(), content: imageUrl, type: 'image' }]);
    }
  };

  const removeSticker = (idToRemove) => {
    setMyStickers(myStickers.filter(sticker => sticker.id !== idToRemove));
  };

  const downloadStrip = async () => {
    if (stripRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(stripRef.current, { useCORS: true, scale: 2, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `cute-strip-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const videoConstraints = { width: 1280, height: 720, facingMode: "user" };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200 via-purple-200 to-pink-200 flex flex-col items-center justify-center p-4 font-sans text-gray-700">
      
      <div className="relative w-full max-w-6xl bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 p-6 md:p-10 flex flex-col items-center min-h-[600px]">
        
        <div className="mb-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600 font-handwriting drop-shadow-sm">
            Share Memories
          </h1>
        </div>

        {captures.length < 3 && (
          <div className="flex flex-col items-center gap-8 w-full max-w-2xl animate-fade-in-up">
            <div className="relative w-full aspect-video bg-white p-4 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/60">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-900 shadow-inner">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                  style={{ filter: currentFilter.value }}
                />
                {countdown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <span className="text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse">
                      {countdown}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-between bg-white/60 p-4 rounded-3xl border border-white">
                <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 px-2 scrollbar-hide">
                    {FILTERS.map((f) => (
                        <button
                        key={f.name}
                        onClick={() => setCurrentFilter(f)}
                        className={`flex-shrink-0 w-12 h-12 rounded-full border-4 shadow-sm transition-all hover:scale-110 ${
                            currentFilter.name === f.name ? "border-pink-500 scale-110" : "border-white"
                        }`}
                        style={{ backgroundColor: f.color }}
                        title={f.name}
                        />
                    ))}
                </div>
                <button
                onClick={startBurst}
                disabled={isCapturing}
                className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl text-white font-bold text-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                <Camera size={24} fill="currentColor" className="opacity-50" />
                {isCapturing ? "Say Cheese!" : "Start Booth"}
                </button>
            </div>
          </div>
        )}

        {captures.length === 3 && (
          <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center animate-fade-in-up">
            
            <div className="flex-shrink-0 order-1 lg:order-2 mx-auto">
                <div 
                  ref={stripRef}
                  className={`relative p-6 pb-16 shadow-2xl flex flex-col gap-4 w-72 md:w-80 items-center transition-all duration-300 ${currentTheme.bg} rotate-1 hover:rotate-0`}
                >
                  <div className="text-center pb-2 opacity-50">
                      <Sparkles className={`w-6 h-6 mx-auto ${currentTheme.text}`} />
                  </div>
                  {captures.map((img, idx) => (
                    <div key={idx} className="w-full aspect-[4/3] overflow-hidden bg-gray-100 shadow-sm border-[6px] border-white">
                      <img src={img} className="w-full h-full object-cover transform scale-x-[-1]" style={{ filter: currentFilter.value }} />
                    </div>
                  ))}
                  <div className={`mt-6 text-center ${currentTheme.text}`}>
                    <p className="font-mono text-[10px] opacity-60 uppercase tracking-[0.2em] mb-1">
                      {new Date().toLocaleDateString()}
                    </p>
                    <h2 className="font-handwriting text-3xl font-bold transform -rotate-3 opacity-90">
                      Memories ✨
                    </h2>
                  </div>

                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {myStickers.map((sticker) => (
                          <DraggableSticker 
                            key={sticker.id} 
                            id={sticker.id}
                            content={sticker.content} 
                            type={sticker.type} 
                            onDelete={removeSticker}
                          />
                      ))}
                  </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md order-2 lg:order-1">
                
                <div className="bg-white/50 p-5 rounded-3xl border border-white">
                    <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                        <Palette size={14}/> Paper Style
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {STRIP_THEMES.map(theme => (
                            <button
                                key={theme.name}
                                onClick={() => setCurrentTheme(theme)}
                                className={`p-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                    currentTheme.name === theme.name 
                                    ? "border-pink-500 bg-pink-50 text-pink-700" 
                                    : "border-transparent bg-white text-gray-600"
                                }`}
                            >
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/50 p-5 rounded-3xl border border-white flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider flex items-center gap-2">
                          <ImageIcon size={14}/> Add Stickers
                      </h3>
                      <button 
                        onClick={() => fileInputRef.current.click()}
                        className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-black transition-colors"
                      >
                        <Upload size={10} /> Upload Own
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileUpload} 
                      />
                    </div>

                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                      {Object.keys(STICKER_CATEGORIES).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all ${
                            activeCategory === cat ? "bg-pink-500 text-white" : "bg-white text-gray-500"
                          }`}
                        >
                          {STICKER_CATEGORIES[cat].icon} {cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-1">
                        {STICKER_CATEGORIES[activeCategory].items.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => addEmojiSticker(emoji)}
                                className="text-3xl hover:bg-white/80 rounded-xl p-1 transition-transform hover:scale-125 active:scale-95"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setCaptures([])} className="py-3 bg-white text-gray-600 rounded-2xl font-bold shadow-sm hover:text-red-500 flex justify-center items-center gap-2">
                       <RefreshCcw size={16} /> Restart
                    </button>
                    <button onClick={downloadStrip} className="py-3 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black flex justify-center items-center gap-2">
                       <Download size={16} /> Save Strip
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default App;