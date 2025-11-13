import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import Select from '../core/form-controls/select';

const EmployeeSelect = ({ 
  label, 
  value, 
  onChange, 
  employees, 
  placeholder, 
  required = false 
}) => {
  return (
    <div className="relative">
      <PersonIcon className="absolute left-3 top-[38px] text-gray-400 w-5 h-5" />
      <Select
        label={label}
        value={value}
        onChange={onChange}
        className="pl-10"
        required={required}
        size="small"
        options={[
          { value: '', label: placeholder },
          ...employees.map(employee => ({
            value: employee.id,
            label: `${employee.firstName} ${employee.lastName} ${employee.phone ? `(${employee.phone})` : ''}`
          }))
        ]}
      />
      {value && (
        <div className="mt-1 text-xs text-gray-500">
          {employees.find(e => e.id === value)?.email || ''}
        </div>
      )}
    </div>
  );
};

export default EmployeeSelect;