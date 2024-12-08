import { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
import './App.css';
import {Tabs} from "antd";
import {Image} from "antd";
import Register from "./components/Register.jsx";
import Visualize from "./components/Visualize.jsx";
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import axios from "axios";

const queryClient = new QueryClient();

function App() {
  const items = [
    {
      key: '1',
      label: 'Register',
      children: <Register/>
    },
    {
      key: '2',
      label: 'Visualize',
      children: <Visualize/>
    }
  ];

  return (
    <QueryClientProvider client={queryClient}>
       <div className="logo">
          <Image src="logo.png" className="logo" preview={false}/>
        </div>
        <div>
          <Tabs defaultActiveKey="1" items={items}/>
        </div>
     </QueryClientProvider>
  )
}

export default App
