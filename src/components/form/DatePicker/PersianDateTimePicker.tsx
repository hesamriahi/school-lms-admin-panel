import { useState } from "react";
import DatePicker from "react-multi-date-picker";

import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import gregorian from "react-date-object/calendars/gregorian";
import "react-multi-date-picker/styles/colors/purple.css";

type PropsType = {
  id: string;
  onChange?: (value: string | null) => void;
  defaultValue?: string;
  placeholder?: string;
};

export default function PersianDateTimePicker({ 
  id,
  defaultValue,
  onChange,
  placeholder
}: PropsType) {
  const initialValue = defaultValue
    ? new DateObject({
        date: defaultValue,
        format: "YYYY-MM-DD HH:mm:ss"
      })
    : null;

  const [date, setDate] = useState<DateObject | null>(initialValue);
  // const [value, setValue] = useState<string>("");
  const [isFirstOpen, setIsFirstOpen] = useState<boolean>(true);
  

  const handleChange = (d: DateObject | null) => {
    if (isFirstOpen) {
      setIsFirstOpen(false);
      return;
    }
    setDate(d);
  
    if (!d) {
      onChange?.(null);
      // setValue("");
      setIsFirstOpen(true);
      return;
    }
  
    const gregorianDate = d
      .convert(gregorian)
      .format("YYYY-MM-DD HH:mm:ss");
    // setValue(gregorianDate);

    onChange?.(gregorianDate);
  };

  return (
    <div style={{ direction: "rtl" }} className="relative block w-full">

      <DatePicker
        id={id}
        value={date}
        inputClass="w-full border border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-center text-gray-800 placeholder:text-gray-300 text-right"
        className="blue w-full"
        containerClassName="w-full rounded-xl"
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD-HH:mm:ss"
        onChange={handleChange}
        placeholder={placeholder}
        plugins={[
          <TimePicker position="bottom" />
        ]}
      />

      {date && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleChange(null)}
          className="absolute left-2 top-1/2  -translate-y-1/2 text-gray-300 text-2xl"
        >
          ×
        </button>
      )}
    </div>
  );
}
