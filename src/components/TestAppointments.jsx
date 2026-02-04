import React from 'react';

const TestAppointments = () => {
  return (
    <div style={{
      padding: '50px',
      background: '#000',
      color: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '40px' }}>🔥 APPOINTMENTS TEST PAGE</h1>
      <p style={{ fontSize: '20px' }}>If you can see this, the appointments route works!</p>
      <button 
        onClick={() => alert('Test successful!')}
        style={{
          background: '#ff2d55',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '10px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Click Me!
      </button>
    </div>
  );
};

export default TestAppointments;