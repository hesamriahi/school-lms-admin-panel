import dayjs from 'dayjs';
import jalaliday from 'jalaliday';

dayjs.extend(jalaliday);

export function ToJalali(date: string, format: string = 'YYYY/MM/DD HH:mm'): string {
  const formattedDate = dayjs(date)
    .calendar('jalali')
    .locale('fa')
    .format(format);
    
  // تبدیل اعداد انگلیسی به فارسی
  return formattedDate
    .replace(/0/g, '۰')
    .replace(/1/g, '۱')
    .replace(/2/g, '۲')
    .replace(/3/g, '۳')
    .replace(/4/g, '۴')
    .replace(/5/g, '۵')
    .replace(/6/g, '۶')
    .replace(/7/g, '۷')
    .replace(/8/g, '۸')
    .replace(/9/g, '۹');
}