import React, { createContext, useState, useContext } from 'react';

const SimulationContext = createContext(null);

export const SimulationProvider = ({ children }) => {
  const [simulationResults, setSimulationResults] = useState(null);

  const updateResults = (results) => {
    console.log('Updating simulation results in context:', results);
    setSimulationResults(results);
  };

  const clearResults = () => {
    console.log('Clearing simulation results');
    setSimulationResults(null);
  };

  return (
    <SimulationContext.Provider value={{ simulationResults, updateResults, clearResults }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  return useContext(SimulationContext);
};
