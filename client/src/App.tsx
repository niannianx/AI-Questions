import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes/router';
import './index.css';
import { QuestionProvider } from './contexts/QuestionContext';

const App: React.FC = () => {
  return (
    <QuestionProvider>
      <RouterProvider router={router} />
    </QuestionProvider>
  );
};

export default App;
