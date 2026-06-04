/**
 * CSV utility library for order import/export.
 *
 * Data rows use a flat key-value map where keys are Chinese column headers
 * (matching the CSV headers), making it easy to pipe data in and out.
 */

/** Column definition for CSV – a Chinese label visible to the user and an English field key used in code. */
export interface CsvColumn {
  label: string;
  key: string;
}

/* ------------------------------------------------------------------ */
/*  Column definitions                                                */
/* ------------------------------------------------------------------ */

/** Columns included in EXPORT (all order fields the table shows). */
export const EXPORT_COLUMNS: CsvColumn[] = [
  { label: '订单编号', key: 'order_number' },
  { label: '物流方式', key: 'shipping_method' },
  { label: '商品清单', key: 'product_list' },
  { label: '备注/留言', key: 'remarks' },
  { label: '状态', key: 'status' },
  { label: '货况信息', key: 'tracking_info' },
  { label: '创建时间', key: 'created_at' },
];

/** Columns included in the IMPORT template (id / created_at are system-managed). */
export const IMPORT_COLUMNS: CsvColumn[] = [
  { label: '订单编号', key: 'order_number' },
  { label: '物流方式', key: 'shipping_method' },
  { label: '商品清单', key: 'product_list' },
  { label: '备注/留言', key: 'remarks' },
  { label: '状态', key: 'status' },
  { label: '货况信息', key: 'tracking_info' },
];

/** Columns for inventory-apply import template. */
export const INVENTORY_APPLY_IMPORT_COLUMNS: CsvColumn[] = [
  { label: '仓单条码', key: 'barcode' },
  { label: '仓库', key: 'warehouse' },
  { label: '快递单号', key: 'tracking_number' },
  { label: 'SKU/商品名', key: 'sku' },
  { label: '库位号', key: 'location' },
  { label: '数量', key: 'quantity' },
  { label: '备注', key: 'remarks' },
];

/** Columns for inventory-products import template. */
export const INVENTORY_PRODUCTS_IMPORT_COLUMNS: CsvColumn[] = [
  { label: '仓点', key: 'store_name' },
  { label: '商品编号/SKU', key: 'sku' },
  { label: '商品名', key: 'name' },
  { label: '价格', key: 'price' },
  { label: '总数', key: 'total_count' },
  { label: '剩余数量', key: 'remaining_count' },
  { label: '状态', key: 'status' },
];

/** Columns for Taiwan apply import template. */
export const TAIWAN_APPLY_IMPORT_COLUMNS: CsvColumn[] = [
  { label: '會員/代理/貨件編號', key: 'member_code' },
  { label: '商品數', key: 'product_count' },
  { label: '艙單類型', key: 'manifest_type' },
  { label: '備註', key: 'remarks' },
];

/* ------------------------------------------------------------------ */
/*  Escape helpers                                                     */
/* ------------------------------------------------------------------ */

/** Escape a single CSV cell value (wrap in quotes if it contains comma, quote, or newline). */
function escapeCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Escape a row of values into a CSV line. */
function escapeRow(values: unknown[]): string {
  return values.map(escapeCell).join(',');
}

/* ------------------------------------------------------------------ */
/*  Generate                                                           */
/* ------------------------------------------------------------------ */

/**
 * Convert an array of flat row objects into a CSV string.
 *
 * @param rows    – Array of row objects (keys must match the column keys).
 * @param columns – Ordered column definitions (label → header, key → value extractor).
 */
export function generateCsv(rows: Record<string, unknown>[], columns: CsvColumn[]): string {
  const header = columns.map((c) => c.label);
  const lines = [escapeRow(header)];

  for (const row of rows) {
    lines.push(escapeRow(columns.map((c) => row[c.key])));
  }

  // BOM for Excel to correctly recognise UTF-8
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

/* ------------------------------------------------------------------ */
/*  Parse                                                              */
/* ------------------------------------------------------------------ */

/**
 * Parse a CSV string into an array of flat row objects.
 *
 * The first line is treated as the header.  Rows that have fewer cells
 * than the header are padded with empty strings; extra cells are ignored.
 *
 * @returns List of objects keyed by the header labels.
 */
export function parseCsv(text: string): Record<string, string>[] {
  // Split into lines, handling both \r\n and \n
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const lines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};

    header.forEach((col, idx) => {
      row[col] = idx < cells.length ? cells[idx] : '';
    });

    rows.push(row);
  }

  return rows;
}

/**
 * Parse a single CSV line into cells, handling quoted values.
 *
 * "a,b","c""d",e  →  ['a,b', 'c"d', 'e']
 */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote ""
          current += '"';
          i++; // skip next "
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }

  cells.push(current);
  return cells;
}

/* ------------------------------------------------------------------ */
/*  Download helper                                                    */
/* ------------------------------------------------------------------ */

/**
 * Trigger a browser download of a CSV string as a .csv file.
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Template                                                           */
/* ------------------------------------------------------------------ */

/**
 * Generate a template CSV (headers + one empty row) for download.
 */
export function generateTemplateCsv(columns: CsvColumn[]): string {
  return generateCsv(
    [Object.fromEntries(columns.map((c) => [c.key, '']))],
    columns,
  );
}
