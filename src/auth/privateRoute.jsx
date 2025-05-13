import React from 'react';
import { Navigate } from 'react-router-dom';

function isAuthenticated() {
  return document.cookie
    .split(';')
    .some(cookie => cookie.trim().startsWith('jwt='));
}

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
