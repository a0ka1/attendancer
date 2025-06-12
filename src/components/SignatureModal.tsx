import React, { useRef, useState, useEffect } from 'react';
import { X, Save, Car } from 'lucide-react';
import { SignatureModalProps } from '../types';

const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  type,
  driverName,
  shift
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [log, setLog] = useState('');
  const [carReceived, setCarReceived] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  const getShiftDisplay = (shift: string) => {
    switch (shift) {
      case '7am-4pm':
        return '7:00 AM - 4:00 PM';
      case '4pm-1am':
        return '4:00 PM - 1:00 AM';
      case '8am-5pm':
        return '8:00 AM - 5:00 PM';
      case '5pm-2am':
        return '5:00 PM - 2:00 AM';
      default:
        return shift;
    }
  };

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
    // Reset form when modal opens
    if (isOpen) {
      setLog('');
      setCarReceived('');
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleSave = () => {
    if (!hasSignature || !log.trim()) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const signature = canvas.toDataURL();
      onSave(signature, log.trim(), type === 'check-in' ? carReceived : undefined);
      setLog('');
      setCarReceived('');
      clearSignature();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {type === 'check-in' ? 'Check In Process' : 'Check Out Process'}
              </h2>
              <p className="text-gray-600 mt-1">
                Driver: <span className="font-semibold">{driverName}</span> • 
                Shift: <span className="font-semibold">{getShiftDisplay(shift)}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {type === 'check-in' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Car/Vehicle Received
              </label>
              <input
                type="text"
                value={carReceived}
                onChange={(e) => setCarReceived(e.target.value)}
                placeholder="Enter car model, license plate, or vehicle details"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Entry *
            </label>
            <textarea
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder={`Enter ${type} details, notes, or observations...`}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Digital Signature *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 border border-gray-200 rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm text-gray-600">Sign above with your mouse or finger</p>
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                >
                  Clear Signature
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasSignature || !log.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save className="w-5 h-5" />
              Complete {type === 'check-in' ? 'Check In' : 'Check Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;