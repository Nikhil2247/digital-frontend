// SignupPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, notification } from "antd"; // Import Ant Design components
import axios from "../api/axios"; // Assuming this correctly imports your configured axios instance

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Send 'values' (name, email, password) to your backend for registration.
      // The 'values' object from Ant Design Form already contains name, email, and password.
      // No need to wrap it in another 'values' object.
      const response = await axios.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      // You might not need to parse JSON if axios handles it, but check your backend response
      // const data = response.data; // Axios typically puts response data in .data

      console.log("Signup successful response:", response.data);

      notification.success({
        description: "Registration successful! Please log in.",
      });
      navigate("/login"); // Redirect to login page after successful registration
    } catch (err) {
      console.error("Registration failed:", err);
      // More robust error handling for API responses
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      notification.error({
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 lg:px-0 px-5">
      <div className="bg-white shadow-md p-6 rounded-md w-full max-w-md">
        {/* You can add your logo here if you have one */}
        {/* <div className="px-8 flex justify-center items-center">
          <img src="/images/omnilogo.png" alt="logo" className="h-12 w-44" />
        </div> */}
        <h1 className="text-xl font-semibold text-center mb-4">Sign Up</h1>
        <Form
          layout="vertical"
          onFinish={onFinish}
          className="space-y-4" // Tailwind class for spacing
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: "Please enter your full name!" },
              { min: 3, message: "Name must be at least 3 characters long!" },
            ]}
          >
            <Input
              placeholder="Enter your full name"
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Enter a valid email address!" },
            ]}
          >
            <Input
              type="email"
              placeholder="Enter your email"
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your password!" },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
            hasFeedback // Provides visual feedback for validation status
          >
            <Input.Password
              placeholder="Enter your password"
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirm"
            dependencies={['password']} // This makes the rule dependent on the 'password' field
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm your password"
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700"
              loading={loading}
            >
              {loading ? "Registering..." : "Sign Up"}
            </Button>
          </Form.Item>

          <div className="flex justify-center items-center gap-1 mt-4">
            <span>Already have an account?</span>
            <Link
              to={"/login"} // Link back to the login page
              className="text-blue-400 hover:text-blue-500"
            >
              Login
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}