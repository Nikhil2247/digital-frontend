// src/layouts/VendorLayout.jsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  theme,
  Typography,
  Space,
  Button,
  Avatar,
  Dropdown,
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Removed 'Outlet'
const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const PRIMARY_COLOR = "#1eaedb"; // Re-using your color

// Add 'children' to the props
const VendorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentVendor, setCurrentVendor] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/vendor/dashboard",
      icon: <DashboardOutlined />,
      label: <Link to="/vendor/dashboard">Dashboard</Link>,
    },
    {
      key: "/vendor/events",
      icon: <CalendarOutlined />,
      label: <Link to="/vendor/events">Events</Link>,
    },
    {
      key: "/vendor/orders",
      icon: <ShoppingOutlined />,
      label: <Link to="/vendor/orders">Orders</Link>,
    },
    {
      key: "/vendor/profile",
      icon: <UserOutlined />,
      label: <Link to="/vendor/profile">Profile</Link>,
    },
  ];

  const userDropdownMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          background: colorBgContainer,
        }}
        breakpoint="lg"
        collapsedWidth="80"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 24px",
            background: PRIMARY_COLOR,
            color: "white",
            fontWeight: "bold",
            fontSize: collapsed ? "18px" : "22px",
          }}
        >
          {collapsed ? "VM" : "Vendor Manager"}
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 24,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          {/* <Title level={3} style={{ margin: 0 }}>
            {menuItems.find((item) => item.key === location.pathname)?.label
              ?.props?.children || "Vendor Dashboard"}
          </Title> */}

          <Space align="center">
            {currentVendor && (
              <Typography.Text strong>{currentVendor.name}</Typography.Text>
            )}
            <Dropdown overlay={userDropdownMenu} placement="bottomRight" arrow>
              <Avatar
                size="large"
                icon={<UserOutlined />}
                style={{ cursor: "pointer", backgroundColor: PRIMARY_COLOR }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: "auto",
          }}
        >
          {children} {/* Renders the children passed to this component */}
        </Content>

        <Footer style={{ textAlign: "center" }}>
          Vendor Management System ©{new Date().getFullYear()} Created by Your
          Team
        </Footer>
      </Layout>
    </Layout>
  );
};

export default VendorLayout;
