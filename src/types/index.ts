export interface AttendanceRecord {
  id: string;
  driverName: string;
  date: string;
  shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am';
  carReceived?: string;
  checkIn?: {
    time: string;
    log: string;
  };
  checkOut?: {
    time: string;
    log: string;
  };
}

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: string, carReceived?: string) => void;
  type: 'check-in' | 'check-out';
  driverName: string;
  shift: '7am-4pm' | '4pm-1am' | '8am-5pm' | '5pm-2am';
}