import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', isLoading, disabled, className = '' }) => {
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || isLoading}
      className={`custom-button ${className} ${isLoading ? 'loading' : ''}`}
    >
      {isLoading ? <span className="loader"></span> : children}
    </button>
  );
};

export default Button;
