import React, { createContext, useContext, useState } from 'react';

const StatusContext = createContext();

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (context === undefined) {
    throw new Error('useStatus must be used within a StatusProvider');
  }
  return context;
};

export const StatusProvider = ({ children }) => {
  const [isInAlarm, setIsInAlarm] = useState(false);

  return (
    <StatusContext.Provider value={{ isInAlarm, setIsInAlarm }}>
      {children}
    </StatusContext.Provider>
  );
};