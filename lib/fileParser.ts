
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { CardData } from '../types.ts';

export const parseFile = (file: File): Promise<CardData[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'xls' || extension === 'xlsx') {
      return parseExcel(file);
  }
  return parseCsv(file);
};

const parseCsv = (file: File): Promise<CardData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CardData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          reject(new Error(results.errors[0].message));
        } else {
          resolve(results.data);
        }
      },
      error: (error: Error) => reject(error),
    });
  });
};

const parseExcel = (file: File): Promise<CardData[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json<CardData>(worksheet);
            resolve(json);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};