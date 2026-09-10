import * as XLSX from 'xlsx';

export function downloadExcel(data: any[], fileName: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function downloadAoaExcel(aoa: any[][], fileName: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function downloadCSVTemplate(type: 'guru' | 'siswa') {
  if (type === 'guru') {
    const headers = ['username', 'nama', 'nip', 'tanggungJawab', 'password'];
    const sampleRows = [
      ['guru_baru', 'Rina Agustina, S.Pd.', '199201012019032001', 'Kelas 1', 'sdnsuratmajan2'],
      ['guru_agama', 'Ahmad Sholihin, S.Pd.I', '198805122015041002', 'Pendidikan Agama Islam', 'sdnsuratmajan2']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    downloadBlob(csvContent, 'template_input_massal_guru.csv', 'text/csv;charset=utf-8;');
  } else {
    const headers = ['nama', 'nis', 'nisn', 'kelas', 'jenisKelamin'];
    const sampleRows = [
      ['Rahmat Dani', '240106', '0148729106', 'Kelas 1', 'L'],
      ['Siti Khodijah', '240107', '0148729107', 'Kelas 1', 'P']
    ];
    const csvContent = [headers.join(','), ...sampleRows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    downloadBlob(csvContent, 'template_input_massal_siswa.csv', 'text/csv;charset=utf-8;');
  }
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
