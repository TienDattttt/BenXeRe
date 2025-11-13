import Select, { components } from "react-select";
import classNames from "classnames";
import { useField, useFormikContext } from "formik";
import Typography from "../typography";

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    </components.DropdownIndicator>
  );
};

const ClearIndicator = (props) => {
  return (
    <components.ClearIndicator {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </components.ClearIndicator>
  );
};

const MultiValueRemove = (props) => {
  return (
    <components.MultiValueRemove {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </components.MultiValueRemove>
  );
};

const MenuList = (props) => {
  return (
    <components.MenuList {...props}>
      <div className="max-h-60 overflow-y-auto">
        {props.children}
      </div>
    </components.MenuList>
  );
};

const Menu = (props) => {
  return (
    <components.Menu {...props}>
      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white">
        {props.children}
      </div>
    </components.Menu>
  );
};

const controlStyles = {
  base: "border-2 rounded-xl bg-white hover:cursor-pointer transition-all duration-300",
  focus: "border-blue-600 ring-2 ring-blue-200",
  nonFocus: "border-gray-300 hover:border-blue-400",
};

const placeholderStyles = "text-gray-500 pl-2 py-0.5 flex items-center gap-2";
const selectInputStyles = "pl-2 py-1";
const valueContainerStyles = "p-2 gap-2";
const singleValueStyles = "leading-7 ml-2 flex items-center gap-2";
const multiValueStyles = "bg-blue-100 rounded-lg items-center py-0.5 pl-2 pr-1 gap-1.5";
const multiValueLabelStyles = "leading-6 py-0.5";
const multiValueRemoveStyles = 
  "border border-blue-200 bg-white hover:bg-red-50 hover:text-red-800 text-blue-500 hover:border-red-300 rounded-md";
const indicatorsContainerStyles = "p-2 gap-2";
const clearIndicatorStyles = 
  "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800 transition-colors";
const indicatorSeparatorStyles = "bg-gray-300";
const dropdownIndicatorStyles = 
  "p-1 hover:bg-blue-50 text-gray-500 rounded-md hover:text-blue-800 transition-colors";
const menuStyles = "p-2 border-2 border-blue-100 bg-white rounded-xl shadow-xl";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
const optionStyles = {
  base: "hover:cursor-pointer px-3 py-2 rounded-lg transition-colors duration-200",
  focus: "bg-blue-50 text-blue-800",
  selected: "bg-blue-100 text-blue-800 font-medium",
};
const noOptionsMessageStyles = 
  "text-gray-500 p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center";

const Option = ({ children, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <LocationIcon />
        {children}
      </div>
    </components.Option>
  );
};

const SelectField = (props) => {
  const { name, label, className = "", placeholder } = props;
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();
  const isError = meta.touched && meta.error;

  const flattenedOptions = props.options?.flatMap((o) => {
    const isNotGrouped = "value" in o;
    if (isNotGrouped) {
      return o;
    } else {
      return o.options;
    }
  });

  const value = flattenedOptions?.filter((o) => {
    const isArrayValue = Array.isArray(field.value);
    if (isArrayValue) {
      const values = field.value;
      return values.includes(o.value);
    } else {
      return field.value === o.value;
    }
  });

  return (
    <div className={classNames("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Select
        closeMenuOnSelect={true}
        hideSelectedOptions={false}
        unstyled
        placeholder={
          <div className="flex items-center gap-2 text-gray-400">
            <LocationIcon />
            <span>{placeholder}</span>
          </div>
        }
        styles={{
          input: (base) => ({
            ...base,
            "input:focus": {
              boxShadow: "none",
            },
          }),
          multiValueLabel: (base) => ({
            ...base,
            whiteSpace: "normal",
            overflow: "visible",
          }),
          control: (base) => ({
            ...base,
            transition: "all 0.3s ease",
          }),
        }}
        components={{ 
          DropdownIndicator, 
          ClearIndicator, 
          MultiValueRemove,
          Option,
          Menu,
          MenuList
        }}
        menuPlacement="top"
        classNames={{
          control: ({ isFocused }) =>
            classNames(controlStyles.base, {
              [controlStyles.focus]: isFocused,
              [controlStyles.nonFocus]: !isFocused,
            }),
          placeholder: () => placeholderStyles,
          input: () => selectInputStyles,
          valueContainer: () => valueContainerStyles,
          singleValue: () => singleValueStyles,
          multiValue: () => multiValueStyles,
          multiValueLabel: () => multiValueLabelStyles,
          multiValueRemove: () => multiValueRemoveStyles,
          indicatorsContainer: () => indicatorsContainerStyles,
          clearIndicator: () => clearIndicatorStyles,
          indicatorSeparator: () => indicatorSeparatorStyles,
          dropdownIndicator: () => dropdownIndicatorStyles,
          menu: () => menuStyles,
          groupHeading: () => groupHeadingStyles,
          option: ({ isFocused, isSelected }) =>
            classNames(optionStyles.base, {
              [optionStyles.focus]: isFocused,
              [optionStyles.selected]: isSelected,
            }),
          noOptionsMessage: () => noOptionsMessageStyles,
        }}
        value={value}
        onChange={(val) => {
          const _val = val;
          const isArray = Array.isArray(_val);
          if (isArray) {
            const values = _val.map((o) => o.value);
            setFieldValue(name, values);
          } else {
            setFieldValue(name, _val.value);
          }
        }}
        {...props}
      />

      {isError ? (
        <Typography className="text-red-500 text-sm mt-1 ml-2">
          {meta.error}
        </Typography>
      ) : null}
    </div>
  );
};

export default SelectField;
