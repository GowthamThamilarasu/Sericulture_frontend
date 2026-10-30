// Report exports without extra packages: real .xlsx and .docx files (Office Open XML in a small zip),
// CSV, JSON, and PDF through the browser's print dialog ("Save as PDF").

export type Cell = string | number | null | undefined;

/** One table in a report. */
export type ReportTable = { heading: string; note?: string; columns: string[]; rows: Cell[][] };

/** A whole report: a title, a line about what it covers, and its tables. */
export type Report = { title: string; subtitle?: string; tables: ReportTable[] };

// ---------------------------------------------------------------- zip (stored, no compression)

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(files: { name: string; text: string }[]): Blob {
  const encoder = new TextEncoder();
  const local: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.text);
    const crc = crc32(data);

    const header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true); // UTF-8 names
    header.setUint32(14, crc, true);
    header.setUint32(18, data.length, true);
    header.setUint32(22, data.length, true);
    header.setUint16(26, name.length, true);
    local.push(new Uint8Array(header.buffer), name, data);

    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint32(16, crc, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);

    offset += 30 + name.length + data.length;
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...local, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/zip" });
}

const xml = (value: Cell) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Characters XML 1.0 does not allow.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");

// ---------------------------------------------------------------- Excel (.xlsx)

const columnName = (index: number) => {
  let name = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + ((n - 1) % 26)) + name;
  return name;
};

