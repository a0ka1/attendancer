import React, { useState, useEffect } from 'react';
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
  const [log, setLog] = useState('');
  const [carReceived, setCarReceived] = useState('');
  const [carError, setCarError] = useState('');

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
    // Reset form when modal opens
    if (isOpen) {
      setLog('');
      setCarReceived('');
      setCarError('');
    }
  }, [isOpen]);

  const validateCarNumber = (value: string) => {
    if (value === '') {
      setCarError('');
      return true;
    }

    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 1000) {
      setCarError('Car number must be between 1 and 1000');
      return false;
    }

    setCarError('');
    return true;
  };

  const handleCarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarReceived(value);
    validateCarNumber(value);
  };

  const handleSave = () => {
    if (!log.trim()) return;

    if (type === 'check-in') {
      if (!carReceived.trim()) {
        setCarError('Car number is required for check-in');
        return;
      }
      if (!validateCarNumber(carReceived)) {
        return;
      }
    }

    onSave(log.trim(), type === 'check-in' ? carReceived : undefined);
    setLog('');
    setCarReceived('');
    setCarError('');
  };

  const isFormValid = log.trim() && (type === 'check-out' || (carReceived.trim() && !carError));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                Car Number (1-1000) *
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={carReceived}
                onChange={handleCarChange}
                placeholder="Enter car number (1-1000)"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${carError ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {carError && (
                <p className="mt-1 text-sm text-red-600">{carError}</p>
              )}
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

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
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