import React, { createContext, useState, useContext } from "react";
import { Alert } from "react-bootstrap";


const ErrorContext = createContext();


export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const handleError = (err) => {
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "An unexpected error occurred";

    setError(errorMessage);


    setTimeout(() => setError(null), 5000);
  };


  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const clearError = () => {
    setError(null);
    setSuccess(null);
  };


  const ErrorDisplay = () => {
    if (!error && !success) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          minWidth: "250px",
        }}
      >
        {error && (
          <Alert variant="danger" onClose={clearError} dismissible>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={clearError} dismissible>
            {success}
          </Alert>
        )}
      </div>
    );
  };

  return (
    <ErrorContext.Provider
      value={{
        handleError,
        showSuccess,
        clearError,
        ErrorDisplay,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};


export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};
