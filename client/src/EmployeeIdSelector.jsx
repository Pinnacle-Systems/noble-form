import React from 'react';
import PropTypes from 'prop-types';

const EmployeeIdSelector = ({ employeeId, employees, onChange, className }) => {
  console.log(employees,"employees")
  return (
    <select
      value={employeeId}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-2 border border-indigo-300 rounded-lg text-white focus:outline-none  focus:ring-2 focus:ring-indigo-400 ${className}`}
    >
      <option value="">Select Employee ID</option>
      {employees.map((employee) => (
        <option key={employee.DOCID} value={employee.DOCID}>
          {employee.DOCID}
        </option>
      ))}
    </select>
  );
};

EmployeeIdSelector.propTypes = {
  employeeId: PropTypes.string,
  employees: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default EmployeeIdSelector;