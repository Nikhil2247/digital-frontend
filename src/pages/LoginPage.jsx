// LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, notification } from 'antd'; // Import Ant Design components
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values.email, values.password); // Use values from Ant Design Form

      if (user && user.role) {
        const userRole = user.role.toUpperCase();

        switch (userRole) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'VENDOR':
            navigate('/dashboard/vendor');
            break;
          case 'MANAGER':
            navigate('/dashboard/manager');
            break;
          default:
            navigate('/');
            break;
        }
        notification.success({
          description: "Login successful!",
        });
      } else {
        console.error("Login successful, but role not found in user data.");
        notification.error({
          description: "Login successful, but role not found. Navigating to default dashboard.",
        });
        navigate('/');
      }
    } catch (err) {
      console.error("Login attempt failed:", err);
      notification.error({
        description: err.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 lg:px-0 px-5">
      <div className="bg-white shadow-md p-6 rounded-md w-full max-w-md">
        {/* You can add a logo here if you have one */}
        {/* <div className="px-8 flex justify-center items-center">
          <img src="/images/omnilogo.png" alt="logo" className="h-12 w-44" />
        </div> */}
        <h1 className="text-xl font-semibold text-center mb-4">Login</h1>
        <Form
          layout="vertical"
          onFinish={onFinish} // Ant Design Form uses onFinish for submission
          className="space-y-4" // Tailwind class for spacing
        >
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
              className="border p-2 rounded w-full focus:outline-none" // Apply Tailwind for consistent style
            />
          </Form.Item>

          <div>
            <div className="flex items-center justify-between">
              <label // Ant Design Form.Item's label prop handles this, but keeping it for direct comparison
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Password
              </label>
              {/* <div className="text-sm">
                <Link
                  to={"/forgot-password"} // Replace with your actual forgot password route
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div> */}
            </div>
            <div className="mt-2">
              <Form.Item
                name="password"
                rules={[{ required: true, message: "Please enter your password!" }]}
                noStyle // Use noStyle to prevent default Ant Design margin/padding if you manage layout with Tailwind
              >
                <Input.Password
                  placeholder="Enter your password"
                  className="border p-2 rounded w-full focus:outline-none" // Apply Tailwind for consistent style
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700" // Tailwind for button styling
              loading={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>

          <div className="flex justify-center items-center gap-1">
            <span>Don't have an account?</span>
            <Link
              to={"/signup"} // Replace with your actual signup route
              className="text-blue-400 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}