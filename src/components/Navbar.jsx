// src/components/Navbar.jsx
import {
  Layout,
  Button,
  Typography,
  Space,
  message,
  Dropdown,
  Menu,
} from "antd"; // Import Dropdown and Menu
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons"; // Import DownOutlined and SettingOutlined (optional)
import { useNavigate, Link } from "react-router-dom";

// Import the useAuth hook from your AuthContext
import { useAuth } from "../context/AuthContext"; // Adjust path if AuthContext.js is elsewhere

const { Header } = Layout;
const { Title, Text } = Typography; // Removed Paragraph as it's not used in Navbar

// Define your primary color if not globally available
const PRIMARY_COLOR = "#1EAEDB";

export default function Navbar() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();

  const isLoggedIn = !!userData;
  const userName = userData?.name || "vendor" || ""; // Safely access user data
  const userRole = userData?.role || ""; // Get user role for potential role-specific menu items

  const handleLogout = async () => {
    try {

      await logout();
      message.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Logout failed. Please try again.");
    }
  };

  // Define the dropdown menu items
  const userMenu = (
    <Menu
      onClick={({ key }) => {
        if (key === "logout") {
          handleLogout();
        } else if (key === "dashboard") {
          // Navigate to the appropriate dashboard based on role
          if (userRole === "ADMIN") navigate("/admin");
          else if (userRole === "MANAGER") navigate("/dashboard/manager");
          else if (userRole === "VENDOR") navigate("/dashboard/vendor");
          else navigate("/"); // Fallback
        }
        // Add more cases for other menu items like 'profile', 'settings', etc.
        // else if (key === 'profile') navigate('/profile');
      }}
    >
      <Menu.Item key="username" disabled style={{ cursor: "default" }}>
        <Text strong>
          <UserOutlined style={{ marginRight: "8px" }} />
          {userName}
        </Text>
      </Menu.Item>
      <Menu.Divider /> {/* A visual separator */}
      {/* Conditionally render dashboard link if user has a valid role for a dashboard */}
      {(userRole === "ADMIN" ||
        userRole === "MANAGER" ||
        userRole === "VENDOR") && (
        <Menu.Item key="dashboard" icon={<SettingOutlined />}>
          Dashboard
        </Menu.Item>
      )}
      {/* You can add more menu items here, e.g., Profile, Settings */}
      {/* <Menu.Item key="profile" icon={<ProfileOutlined />}>
        Profile
      </Menu.Item> */}
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      className="!bg-gradient-to-b !from-[#1a77c93a] !to-transparent"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Title
            level={3}
            style={{ margin: 0, color: PRIMARY_COLOR, cursor: "pointer" }}
          >
            <img
              src="/omnilogo.avif"
              alt="Logo"
              style={{ height: "40px", marginRight: "10px" }}
            />{" "}
            {/* Remember to replace with your logo path */}
          </Title>
        </Link>
      </div>

      {/* Navigation and Auth Buttons */}
      <Space size="middle">
        {isLoggedIn ? (
          <Dropdown
            overlay={userMenu}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
             // You can use 'default' or 'ghost' as well
              style={{ borderRadius: "5px",color: PRIMARY_COLOR, padding: "0 15px" }} // Adjust padding for icon-only button
            >
              <Space>
                <UserOutlined />
                {userName}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => navigate("/login")}
            style={{ borderRadius: "5px" }}
          >
            Login
          </Button>
        )}
      </Space>
    </Header>
  );
}
