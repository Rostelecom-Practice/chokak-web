import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Layout} from './MainPage/Layout'
import 'antd/dist/reset.css';

console.log(Layout);
createRoot(document.getElementById('root')).render(
  <Layout />,
)
