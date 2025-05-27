import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaUser, FaEnvelope, FaPhone, FaCalendar,
  FaMapMarkerAlt, FaUniversity, FaHome,
  FaCity, FaGlobe, FaBuilding, FaIdCard
} from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useGetEmpQuery, useCreateEmpMutation } from './redux/service/employeeMaster';
import EmployeeIdSelector from './EmployeeIdSelector';
import FormField from './FormField';
import Swal from 'sweetalert2';


const EmployeeForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    reset,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      employeeId: '',
      fullName: '',
      dob: '',
      gender: '',
      aadhaar: '',
      pan: '',
      marriedStatus: '',
      email: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    }
  });

  const [employeeId, setEmployeeId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [createEmp] = useCreateEmpMutation();
  const { data: employees = [] } = useGetEmpQuery();
  const employeeData = employees?.data || [];
  console.log(employeeData, "employeesData")
  const filteredEmployees = searchPhone.length === 10
    ? employeeData.filter(emp => emp.PHNO == searchPhone)
    : [];

  const onSubmit = async (data) => {
    try {
      const response = await createEmp(data).unwrap();

      if (response.statusCode === 0) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: response.message || 'Employee registered successfully!',
        });
        reset();
        setSearchPhone('');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Failed to register employee',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.data?.message || 'Failed to register employee',
      });
    }
  };


  const handlePhoneSearch = (value) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    setSearchPhone(cleanedValue);
    if (cleanedValue.length !== 10) {
      setEmployeeId('');
      reset();
    }
  };


  const handleEmployeeSelect = (newId) => {
    setValue('employeeId', newId);
    const selectedEmployee = employeeData?.find(emp => emp.DOCID == newId);
    console.log(selectedEmployee, "selectedEmployee");
    if (selectedEmployee) {
      setValue('fullName', selectedEmployee.FNAME);
    }
    setEmployeeId(newId);
  };



  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-indigo-600 px-4 py-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <h1 className="text-xl font-bold text-white">
                NOBLE CLOTHING COMPANY{' '}
                <span className="block text-sm font-normal text-gray-300">
                  Employee Registration Form
                </span>
              </h1>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex items-center bg-white/20 rounded-lg overflow-hidden w-full sm:w-56">
                  <FaPhone className="w-4 h-4 text-white ml-2" />
                  <input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => handlePhoneSearch(e.target.value)}
                    placeholder="Search by Phone"
                    className="w-full bg-transparent text-white placeholder-white/70 py-1 px-2 text-sm focus:outline-none"
                    maxLength="10"
                  />
                </div>
                <EmployeeIdSelector
                  employeeId={employeeId}
                  employees={filteredEmployees}
                  onChange={handleEmployeeSelect}
                  className="bg-indigo-400 text-gray-800 hover:bg-indigo-500 w-full sm:w-40 text-sm"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
            {/* Personal Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold flex items-center gap-1 text-gray-800">
                <FaUser className="w-4 h-4 text-indigo-500" />
                Personal Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField
                  control={control}
                  errors={errors}
                  icon={FaUser}
                  label="Full Name"
                  name="fullName"
                  required
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaCalendar}
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  required
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaUser}
                  label="Gender"
                  name="gender"
                  type="select"
                  required
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' }
                  ]}
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaIdCard}
                  label="Aadhaar Number"
                  name="aadhaar"
                  required
                  validation={{
                    pattern: {
                      value: /^\d{12}$/,
                      message: "Aadhaar must be 12 digits"
                    }
                  }}
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaIdCard}
                  label="PAN Number"
                  name="pan"
                  required
                  validation={{
                    pattern: {
                      value: /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
                      message: "Invalid PAN format"
                    }
                  }}
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={MdPayment}
                  label="Married Status"
                  name="marriedStatus"
                  type="select"
                  required
                  options={[
                    { value: 'Married', label: 'Married' },
                    { value: 'Unmarried', label: 'Unmarried' },
                  ]}
                  compact
                />
              </div>
            </fieldset>

            {/* Contact Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold flex items-center gap-1 text-gray-800">
                <FaEnvelope className="w-4 h-4 text-indigo-500" />
                Contact Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={control}
                  errors={errors}
                  icon={FaEnvelope}
                  label="Email"
                  name="email"
                  type="email"
                  required
                  validation={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaPhone}
                  label="Phone Number"
                  name="phone"
                  required
                  validation={{
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Phone number must be 10 digits"
                    }
                  }}
                  compact
                />
              </div>
            </fieldset>

            {/* Address Information Section */}
            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold flex items-center gap-1 text-gray-800">
                <FaMapMarkerAlt className="w-4 h-4 text-indigo-500" />
                Address Information
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <FormField
                  control={control}
                  errors={errors}
                  icon={FaHome}
                  label="Street Address"
                  name="streetAddress"
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaCity}
                  label="City"
                  name="city"
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaBuilding}
                  label="State/Province"
                  name="state"
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaGlobe}
                  label="Postal Code"
                  name="postalCode"
                  compact
                />

                <FormField
                  control={control}
                  errors={errors}
                  icon={FaGlobe}
                  label="Country"
                  name="country"
                  type="select"
                  options={[
                    { value: 'India', label: 'India' },
                  ]}
                  compact
                />
              </div>
            </fieldset>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;