import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Check,
  X,
  Move,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  onCropComplete,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<'circle' | 'square'>('circle');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
  }, [imageSrc]);

  // Render crop preview canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300; // Canvas dimensions (300x300)
    canvas.width = size;
    canvas.height = size;

    // Clear background
    ctx.clearRect(0, 0, size, size);

    ctx.save();

    // Center origin
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect scale to cover
    const scale = Math.max(size / img.width, size / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

    ctx.restore();
  }, [zoom, rotation, offset, imageLoaded]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset parameters
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Generate cropped and compressed image for database persistence
  const handleSaveCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas of optimal avatar size (200x200)
    const exportSize = 200;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Fill white background for JPEG compression
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportSize, exportSize);

    ctx.drawImage(canvas, 0, 0, exportSize, exportSize);
    
    let croppedDataUrl = '';
    try {
      croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.84);
    } catch {
      try {
        croppedDataUrl = exportCanvas.toDataURL('image/png');
      } catch {
        croppedDataUrl = exportCanvas.toDataURL();
      }
    }

    onCropComplete(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Adjust Profile Photo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Viewport & Canvas Area */}
        <div className="flex flex-col items-center space-y-3">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center cursor-grab ${
              isDragging ? 'cursor-grabbing' : ''
            }`}
          >
            {/* The canvas */}
            <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

            {/* Viewport Overlay Mask */}
            <div
              className={`absolute inset-0 pointer-events-none ring-4 ring-purple-500/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.6)] ${
                cropShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
              }`}
            />

            {/* Instruction tooltip */}
            <div className="absolute bottom-2 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-[10px] font-bold text-white/90 flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3 text-purple-400" /> Drag to Pan Position
            </div>
          </div>

          {/* Mask Shape Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCropShape('circle')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cropShape === 'circle'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Circle Crop
            </button>
            <button
              type="button"
              onClick={() => setCropShape('square')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cropShape === 'square'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Square Crop
            </button>
          </div>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-purple-600" /> Zoom Level
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-400">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-700 dark:text-slate-300 shrink-0"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-700 dark:text-slate-300 shrink-0"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rotation & Reset Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> -90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-600" /> +90°
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" /> Apply & Save Photo
          </button>
        </div>
      </div>
    </div>
  );
};
