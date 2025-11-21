import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 即使没有css文件也不报错，vite会自动处理

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);