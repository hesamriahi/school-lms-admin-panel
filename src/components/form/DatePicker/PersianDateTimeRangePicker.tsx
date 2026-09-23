import { useState } from "react";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian_en from "react-date-object/locales/gregorian_en";
// import TimePicker from "react-multi-date-picker/plugins/time_picker";
import gregorian from "react-date-object/calendars/gregorian";
import "react-multi-date-picker/styles/colors/purple.css";

type PropsType = {
  id: string;
  onChange?: (value: { start: string; end: string } | null) => void;
  defaultValue?: {
    start: string;
    end: string;
  };
  placeholder?: string;
};

export default function PersianDateTimeRangePicker({
  id,
  defaultValue,
  onChange,
  placeholder
}: PropsType) {

  const initialValue = defaultValue
    ? [
        new DateObject({
          date: defaultValue.start,
          format: "YYYY-MM-DD HH:mm:ss"
        }),
        new DateObject({
          date: defaultValue.end,
          format: "YYYY-MM-DD HH:mm:ss"
        })
      ]
    : undefined;

  const [date, setDate] = useState<DateObject[] | undefined>(initialValue);
  const [isFirstOpen, setIsFirstOpen] = useState<boolean>(true);

  const handleChange = (d: DateObject[] | null) => {

    if (isFirstOpen) {
      setIsFirstOpen(false);
      return;
    }

    setDate(d ?? undefined);

    if (!d || d.length !== 2) {
      onChange?.(null);
      setIsFirstOpen(true);
      return;
    }

    const start = d[0]
      .convert(gregorian)
      .setLocale(gregorian_en)
      .format("YYYY-MM-DD") + " 00:00:00";

    const end = d[1]
      .convert(gregorian)
      .setLocale(gregorian_en)
      .format("YYYY-MM-DD") + " 23:59:59";

    onChange?.({ start, end });
  };

  return (
    <div style={{ direction: "rtl" }} className="relative block w-full">

      <DatePicker
        id={id}
        range
        value={date}
        inputClass="w-full border border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder:text-gray-300 text-right pr-8"
        className="blue w-full"
        containerClassName="w-full rounded-xl"
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        onChange={handleChange}
        placeholder={placeholder}
        // plugins={[
        //   <TimePicker position="bottom" />
        // ]}
      />

      {date && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleChange(null)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-2xl"
        >
          ×
        </button>
      )}

    </div>
  );
}