function sheetXml(table: ReportTable) {
  const rows: Cell[][] = [[table.heading], ...(table.note ? [[table.note]] : []), [], table.columns, ...table.rows];
  const headerRow = table.note ? 4 : 3;
  const widths = table.columns.map((column, index) => Math.min(60, Math.max(10, column.length + 2, ...table.rows.map((row) => String(row[index] ?? "").length + 2))));
  const body = rows
    .map((row, r) => {
      const cells = row
        .map((value, c) => {
          const ref = `${columnName(c)}${r + 1}`;
          const style = r === 0 ? ' s="2"' : r + 1 === headerRow ? ' s="1"' : "";
          if (typeof value === "number" && Number.isFinite(value)) return `<c r="${ref}"${style}><v>${value}</v></c>`;
          if (value === null || value === undefined || value === "") return "";
          return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${cells}</row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${headerRow}" topLeftCell="A${headerRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("")}</cols><sheetData>${body}</sheetData></worksheet>`;
}

// Sheet names: at most 31 characters, no []:*?/\ and unique.
function sheetNames(tables: ReportTable[]) {
  const used = new Set<string>();
  return tables.map((table) => {
    const base = table.heading.replace(/[[\]:*?/\\]/g, " ").trim().slice(0, 28) || "Sheet";
    let name = base;
    for (let n = 2; used.has(name.toLowerCase()); n++) name = `${base.slice(0, 26)} ${n}`;
    used.add(name.toLowerCase());
    return name;
  });
}

export function toXlsx(report: Report): Blob {
  const tables = report.tables.length ? report.tables : [{ heading: report.title, columns: [], rows: [] }];
  const names = sheetNames(tables);
  const files = [
    {
      name: "[Content_Types].xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${tables.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
    },
    {
      name: "_rels/.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((name, i) => `<sheet name="${xml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${tables.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="rId${tables.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: "xl/styles.xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FF0F5C2E"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F5C2E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>`,
    },
    ...tables.map((table, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, text: sheetXml(table) })),
  ];
  return new Blob([zip(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// ---------------------------------------------------------------- Word (.docx)

const run = (text: Cell, options: { bold?: boolean; size?: number; color?: string } = {}) =>
  `<w:r><w:rPr>${options.bold ? "<w:b/>" : ""}${options.color ? `<w:color w:val="${options.color}"/>` : ""}${options.size ? `<w:sz w:val="${options.size}"/>` : ""}</w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
const paragraph = (content: string, spacingAfter = 120) => `<w:p><w:pPr><w:spacing w:after="${spacingAfter}"/></w:pPr>${content}</w:p>`;

function docxTable(table: ReportTable) {
  const border = `<w:top w:val="single" w:sz="4" w:color="C9E6D1"/><w:left w:val="single" w:sz="4" w:color="C9E6D1"/><w:bottom w:val="single" w:sz="4" w:color="C9E6D1"/><w:right w:val="single" w:sz="4" w:color="C9E6D1"/><w:insideH w:val="single" w:sz="4" w:color="C9E6D1"/><w:insideV w:val="single" w:sz="4" w:color="C9E6D1"/>`;
  const cell = (value: Cell, header: boolean) =>
    `<w:tc><w:tcPr>${header ? '<w:shd w:val="clear" w:color="auto" w:fill="0F5C2E"/>' : ""}</w:tcPr><w:p><w:pPr><w:spacing w:after="0"/></w:pPr>${run(value, header ? { bold: true, color: "FFFFFF", size: 18 } : { size: 18 })}</w:p></w:tc>`;
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${border}</w:tblBorders><w:tblCellMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tr><w:trPr><w:tblHeader/></w:trPr>${table.columns.map((column) => cell(column, true)).join("")}</w:tr>${table.rows.map((row) => `<w:tr>${table.columns.map((_, i) => cell(row[i], false)).join("")}</w:tr>`).join("")}</w:tbl>`;
}

export function toDocx(report: Report): Blob {
  const body = [
    paragraph(run(report.title, { bold: true, size: 40, color: "0F5C2E" }), 60),
    report.subtitle ? paragraph(run(report.subtitle, { size: 20, color: "686D6A" }), 240) : "",
    ...report.tables.flatMap((table) => [
      paragraph(run(table.heading, { bold: true, size: 28, color: "0F5C2E" }), 80),
      table.note ? paragraph(run(table.note, { size: 18, color: "686D6A" }), 80) : "",
      table.rows.length ? docxTable(table) : paragraph(run("No records.", { size: 18, color: "686D6A" })),
      paragraph("", 200),
    ]),
  ].join("");
  const files = [
    {
      name: "[Content_Types].xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      name: "word/document.xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    },
  ];
  return new Blob([zip(files)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

// ---------------------------------------------------------------- CSV, JSON, download

export function toCsv(report: Report): Blob {
  const line = (cells: Cell[]) => cells.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",");
  const text = report.tables.flatMap((table) => [line([table.heading]), line(table.columns), ...table.rows.map(line), ""]).join("\r\n");
  // BOM so Excel reads UTF-8 (°C, ₹, Tamil names) correctly.
  return new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" });
}

export const toJson = (data: unknown) => new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const fileSlug = (title: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${new Date().toISOString().slice(0, 10)}`;

// ---------------------------------------------------------------- PDF (print view)

/** Report as a printable page; the browser's print dialog saves it as a PDF. Returns false if a popup blocker stopped it. */
export function printReport(report: Report, brand = "Paari Seritech") {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  const generated = new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const tables = report.tables
    .map(
      (table) => `<section><h2>${xml(table.heading)}</h2>${table.note ? `<p class="note">${xml(table.note)}</p>` : ""}${
        table.rows.length
          ? `<table><thead><tr>${table.columns.map((column) => `<th>${xml(column)}</th>`).join("")}</tr></thead><tbody>${table.rows.map((row) => `<tr>${table.columns.map((_, i) => `<td>${xml(row[i])}</td>`).join("")}</tr>`).join("")}</tbody></table>`
          : '<p class="note">No records.</p>'
      }</section>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${xml(report.title)}</title><style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #101211; margin: 0; padding: 24px; }
    header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0f5c2e; padding-bottom: 12px; margin-bottom: 18px; }
    .brand { font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #00a218; }
    h1 { font-size: 24px; margin: 4px 0 2px; color: #0f5c2e; }
    .sub, .note, .meta { color: #686d6a; font-size: 12px; margin: 0; }
    h2 { font-size: 15px; color: #0f5c2e; margin: 22px 0 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; page-break-inside: auto; }
    th { background: #0f5c2e; color: #fff; text-align: left; padding: 6px 8px; font-weight: 600; }
    td { border-bottom: 1px solid #dcefe1; padding: 5px 8px; vertical-align: top; }
    tr:nth-child(even) td { background: #f3faf4; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    footer { margin-top: 28px; font-size: 10px; color: #9aa09c; text-align: center; }
  </style></head><body><header><div><div class="brand">${xml(brand)}</div><h1>${xml(report.title)}</h1>${report.subtitle ? `<p class="sub">${xml(report.subtitle)}</p>` : ""}</div><p class="meta">Generated ${xml(generated)}</p></header>${tables}<footer>${xml(brand)} · ${xml(report.title)} · ${xml(generated)}</footer><script>window.onload = () => setTimeout(() => window.print(), 300);</script></body></html>`);
  win.document.close();
  return true;
}
