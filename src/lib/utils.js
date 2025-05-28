/* eslint-disable max-classes-per-file */

import { clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isBrowser = typeof window !== 'undefined';

// LocalStorageService.js
export class LocalStorageService {
  static get(key) {
    if (!isBrowser) return null;
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}

// SessionStorageService.js
export class SessionStorageService {
  static get(key) {
    if (!isBrowser) return null;
    const value = sessionStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  static set(key, value) {
    if (!isBrowser) return;
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key) {
    if (!isBrowser) return;
    sessionStorage.removeItem(key);
  }

  static clear() {
    if (!isBrowser) return;
    sessionStorage.clear();
  }
}

// Export HTML Table to CSV
export function exportTableToExcel(
  tableID,
  filename = 'exported_table',
  excludeLast = true,
) {
  const table = document.getElementById(tableID);
  if (!table) return;

  const rows = table.getElementsByTagName('tr');
  const csvData = [];

  for (let i = 0; i < rows.length; i++) {
    const row = [];
    const cols = rows[i].querySelectorAll('td, th');
    const length = excludeLast ? cols.length - 1 : cols.length;
    for (let j = 0; j < length; j++) {
      row.push(cols[j].innerText.trim());
    }
    csvData.push(row.join(','));
  }

  const csvContent = `data:text/csv;charset=utf-8,${csvData.join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Clipboard Copy Handler
export const copyHandler = (text) => {
  if (!text) {
    toast.error('Please write something before copying.');
    return;
  }

  if (!navigator.clipboard) {
    toast.error('Clipboard not supported');
    return;
  }

  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};
