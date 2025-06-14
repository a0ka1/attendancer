import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Clock, Shield, Trash2 } from 'lucide-react';
import AttendanceTable from './components/AttendanceTable';
import SignatureModal from './components/SignatureModal';
import { AttendanceRecord } from './types';
import {
  loadAttendanceRecords,
  saveAttendanceRecords,
  generateId
} from './utils/storage';

function App() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    type: 'check-in' | 'check-out';
    driverName: string;
    shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am';
  }>({
    isOpen: false,
    type: 'check-in',
    driverName: '',
    shift: '7am-4pm'
  });

  // Simple admin password - in production, this should be more secure
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const loadedRecords = loadAttendanceRecords();
    setAttendanceRecords(loadedRecords);
  }, []);

  const handleCheckIn = (driverName: string, shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am') => {
    setSignatureModal({
      isOpen: true,
      type: 'check-in',
      driverName,
      shift
    });
  };

  const handleCheckOut = (driverName: string, shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am') => {
    setSignatureModal({
      isOpen: true,
      type: 'check-out',
      driverName,
      shift
    });
  };

  const handleSignatureSave = (log: string, carReceived?: string) => {
    const { type, driverName, shift } = signatureModal;
    const currentTime = new Date().toISOString();

    setAttendanceRecords(prevRecords => {
      let existingRecord = prevRecords.find(
        record => record.driverName === driverName && record.date === currentDate
      );

      if (!existingRecord) {
        existingRecord = {
          id: generateId(),
          driverName,
          date: currentDate,
          shift
        };
      }

      const updatedRecord = {
        ...existingRecord,
        [type === 'check-in' ? 'checkIn' : 'checkOut']: {
          time: currentTime,
          log
        }
      };

      if (type === 'check-in' && carReceived) {
        updatedRecord.carReceived = carReceived;
      }

      const updatedRecords = prevRecords.filter(
        record => !(record.driverName === driverName && record.date === currentDate)
      );
      updatedRecords.push(updatedRecord);

      saveAttendanceRecords(updatedRecords);
      return updatedRecords;
    });

    setSignatureModal({ isOpen: false, type: 'check-in', driverName: '', shift: '7am-4pm' });
  };

  const handleUpdateCar = (recordId: string, car: string) => {
    setAttendanceRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record =>
        record.id === recordId ? { ...record, carReceived: car } : record
      );
      saveAttendanceRecords(updatedRecords);
      return updatedRecords;
    });
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setAdminPassword('');
    } else {
      alert('Incorrect password');
      setAdminPassword('');
    }
  };

  const handleClearAllData = () => {
    setAttendanceRecords([]);
    saveAttendanceRecords([]);
    setShowClearConfirmation(false);
    setShowAdminPanel(false);
    setIsAdminAuthenticated(false);
    alert('All attendance data has been cleared successfully.');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setShowAdminPanel(false);
    setShowClearConfirmation(false);
  };

  const todaysRecords = attendanceRecords.filter(record => record.date === currentDate);
  const checkedInCount = todaysRecords.filter(record => record.checkIn).length;
  const checkedOutCount = todaysRecords.filter(record => record.checkOut).length;
  const uniqueDrivers = new Set(attendanceRecords.map(record => record.driverName)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with Admin Button */}
        <div className="mb-8 text-center relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Driver Attendance System</h1>
          <p className="text-lg text-gray-600">Enter your name to check in or check out</p>

          {/* Admin Access Button */}
          <button
            onClick={() => setShowAdminPanel(true)}
            className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Admin Access"
          >
            <Shield className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Admin Panel
                  </h2>
                  <button
                    onClick={() => {
                      setShowAdminPanel(false);
                      setIsAdminAuthenticated(false);
                      setShowClearConfirmation(false);
                      setAdminPassword('');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Clock className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!isAdminAuthenticated ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Password
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        placeholder="Enter admin password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={handleAdminLogin}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Login
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!showClearConfirmation ? (
                      <>
                        <div className="text-center mb-4">
                          <p className="text-green-600 font-medium">✓ Admin Access Granted</p>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h3 className="font-semibold text-red-800 mb-2">Danger Zone</h3>
                          <p className="text-sm text-red-600 mb-4">
                            This action will permanently delete all attendance records and cannot be undone.
                          </p>
                          <button
                            onClick={() => setShowClearConfirmation(true)}
                            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-5 h-5" />
                            Clear All Data
                          </button>
                        </div>

                        <button
                          onClick={handleAdminLogout}
                          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-8 h-8 text-red-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Confirm Data Deletion
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Are you absolutely sure you want to delete all attendance records?
                            This action cannot be undone and will remove:
                          </p>
                          <ul className="text-sm text-gray-600 text-left bg-gray-50 rounded-lg p-3 mb-4">
                            <li>• All driver attendance records</li>
                            <li>• All check-in and check-out logs</li>
                            <li>• All car assignment data</li>
                          </ul>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowClearConfirmation(false)}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleClearAllData}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Delete All Data
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900">{uniqueDrivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Calendar className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Checked In Today</p>
                <p className="text-3xl font-bold text-gray-900">{checkedInCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <FileText className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Checked Out Today</p>
                <p className="text-3xl font-bold text-gray-900">{checkedOutCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Current Date</p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <AttendanceTable
          attendanceRecords={attendanceRecords}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onUpdateCar={handleUpdateCar}
          currentDate={currentDate}
        />

        {/* Signature Modal */}
        <SignatureModal
          isOpen={signatureModal.isOpen}
          onClose={() => setSignatureModal({ ...signatureModal, isOpen: false })}
          onSave={handleSignatureSave}
          type={signatureModal.type}
          driverName={signatureModal.driverName}
          shift={signatureModal.shift}
        />
      </div>
    </div>
  );
}

export default App;