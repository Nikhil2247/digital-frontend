// File: src/pages/UserRoleManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Table,
  Select,
  Button,
  message,
  Spin,
  Typography,
  Card,
  Space,
  Tag,
} from "antd";
import { UserOutlined, SaveOutlined } from "@ant-design/icons";

const { Title, Text } = Typography; // Add Text here
const { Option } = Select; // This is correct for Ant Design's Select.Option


export default function UserRoleManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null); // To disable button during update

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/users");
      // Assuming each user object has a 'role' field
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId); // Set the user being updated
    try {
      await axios.patch(`/users/${userId}`, { role: newRole });
      message.success(`Role for user ${userId} updated to ${newRole}`);
      // Optimistically update the UI or refetch users
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      message.error(`Failed to update role for user ${userId}.`);
    } finally {
      setUpdatingUserId(null); // Reset updating user
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Current Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "MANAGER" ? "blue" : role === "VENDOR" ? "green" : "default"}>
          {role || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Change Role To",
      key: "action",
      render: (_, record) => (
        <Space>
          <Select
            defaultValue={record.role || "GUEST"} // Default to current role or a base role if none
            style={{ width: 120 }}
            onChange={(value) => handleRoleChange(record.id, value)}
            disabled={updatingUserId === record.id} // Disable select during update
          >
            <Option value="GUEST">Guest</Option>
            <Option value="MANAGER">Manager</Option>
            <Option value="VENDOR">Vendor</Option>
            {/* Add other roles if applicable */}
          </Select>
          {/* A separate save button is not strictly necessary with onChange,
              but can be added if you prefer explicit saving.
              For this example, onChange handles the update directly.
          */}
          {/* <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleRoleChange(record.id, newRoleForThisUser)} // You'd need a state for pending role changes
            loading={updatingUserId === record.id}
            disabled={updatingUserId === record.id}
          >
            Save
          </Button> */}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" tip="Loading users..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "linear-gradient(to bottom, #f8fdff, #ffffff)" }}>
      <div className="max-w-7xl mx-auto">
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <Title
            level={1}
            style={{
              color: "#1EAEDB",
              marginBottom: "8px",
              fontSize: "2.5rem",
              fontWeight: "bold",
            }}
          >
            <UserOutlined style={{ marginRight: "12px" }} />
            User Role Management
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Manage user roles across the platform.
          </Text>
        </div>

        <Card style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(30, 174, 219, 0.1)" }}>
          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }} // Enable horizontal scrolling for smaller screens
          />
        </Card>
      </div>
    </div>
  );
}