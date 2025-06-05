// File: src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Typography,
  Card,
  List,
  Spin,
  message,
  Collapse,
  Row,
  Col,
  Tag,
  Empty,
  Badge,
  Space,
  Button, // Import Button
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  TableOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  CoffeeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

export default function AdminDashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [allManagers, setAllManagers] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const fetchEvents = axios.get("/events");
        const fetchUsers = axios.get("/users");
        const fetchManagers = axios.get("/event-managers");
        const fetchVendors = axios.get("/event-vendors");

        const [evRes, uRes, mRes, vRes] = await Promise.all([
          fetchEvents,
          fetchUsers,
          fetchManagers,
          fetchVendors,
        ]);

        setEvents(evRes.data);
        setUsers(uRes.data);
        setAllManagers(mRes.data);
        setAllVendors(vRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

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
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(30, 174, 219, 0.1)",
    border: "1px solid rgba(30, 174, 219, 0.2)",
    marginBottom: "24px",
    overflow: "hidden",
  };

  const headerStyle = {
    background:
      "linear-gradient(135deg, #1EAEDB 0%, rgba(30, 174, 219, 0.8) 100%)",
    color: "white",
    padding: "16px 24px",
    margin: "-1px -1px 16px -1px",
    borderRadius: "12px 12px 0 0",
  };

  const statCardStyle = {
    textAlign: "center",
    padding: "16px",
    borderRadius: "8px",
    background: "rgba(30, 174, 219, 0.05)",
    border: "1px solid rgba(30, 174, 219, 0.2)",
  };

  const handleNavigateToRoleManagement = () => {
    navigate("/admin/roles"); // This path should match the route you defined in App.js
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #f8fdff, #ffffff)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="flex lg:flex-nowrap flex-wrap justify-between"
          style={{ marginBottom: "32px" }}
        >
          <div>
            <Title
              level={1}
              style={{
                color: "#1EAEDB",
                marginBottom: "8px",
                fontSize: "2rem",
                fontWeight: "bold",
              }}
            >
              {/* <CalendarOutlined style={{ marginRight: "12px" }} /> */}
              Admin Dashboard
            </Title>
            {/* <Text type="secondary" style={{ fontSize: "16px" }}>
              Manage events and monitor your platform
            </Text> */}
          </div>
          {/* Button to User Role Management */}
          <div style={{ textAlign: "center", marginTop: "px" }}>
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              onClick={handleNavigateToRoleManagement}
              style={{
                backgroundColor: "#1EAEDB",
                borderColor: "#1EAEDB",
                boxShadow: "0 4px 8px rgba(30, 174, 219, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#169ad6")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#1EAEDB")
              }
            >
              Manage User Roles
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <CalendarOutlined
                style={{
                  fontSize: "24px",
                  color: "#1EAEDB",
                  marginBottom: "8px",
                }}
              />
              <Title level={3} style={{ margin: 0, color: "#1EAEDB" }}>
                {events.length}
              </Title>
              <Text>Total Events</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <UserOutlined
                style={{
                  fontSize: "24px",
                  color: "#1EAEDB",
                  marginBottom: "8px",
                }}
              />
              <Title level={3} style={{ margin: 0, color: "#1EAEDB" }}>
                {users.length}
              </Title>
              <Text>Total Users</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <TeamOutlined
                style={{
                  fontSize: "24px",
                  color: "#1EAEDB",
                  marginBottom: "8px",
                }}
              />
              <Title level={3} style={{ margin: 0, color: "#1EAEDB" }}>
                {allManagers.length}
              </Title>
              <Text>Managers</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <ShopOutlined
                style={{
                  fontSize: "24px",
                  color: "#1EAEDB",
                  marginBottom: "8px",
                }}
              />
              <Title level={3} style={{ margin: 0, color: "#1EAEDB" }}>
                {allVendors.length}
              </Title>
              <Text>Vendors</Text>
            </Card>
          </Col>
        </Row>

        {/* Events List */}
        {events.length === 0 ? (
          <Card style={cardStyle}>
            <Empty
              description="No events found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <List
            // itemLayout="vertical"
            grid={{
              gutter: 20, // Spacing between grid items
              xs: 1, // 1 column on extra small screens (<576px)
              sm: 1, // 1 column on small screens (>=576px)
              md: 2, // 2 columns on medium screens (>=768px)
              lg: 2, // 2 columns on large screens (>=992px)
              xl: 2, // 2 columns on extra large screens (>=1200px)
              xxl: 2, // 2 columns on extra extra large screens (>=1600px)
            }}
            dataSource={events}
            renderItem={(ev) => {
              const eventManagers = ev.managers || [];
              const eventVendors = ev.vendors || [];
              const eventTables = ev.tables || [];
              const eventMenuItems = ev.menuItems || [];
              const eventOrders = ev.orders || [];

              return (
                <List.Item>
                  <Card key={ev.id} style={cardStyle}>
                    <div style={headerStyle}>
                      <Row align="middle" justify="space-between">
                        <Col>
                          <Title
                            level={3}
                            style={{ margin: 0, color: "white" }}
                          >
                            {ev.name}
                          </Title>
                        </Col>
                        <Col>
                          <Tag
                            color="white"
                            style={{ color: "#1EAEDB", fontWeight: "bold" }}
                          >
                            Active
                          </Tag>
                        </Col>
                      </Row>
                    </div>

                    <div style={{ padding: "0 24px" }}>
                      <Paragraph
                        style={{
                          fontSize: "16px",
                          lineHeight: "1.6",
                          color: "#666",
                          marginBottom: "24px",
                        }}
                      >
                        {ev.description}
                      </Paragraph>

                      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                        <Col xs={24} sm={8}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              background: "rgba(30, 174, 219, 0.05)",
                              borderRadius: "8px",
                            }}
                          >
                            <TableOutlined
                              style={{
                                fontSize: "20px",
                                color: "#1EAEDB",
                                marginRight: "12px",
                              }}
                            />
                            <div>
                              <Text strong style={{ color: "#1EAEDB" }}>
                                {eventTables.length}
                              </Text>
                              <br />
                              <Text type="secondary">Tables</Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={8}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              background: "rgba(30, 174, 219, 0.05)",
                              borderRadius: "8px",
                            }}
                          >
                            <CoffeeOutlined
                              style={{
                                fontSize: "20px",
                                color: "#1EAEDB",
                                marginRight: "12px",
                              }}
                            />
                            <div>
                              <Text strong style={{ color: "#1EAEDB" }}>
                                {eventMenuItems.length}
                              </Text>
                              <br />
                              <Text type="secondary">Menu Items</Text>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={8}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              background: "rgba(30, 174, 219, 0.05)",
                              borderRadius: "8px",
                            }}
                          >
                            <ContainerOutlined
                              style={{
                                fontSize: "20px",
                                color: "#1EAEDB",
                                marginRight: "12px",
                              }}
                            />
                            <div>
                              <Text strong style={{ color: "#1EAEDB" }}>
                                {eventOrders.length}
                              </Text>
                              <br />
                              <Text type="secondary">Orders</Text>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <Collapse
                        ghost
                        expandIconPosition="end"
                        style={{
                          background: "transparent",
                          border: "none",
                        }}
                        items={[
                          {
                            key: "managers",
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <TeamOutlined
                                  style={{
                                    color: "#1EAEDB",
                                    marginRight: "8px",
                                    fontSize: "18px",
                                  }}
                                />
                                <Text strong style={{ color: "#1EAEDB" }}>
                                  Event Managers
                                </Text>
                                <Badge
                                  count={eventManagers.length}
                                  style={{
                                    backgroundColor: "#1EAEDB",
                                    marginLeft: "8px",
                                  }}
                                />
                              </div>
                            ),
                            children: (
                              <div style={{ padding: "16px 0" }}>
                                {eventManagers.length === 0 ? (
                                  <Empty
                                    description="No managers assigned to this event"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ margin: "16px 0" }}
                                  />
                                ) : (
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {eventManagers.map((manager) => {
                                      const managerUser = users.find(
                                        (u) => u.id === manager.userId
                                      );
                                      return (
                                        <Card
                                          key={manager.id}
                                          size="small"
                                          style={{
                                            borderLeft: "4px solid #1EAEDB",
                                            borderRadius: "8px",
                                          }}
                                        >
                                          <Text strong>
                                            Manager:{" "}
                                            {managerUser
                                              ? managerUser.username
                                              : "Unknown User"}
                                          </Text>
                                          <br />
                                          <Text type="secondary">
                                            ID: {manager.userId}
                                          </Text>
                                        </Card>
                                      );
                                    })}
                                  </Space>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: "vendors",
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ShopOutlined
                                  style={{
                                    color: "#1EAEDB",
                                    marginRight: "8px",
                                    fontSize: "18px",
                                  }}
                                />
                                <Text strong style={{ color: "#1EAEDB" }}>
                                  Event Vendors
                                </Text>
                                <Badge
                                  count={eventVendors.length}
                                  style={{
                                    backgroundColor: "#1EAEDB",
                                    marginLeft: "8px",
                                  }}
                                />
                              </div>
                            ),
                            children: (
                              <div style={{ padding: "16px 0" }}>
                                {eventVendors.length === 0 ? (
                                  <Empty
                                    description="No vendors assigned to this event"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ margin: "16px 0" }}
                                  />
                                ) : (
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {eventVendors.map((vendor) => {
                                      const vendorUser = users.find(
                                        (u) => u.id === vendor.userId
                                      );
                                      return (
                                        <Card
                                          key={vendor.id}
                                          size="small"
                                          style={{
                                            borderLeft: "4px solid #1EAEDB",
                                            borderRadius: "8px",
                                          }}
                                        >
                                          <Text strong>
                                            Vendor:{" "}
                                            {vendorUser
                                              ? vendorUser.username
                                              : "Unknown User"}
                                          </Text>
                                          <br />
                                          <Text type="secondary">
                                            ID: {vendor.userId}
                                          </Text>
                                        </Card>
                                      );
                                    })}
                                  </Space>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: "tables",
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <TableOutlined
                                  style={{
                                    color: "#1EAEDB",
                                    marginRight: "8px",
                                    fontSize: "18px",
                                  }}
                                />
                                <Text strong style={{ color: "#1EAEDB" }}>
                                  Event Tables
                                </Text>
                                <Badge
                                  count={eventTables.length}
                                  style={{
                                    backgroundColor: "#1EAEDB",
                                    marginLeft: "8px",
                                  }}
                                />
                              </div>
                            ),
                            children: (
                              <div style={{ padding: "16px 0" }}>
                                {eventTables.length === 0 ? (
                                  <Empty
                                    description="No tables for this event"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ margin: "16px 0" }}
                                  />
                                ) : (
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {eventTables.map((table) => (
                                      <Card
                                        key={table.id}
                                        size="small"
                                        style={{
                                          borderLeft: "4px solid #1EAEDB",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        <Text strong>
                                          Table Number: {table.number}
                                        </Text>
                                        <br />
                                        {table.capacity && (
                                          <Text type="secondary">
                                            Capacity: {table.capacity}
                                          </Text>
                                        )}
                                      </Card>
                                    ))}
                                  </Space>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: "menuItems",
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <CoffeeOutlined
                                  style={{
                                    color: "#1EAEDB",
                                    marginRight: "8px",
                                    fontSize: "18px",
                                  }}
                                />
                                <Text strong style={{ color: "#1EAEDB" }}>
                                  Menu Items
                                </Text>
                                <Badge
                                  count={eventMenuItems.length}
                                  style={{
                                    backgroundColor: "#1EAEDB",
                                    marginLeft: "8px",
                                  }}
                                />
                              </div>
                            ),
                            children: (
                              <div style={{ padding: "16px 0" }}>
                                {eventMenuItems.length === 0 ? (
                                  <Empty
                                    description="No menu items for this event"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ margin: "16px 0" }}
                                  />
                                ) : (
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {eventMenuItems.map((item) => (
                                      <Card
                                        key={item.id}
                                        size="small"
                                        style={{
                                          borderLeft: "4px solid #1EAEDB",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        <Text strong>{item.name}</Text>
                                        <br />
                                        <Text type="secondary">
                                          Price: $
                                          {item.price?.toFixed(2) || "N/A"}
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                          Category: {item.tag || "N/A"}
                                        </Text>
                                        {item.photo && (
                                          <div style={{ marginTop: "8px" }}>
                                            <img
                                              src={item.photo}
                                              alt={item.name}
                                              style={{
                                                maxWidth: "80px",
                                                maxHeight: "80px",
                                                borderRadius: "4px",
                                              }}
                                            />
                                          </div>
                                        )}
                                      </Card>
                                    ))}
                                  </Space>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: "orders",
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ContainerOutlined
                                  style={{
                                    color: "#1EAEDB",
                                    marginRight: "8px",
                                    fontSize: "18px",
                                  }}
                                />
                                <Text strong style={{ color: "#1EAEDB" }}>
                                  Orders
                                </Text>
                                <Badge
                                  count={eventOrders.length}
                                  style={{
                                    backgroundColor: "#1EAEDB",
                                    marginLeft: "8px",
                                  }}
                                />
                              </div>
                            ),
                            children: (
                              <div style={{ padding: "16px 0" }}>
                                {eventOrders.length === 0 ? (
                                  <Empty
                                    description="No orders for this event"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    style={{ margin: "16px 0" }}
                                  />
                                ) : (
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                  >
                                    {eventOrders.map((order) => {
                                      const orderTable = eventTables.find(
                                        (t) => t.id === order.tableId
                                      );
                                      const guestUser = users.find(
                                        (u) => u.id === order.guestId
                                      );

                                      return (
                                        <Card
                                          key={order.id}
                                          size="small"
                                          style={{
                                            borderLeft: "4px solid #1EAEDB",
                                            borderRadius: "8px",
                                          }}
                                        >
                                          <Text strong>
                                            Order ID: {order.id}
                                          </Text>
                                          <br />
                                          <Text type="secondary">
                                            Status:{" "}
                                            <Tag
                                              color={
                                                order.status === "READY"
                                                  ? "green"
                                                  : "orange"
                                              }
                                            >
                                              {order.status}
                                            </Tag>
                                          </Text>
                                          <br />
                                          {orderTable && (
                                            <Text type="secondary">
                                              Table: {orderTable.number}
                                            </Text>
                                          )}
                                          <br />
                                          {guestUser && (
                                            <Text type="secondary">
                                              Guest: {guestUser.username}
                                            </Text>
                                          )}
                                          <br />
                                          <Text type="secondary">
                                            Ordered At:{" "}
                                            {new Date(
                                              order.createdAt
                                            ).toLocaleString()}
                                          </Text>
                                        </Card>
                                      );
                                    })}
                                  </Space>
                                )}
                              </div>
                            ),
                          },
                        ]}
                      />
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
