import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import EmployeeForm from './EmployeeForm';

function App() {
  return (
    <Router>
    
            <Routes>
              <Route path="/" element={<EmployeeForm />} />
            </Routes>
       
    </Router>
  );
}

export default App;
