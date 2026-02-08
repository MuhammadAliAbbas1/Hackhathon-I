import React from 'react';
import AskAIPanel from '../components/AskAIPanel';

const Root = ({ children }) => {
  return (
    <>
      {children}
      <AskAIPanel />
    </>
  );
};

export default Root;