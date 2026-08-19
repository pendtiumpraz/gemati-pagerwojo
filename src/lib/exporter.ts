"use client";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportCol = { key: string; header: string };
export type ImportField = {
  key: string;
  header: string;
  required?: boolean;
  example?: string;
  hint?: string;
};

function valueOf(row: any, key: string): string {
  const v = key.split(".").reduce((o, k) => (o == null ? o : o[k]), row);
  return v == null ? "" : String(v);
}

function downloadBlob(content: BlobPart, name: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- EXPORT ---------- */
export function exportExcel(rows: any[], cols: ExportCol[], filename: string) {
  const data = rows.map((r) =>
    Object.fromEntries(cols.map((c) => [c.header, valueOf(r, c.key)]))
  );
  const ws = XLSX.utils.json_to_sheet(data, { header: cols.map((c) => c.header) });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportCSV(rows: any[], cols: ExportCol[], filename: string) {
  const data = rows.map((r) =>
    Object.fromEntries(cols.map((c) => [c.header, valueOf(r, c.key)]))
  );
  const ws = XLSX.utils.json_to_sheet(data, { header: cols.map((c) => c.header) });
  const csv = XLSX.utils.sheet_to_csv(ws);
  downloadBlob("﻿" + csv, `${filename}.csv`, "text/csv;charset=utf-8");
}

export function exportPDF(rows: any[], cols: ExportCol[], filename: string, title?: string) {
  const doc = new jsPDF({ orientation: cols.length > 6 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title || filename, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 21);
  autoTable(doc, {
    head: [cols.map((c) => c.header)],
    body: rows.map((r) => cols.map((c) => valueOf(r, c.key))),
    startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 245] },
  });
  doc.save(`${filename}.pdf`);
}

/* ---------- TEMPLATE IMPORT ---------- */
export function downloadTemplate(
  fields: ImportField[],
  filename: string,
  type: "xlsx" | "csv"
) {
  const headers = fields.map((f) => f.header + (f.required ? " *" : ""));
  const example = fields.map((f) => f.example ?? "");
  if (type === "csv") {
    const csv = [headers.join(","), example.join(",")].join("\n");
    downloadBlob("﻿" + csv, `template-${filename}.csv`, "text/csv;charset=utf-8");
    return;
  }
  const ws = XLSX.utils.aoa_to_sheet([headers, example]);
  ws["!cols"] = headers.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, `template-${filename}.xlsx`);
}

/* ---------- PARSE FILE IMPORT ---------- */
function normHeader(h: string): string {
  return String(h).toLowerCase().replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

export async function parseImportFile(
  file: File,
  fields: ImportField[]
): Promise<Record<string, any>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  // Map header spreadsheet -> field.key (cocokkan by header ternormalisasi)
  const byNorm = new Map(fields.map((f) => [normHeader(f.header), f.key]));
  return raw.map((r) => {
    const out: Record<string, any> = {};
    for (const [h, v] of Object.entries(r)) {
      const key = byNorm.get(normHeader(h));
      if (key) out[key] = typeof v === "string" ? v.trim() : v;
    }
    return out;
  });
}
