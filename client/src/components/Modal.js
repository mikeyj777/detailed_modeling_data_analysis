import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const modalStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
  };

  const modalContentStyles = {
    position: 'relative',
    margin: '5% auto',
    padding: '20px',
    width: '90%',
    height: '90%',
    backgroundColor: '#fff',
    overflow: 'auto',
  };

  const closeButtonStyles = {
    position: 'absolute',
    top: '10px',
    right: '20px',
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#aaa',
    cursor: 'pointer',
  };

  return (
    <div style={modalStyles} onClick={onClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <span style={closeButtonStyles} onClick={onClose}>
          &times;
        </span>
        {children}
      </div>
    </div>
  );
};

export default Modal;
