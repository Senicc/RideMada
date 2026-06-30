import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RideBooking from './pages/RideBooking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/book" replace />} />
        <Route path="/book" element={<RideBooking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
