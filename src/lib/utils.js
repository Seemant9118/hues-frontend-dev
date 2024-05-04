import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const isBrowser = typeof window !== "undefined";
// LocalStorageService.js
export class LocalStorageService {
  // Get a value from local storage by key
  static get(key) {
    if (!isBrowser) return;
    const value = localStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // Set a value in local storage by key
  static set(key, value) {
    if (!isBrowser) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Remove a value from local storage by key
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key);
  }

  // Clear all items from local storage
  static clear() {
    if (!isBrowser) return;
    localStorage.clear();
  }
}
export function exportTableToExcel(
  tableID,
  filename = "exported_table",
  excludeLast = true
) {
  const table = document.getElementById(tableID);
  const rows = table.getElementsByTagName("tr");
  const csvData = [];

  for (let i = 0; i < rows.length; i++) {
    const row = [],
      cols = rows[i].querySelectorAll("td, th");
    for (let j = 0; j < cols.length - excludeLast ? 1 : 0; j++) {
      row.push(cols[j].innerText);
    }
    csvData.push(row.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + csvData.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
