import React, { useState, useEffect, useRef, useCallback } from 'react';
import ApiRequest, { ApiResponse } from '../../classes/ApiRequest';
import Input from '../form/input/InputField';

interface Option {
  value: string | number;
  label: string;
  [key: string]: any;
}

interface SearchableDropDownListProps {
  apiUrl: string;
  searchParamName?: string; // نام query parameter برای جستجو (مثلاً 'search' یا 'q')
  dataPath?: string; // مسیر داده در response (مثلاً 'data.users' یا 'data')
  valueKey?: string; // کلید value در هر آیتم (مثلاً 'id')
  labelKey?: string; // کلید label در هر آیتم (مثلاً 'name' یا 'title')
  placeholder?: string;
  onChange?: (value: Option | null) => void;
  defaultValue?: Option | null;
  disabled?: boolean;
  minSearchLength?: number; // حداقل تعداد کاراکتر برای جستجو
  debounceDelay?: number; // زمان انتظار بعد از توقف تایپ (به میلی‌ثانیه) - پیش‌فرض: 2000ms
  className?: string;
  label?: string;
}

const SearchableDropDownList: React.FC<SearchableDropDownListProps> = ({
  apiUrl,
  searchParamName = 'search',
  dataPath = 'data',
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'جستجو کنید...',
  onChange,
  defaultValue = null,
  disabled = false,
  minSearchLength = 2,
  debounceDelay = 2000, // 2 seconds default
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // برای نشان دادن loading به محض تایپ
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // تابع برای دریافت مقدار تو در تو از object
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  };

  // تبدیل داده API به فرمت Option
  const transformDataToOptions = (data: any[]): Option[] => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item[valueKey],
      label: item[labelKey] || String(item[valueKey]),
      ...item, // نگه داشتن تمام داده‌های اصلی
    }));
  };

  // فراخوانی API برای جستجو
  const fetchOptions = useCallback(async (search: string) => {
    if (!apiUrl) return;

    // اگر ورودی خالی باشد یا کمتر از حداقل کاراکتر باشد، request نفرست
    if (search.length === 0 || search.length < minSearchLength) {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ساخت queryParams با نام searchParamName
      const queryParams: Record<string, any> = {
        [searchParamName]: search
      };

      const response: ApiResponse = await ApiRequest.call(
        apiUrl,
        'GET',
        null,
        queryParams,
        false,
        true
      );

      if (response.success) {
        const data = getNestedValue(response, dataPath);
        const transformedOptions = transformDataToOptions(Array.isArray(data) ? data : []);
        setOptions(transformedOptions);
      } else {
        setError('خطا در دریافت داده‌ها');
        setOptions([]);
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, searchParamName, dataPath, valueKey, labelKey, minSearchLength]);

  // Debounce برای جستجو - منتظر می‌ماند تا کاربر تایپ کردن را متوقف کند
  useEffect(() => {
    // اگر searchTerm خالی باشد، request نفرست
    if (searchTerm.length === 0) {
      setOptions([]);
      setIsTyping(false);
      return;
    }

    // به محض تایپ کردن، loading را نشان بده
    setIsTyping(true);

    // پاک کردن timeout قبلی
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // تنظیم timeout جدید - بعد از debounceDelay میلی‌ثانیه درخواست ارسال می‌شود
    searchTimeoutRef.current = setTimeout(() => {
      fetchOptions(searchTerm);
      setIsTyping(false); // بعد از ارسال درخواست، isTyping را false کن
    }, debounceDelay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchOptions, debounceDelay]);

  // مدیریت کلیک خارج از dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // مدیریت انتخاب یک گزینه
  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    setSearchTerm('');
    onChange?.(option);
  };

  // مدیریت تغییر input جستجو
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };


  // مدیریت پاک کردن انتخاب
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    setSearchTerm('');
    onChange?.(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {selectedOption && !isOpen ? (
          <div className="relative">
            <Input
              type="text"
              value={selectedOption.label}
              placeholder={placeholder}
              disabled={true}
              className="pr-10"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="fill-current"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer text-gray-700 outline-hidden focus:outline-hidden dark:text-gray-400"
            >
              <svg
                className={`stroke-current transition-transform ${isOpen ? 'rotate-180' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={placeholder}
              disabled={disabled}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer text-gray-700 outline-hidden focus:outline-hidden dark:text-gray-400"
            >
              <svg
                className={`stroke-current transition-transform ${isOpen ? 'rotate-180' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {isOpen && (
          <div
            className="absolute top-full left-0 mt-1 z-[9999] w-full max-h-60 overflow-y-auto rounded-lg bg-white shadow-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {(isLoading || isTyping) ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">در حال جستجو ...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-error-500 dark:text-error-400">
                {error}
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                {searchTerm.length > 0 && searchTerm.length < minSearchLength
                  ? `حداقل ${minSearchLength} کاراکتر وارد کنید`
                  : 'نتیجه‌ای یافت نشد'}
              </div>
            ) : (
              <div className="flex flex-col">
                {options.map((option, index) => (
                  <div
                    key={`${option.value}-${index}`}
                    className={`hover:bg-primary/5 w-full cursor-pointer border-b border-gray-200 dark:border-gray-800 transition-colors ${
                      selectedOption?.value === option.value ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="relative flex w-full items-center p-2 pl-3">
                      <div className="text-sm text-gray-800 dark:text-white/90">
                        {option.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableDropDownList;
