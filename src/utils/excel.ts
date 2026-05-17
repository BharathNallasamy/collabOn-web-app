import * as XLSX from "xlsx";

/** Normalise a cell key or value to lowercase trimmed string for comparison */
export const normalise = (s: unknown): string => String(s ?? "").trim().toLowerCase();

/** Find a field in a row by any of the given normalised key aliases */
export const findField = (row: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const k of Object.keys(row)) {
    if (keys.includes(normalise(k))) return row[k];
  }
  return undefined;
};

/** Read an xlsx/xls/csv file and return all rows as plain objects */
export const readXlsxFile = (file: File): Promise<Record<string, unknown>[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data  = new Uint8Array(evt.target!.result as ArrayBuffer);
        const wb    = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }));
      } catch {
        reject(new Error("Failed to parse file — ensure it is a valid .xlsx or .csv"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });

/** Export a data array to an Excel (.xlsx) file */
export const exportToExcel = (
  data: Record<string, unknown>[],
  sheetName: string,
  fileName: string,
): void => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName);
};

/** Export a data array to a CSV file */
export const exportToCSV = (
  data: Record<string, unknown>[],
  fileName: string,
): void => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const escape  = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv     = [headers.map(escape).join(","), ...data.map(r => headers.map(h => escape(r[h])).join(","))].join("\n");
  const blob    = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement("a");
  a.href        = url;
  a.download    = fileName;
  a.click();
  URL.revokeObjectURL(url);
};
