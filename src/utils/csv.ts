export type Row = Record<string, string | number | boolean | null | undefined>;

export function exportSimpleCSV(rows: Row[], filename = 'download.csv') {
  if (!rows.length) return;

  /** Turn every value into a printable string */
  const toCell = (v: Row[keyof Row]) =>
    (v ?? '').toString().replace(/"/g, '""'); // escape quotes

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${toCell(r[h])}"`).join(',')),
  ].join('\r\n');

  // Browser download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}