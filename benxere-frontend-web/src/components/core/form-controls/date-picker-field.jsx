import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, isBefore, startOfToday, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useField, useFormikContext } from "formik";
import Typography from "../typography";
import { createPortal } from "react-dom";
import "react-day-picker/dist/style.css";

// Custom styles for the date picker
const datePickerStyles = `
  .custom-calendar {
    --highlighted-color: rgb(99 102 241);
    --highlighted-text-color: white;
    --blur-color: rgba(99, 102, 241, 0.1);
  }
  .custom-calendar .rdp-day_selected:not([disabled]) {
    background-color: var(--highlighted-color);
    color: var(--highlighted-text-color);
    transform: scale(1.1);
  }
  .custom-calendar .rdp-day_today:not(.rdp-day_selected) {
    border: 2px solid var(--highlighted-color);
    color: var(--highlighted-color);
    font-weight: bold;
  }
  .custom-calendar .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--blur-color);
    transform: scale(1.1);
    transition: all 0.2s ease;
  }
  .custom-calendar .rdp-day {
    transition: all 0.2s ease;
    border-radius: 50%;
    aspect-ratio: 1;
  }
  .custom-calendar .rdp-nav_button:hover {
    background-color: var(--blur-color);
  }
  .custom-calendar .rdp-day[aria-disabled='true'] {
    opacity: 0.5;
    text-decoration: line-through;
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const DatePickerField = ({ label, name, placeholder, ...props }) => {
  const today = startOfToday();
  const disabledDays = { before: today };
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const [selected, setSelected] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const isError = meta.touched && meta.error;

  const handleOnClick = () => {
    setIsOpen(true);
    calculatePosition();
  };

  const handleDaySelect = (date) => {
    if (date) {
      setSelected(date);
      const val = format(date, "dd-MM-yyyy", { locale: vi });
      setFieldValue(name, val);
      setIsOpen(false);
    } else {
      setFieldValue(name, "");
    }
  };

  const calculatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      const spaceBelow = viewportHeight - rect.bottom;
      const calendarHeight = 360; // Approximate height of calendar
      
      const top = spaceBelow < calendarHeight 
        ? rect.top - calendarHeight - 10 
        : rect.bottom + 10;
        
      const left = Math.min(
        Math.max(rect.left, 10),
        viewportWidth - 330
      );

      setPopupPosition({ top, left });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll, true);
    
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (field.value) {
      const [date, month, year] = field.value.split("/");
      const defaultDate = new Date(year, month - 1, date);
      setSelected(defaultDate);
    }
  }, [field.value]);

  useEffect(() => {
    if (!document.getElementById('date-picker-styles')) {
      const style = document.createElement('style');
      style.id = 'date-picker-styles';
      style.innerHTML = datePickerStyles;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById('date-picker-styles');
      if (style) style.remove();
    };
  }, []);

  return (
    <div className="relative">
      <label htmlFor={field.name}>{label}</label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          onClick={handleOnClick}
          onChange={() => {}}
          className="border border-gray-300 hover:border-indigo-400 focus:border-indigo-500 rounded-lg bg-white hover:cursor-pointer h-10 px-4 pl-10 block w-full transition-all duration-200 shadow-sm hover:shadow-md"
          value={field.value}
          placeholder={placeholder || "Chọn ngày đi 🚌"}
          disabled={isOpen}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500">
          🗓️
        </div>
      </div>

      {isOpen && createPortal(
        <div
          ref={ref}
          style={{
            position: 'fixed',
            top: popupPosition.top,
            left: popupPosition.left,
            transform: `scale(${isOpen ? '1' : '0.95'})`,
            opacity: isOpen ? 1 : 0,
            zIndex: 9999
          }}
          className="bg-white rounded-lg shadow-2xl border border-indigo-100 p-4 transition-all duration-300 custom-calendar"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDaySelect}
            disabled={disabledDays}
            className="bg-white rdp"
            modifiers={{
              past: (date) => isBefore(date, today),
            }}
            locale={vi}
            modifiersStyles={{
              selected: {
                fontWeight: "bold"
              },
              past: {
                opacity: "0.5",
                cursor: "not-allowed"
              }
            }}
            footer={
              <div className="text-sm text-gray-500 mt-2 text-center border-t pt-2">
                <span className="text-indigo-600 font-medium">✨ Chọn ngày khởi hành của bạn</span>
              </div>
            }
          />
        </div>,
        document.body
      )}
      
      {isError ? (
        <Typography margin={[8, 0, 0, 0]} className="text-red-500">
          {meta.error}
        </Typography>
      ) : null}
    </div>
  );
};

export default DatePickerField;