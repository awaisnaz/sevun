import {useState, useEffect} from "react";
import { Form, Input, Button, Card, Alert } from 'antd';

const Register = () => {
  const [form] = Form.useForm();

  let [message, setMessage] = useState(null);
  let [messageType, setMessageType] = useState(null);

  const onFinish = (values) => {
    (async () => {
      const response = await fetch('http://localhost:3000/saveReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
      if (response.ok) {
        setMessage("Registration successful!");
        setMessageType("success");
      }
      else {
        setMessage("Registration failed!");
        setMessageType("error");
      }
      const content = await response.json();
    })();
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
      <Card className="w-full max-w-md mx-auto">
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold mb-6">Register Google Place</h2>

          <Form.Item
            name="placeId"
            label="Place ID"
            rules={[
              {
                required: true,
                message: 'Please input the Place ID!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Register
            </Button>
          </Form.Item>

          {message && (
            <Form.Item>
              <Alert message={message} type={messageType}/>
            </Form.Item>
          )}

        </Form>
      </Card>
    </div>
  );
};

export default Register;