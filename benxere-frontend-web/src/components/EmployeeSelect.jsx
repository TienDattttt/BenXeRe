import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import Select from './core/form-controls/select';

const EmployeeSelect = ({ label, value, onChange, employees, placeholder, required = false }) => {
  // Ensure value is a string and not undefined
  const safeValue = value ? String(value) : '';

  return (
    <div className="relative">
      <PersonIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
      <Select
        label={label}
        value={safeValue}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(e);
        }}
        className="pl-10"
        required={required}
        size="small"
        options={[
          { value: '', label: placeholder },
          ...employees.map(employee => ({
            value: String(employee.userId),
            label: `${employee.firstName} ${employee.lastName} ${employee.phoneNumber ? `(${employee.phoneNumber})` : ''}`
          }))
        ]}
      />
      {safeValue && (
        <div className="mt-1 text-xs text-gray-500">
          {employees.find(e => String(e.userId) === safeValue)?.email || ''}
        </div>
      )}
    </div>
  );
};

export default EmployeeSelect;
