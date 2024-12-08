import {useState, useEffect} from "react";
import { Card, Table, Modal, Button, Form, Input, Alert } from "antd";
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';

// Chart.js related initialization
import React from 'react';
import { Bar } from 'react-chartjs-2'; // Import the Bar chart component from react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the necessary chart components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Visualize = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [positive, setPositive] = useState(0);
  const [neutral, setNeutral] = useState(0);
  const [negative, setNegative] = useState(0);

  let { data, isPending, isLoading, isError,  } = useQuery({
    queryKey: ["reviews", page],
    queryFn: async ()=>
      await fetch('http://localhost:3000/getReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({page})
      }).then(async (res) => {
        res = await res.json();
        // console.log(res.reviews);
        let positive = 0;
        let neutral = 0;
        let negative = 0;
        for (let i = 0; i < res.reviews.length; i++) {
          if (res.reviews[i].sentiment > 0) positive++;
          if (res.reviews[i].sentiment == 0) neutral++;
          if (res.reviews[i].sentiment < 0) negative++;
        }
        // console.log(positive, neutral, negative);
        setPositive(positive);
        setNeutral(neutral);
        setNegative(negative);
        return res;
      })
  });

  if (isPending) return <div>Loading...</div>;
  if (isLoading) return <div><h2>Loading...</h2></div>;
  if (isError) return <div>Error fetching data</div>;

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Review',
      dataIndex: 'review',
      key: 'review',
    },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
    },
  ];

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Define the chart data
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'], // Labels for each sentiment
    datasets: [
      {
        label: 'Sentiment Distribution', // Dataset label
        data: [positive, neutral, negative], // Sample data: Sentiment counts
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)', // Color for Positive
          'rgba(255, 159, 64, 0.2)', // Color for Neutral
          'rgba(255, 99, 132, 0.2)'  // Color for Negative
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)', // Border color for Positive
          'rgba(255, 159, 64, 1)', // Border color for Neutral
          'rgba(255, 99, 132, 1)'  // Border color for Negative
        ],
        borderWidth: 1, // Border width
      },
    ],
  };

  // Define the chart options
  const chartOptions = {
    responsive: true, // Make the chart responsive to screen size
    scales: {
      y: {
        beginAtZero: true, // Ensure that the y-axis starts at 0
      },
    },
    plugins: {
      legend: {
        display: false, // Optionally hide the legend
      },
    },
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
      <Card className="w-full max-w-md mx-auto">
        <div>
          <div style={{display:"flex", justifyContent:"center", alignItems: "center"}}>
            <div style={{display:"flex", justifyContent:"start", width:"100%"}}>
              <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
            <Table
              columns={columns}
              dataSource={data.reviews}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: data.total,
              }}
              onChange={handleTableChange}
              rowKey="_id"
            />
          </div>
        </div>
      </Card>
      <div style={{display:"flex",justifyContent:"start",alignItems:"start"}}>
        <div>
          <h3>Sentiment Distribution</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Visualize;