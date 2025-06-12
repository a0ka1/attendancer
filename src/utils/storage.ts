import { AttendanceRecord } from '../types';

const RECORDS_KEY = 'attendance-records';

export const loadAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const stored = localStorage.getItem(RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading attendance records:', error);
    return [];
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Error saving attendance records:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};