import React, { useState } from 'react';
import { Clock, Car, CheckCircle, XCircle, LogIn, LogOut, User, Plus, Users } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AttendanceTableProps {
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (driverName: string, shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am') => void;
  onCheckOut: (driverName: string, shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am') => void;
  onUpdateCar: (recordId: string, car: string) => void;
  currentDate: string;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendanceRecords,
  onCheckIn,
  onCheckOut,
  onUpdateCar,
  currentDate
}) => {
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverShift, setNewDriverShift] = useState<'7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am'>('7am-4pm');
  const [showCheckInForm, setShowCheckInForm] = useState(false);

  const todaysRecords = attendanceRecords.filter(record => record.date === currentDate);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case '7am-4pm':
        return 'bg-blue-100 text-blue-800';
      case '4pm-1am':
        return 'bg-purple-100 text-purple-800';
      case '8am-5pm':
        return 'bg-green-100 text-green-800';
      case '5pm-2am':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewCheckIn = () => {
    if (!newDriverName.trim()) return;

    onCheckIn(newDriverName.trim(), newDriverShift);
    setNewDriverName('');
    setShowCheckInForm(false);
  };

  const handleCheckOut = (record: AttendanceRecord) => {
    onCheckOut(record.driverName, record.shift);
  };

  return (
    <div className="space-y-6">
      {/* Check In Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Driver Check In
        </h2>

        {!showCheckInForm ? (
          <button
            onClick={() => setShowCheckInForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Start Check In Process
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Shift
                </label>
                <select
                  value={newDriverShift}
                  onChange={(e) => setNewDriverShift(e.target.value as '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                >
                  <option value="7am-4pm">7:00 AM - 4:00 PM</option>
                  <option value="4pm-1am">4:00 PM - 1:00 AM</option>
                  <option value="8am-5pm">8:00 AM - 5:00 PM</option>
                  <option value="5pm-2am">5:00 PM - 2:00 AM</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewCheckIn}
                disabled={!newDriverName.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                Proceed to Check In
              </button>
              <button
                onClick={() => {
                  setShowCheckInForm(false);
                  setNewDriverName('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Attendance Records */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Today's Attendance - {new Date(currentDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Driver Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Car Received</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Shift</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todaysRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-lg">No attendance records for today</p>
                      <p className="text-sm">Use the check-in form above to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                todaysRecords.map((record) => {
                  const hasCheckedIn = record.checkIn;
                  const hasCheckedOut = record.checkOut;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-lg">{record.driverName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={record.carReceived || ''}
                            onChange={(e) => onUpdateCar(record.id, e.target.value)}
                            placeholder="Enter car info"
                            className="text-sm border border-gray-200 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full max-w-xs"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hasCheckedIn ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="text-sm font-medium text-green-700">
                                {formatTime(hasCheckedIn.time)}
                              </div>
                              <div className="text-xs text-gray-500">Signed & Logged</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-gray-300" />
                            <span className="text-sm text-gray-500">Not checked in</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasCheckedOut ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <div className="text-sm font-medium text-green-700">
                                {formatTime(hasCheckedOut.time)}
                              </div>
                              <div className="text-xs text-gray-500">Signed & Logged</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-gray-300" />
                            <span className="text-sm text-gray-500">Not checked out</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${getShiftColor(record.shift)}`}>
                            {getShiftDisplay(record.shift)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCheckOut(record)}
                            disabled={!hasCheckedIn?.time || hasCheckedOut?.time !== undefined}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!hasCheckedIn || hasCheckedOut
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                              }`}
                          >
                            <LogOut className="w-4 h-4" />
                            Check Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;