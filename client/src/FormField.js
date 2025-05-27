import React from 'react';
import { useController } from 'react-hook-form';
import { FaCheckCircle } from 'react-icons/fa';

const FormField = React.memo(({ 
  control,
  name,
  label,
  type = 'text',
  required = false,
  validation = {},
  options = [],
  icon: Icon,
  errors,
  ...props 
}) => {
  const { field } = useController({
    name,
    control,
    rules: { 
      required: required && `${label} is required`, 
      ...validation 
    }
  });

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        
        {type === 'select' ? (
          <select
            {...field}
            className={`${Icon ? 'pl-10' : 'pl-3'} w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors?.[name] ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            {...props}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            {...field}
            className={`${Icon ? 'pl-10' : 'pl-3'} w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors?.[name] ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
            {...props}
          />
        )}
        
        {!errors?.[name] && field.value && (
          <FaCheckCircle className="w-4 h-4 absolute right-3 top-3 text-green-500" />
        )}
      </div>
      {errors?.[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>
      )}
    </div>
  );
});

export default FormField;