import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserDataTable from './components/UserDataTable';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/users" />} />
      <Route path="/users" element={<UserDataTable />} />
    </Routes>
  );
};

export default App;
