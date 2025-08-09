import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError() as any;
  return (
    <div>
      <h1>出错啦</h1>
      <p>{error?.message || '未知错误'}</p>
    </div>
  );
};

export default ErrorPage;
