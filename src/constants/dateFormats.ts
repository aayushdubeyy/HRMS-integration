export type DateFormatOption = {
  value: string;
  label: string;
};

export const DATE_FORMAT_OPTIONS: DateFormatOption[] = [
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (e.g. 22-Jun-2026)' },
  { value: 'DD-MMM-YY', label: 'DD-MMM-YY (e.g. 22-Jun-26)' },
  { value: 'D-MMM-YYYY', label: 'D-MMM-YYYY (e.g. 2-Jun-2026)' },
  { value: 'D-MMM-YY', label: 'D-MMM-YY (e.g. 2-Jun-26)' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (e.g. 22-06-2026)' },
  { value: 'DD-MM-YY', label: 'DD-MM-YY (e.g. 22-06-26)' },
  { value: 'D-MM-YYYY', label: 'D-MM-YYYY (e.g. 2-06-2026)' },
  { value: 'D-M-YYYY', label: 'D-M-YYYY (e.g. 2-6-2026)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 22/06/2026)' },
  { value: 'DD/MM/YY', label: 'DD/MM/YY (e.g. 22/06/26)' },
  { value: 'D/M/YYYY', label: 'D/M/YYYY (e.g. 2/6/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 06/22/2026)' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (e.g. 06-22-2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-06-22)' },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (e.g. 2026/06/22)' },
  { value: 'YYYYMMDD', label: 'YYYYMMDD (e.g. 20260622)' },
  { value: 'DD MMM YYYY', label: 'DD MMM YYYY (e.g. 22 Jun 2026)' },
  { value: 'D MMM YYYY', label: 'D MMM YYYY (e.g. 2 Jun 2026)' },
  { value: 'MMM DD, YYYY', label: 'MMM DD, YYYY (e.g. Jun 22, 2026)' },
  { value: 'MMMM D, YYYY', label: 'MMMM D, YYYY (e.g. June 2, 2026)' },
  { value: 'YYYY-MM-DD HH:mm:ss', label: 'YYYY-MM-DD HH:mm:ss' },
  { value: 'DD-MMM-YYYY HH:mm:ss', label: 'DD-MMM-YYYY HH:mm:ss' },
  { value: 'DD/MM/YYYY HH:mm:ss', label: 'DD/MM/YYYY HH:mm:ss' },
  { value: 'DD-MM-YYYY HH:mm:ss', label: 'DD-MM-YYYY HH:mm:ss' },
  { value: 'D_MMM_YYYY HH:mm', label: 'D_MMM_YYYY HH:mm' },
  { value: 'D_MMM_YYYY_HH_mm_ss', label: 'D_MMM_YYYY_HH_mm_ss' },
  { value: 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ', label: 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ' },
];

export const DEFAULT_DATE_FORMAT = 'DD-MMM-YYYY';

export function isKnownDateFormat(date_format: string): boolean {
  return DATE_FORMAT_OPTIONS.some((option) => option.value === date_format);
}
