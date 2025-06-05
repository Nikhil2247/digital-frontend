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
  Select,
  Space,
  Row,
  Col,
  Tag,
  Avatar,
  Button,
  Divider,
  Badge,
  Empty,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  CalendarOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState({});

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
        setManagers(mRes.data);
        setVendors(vRes.data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleAssign = async (type, eventId, userId) => {
    setAssigning((prev) => ({ ...prev, [type + eventId]: true }));
    try {
      const url =
        type === "manager" ? "/event-managers/assign" : "/event-vendors/assign";
      await axios.post(url, { eventId, userId });
      message.success(`${type.charAt(0).toUpperCase() + type.slice(1)} assigned successfully!`);

      // Refresh the assigned managers or vendors list
      const res =
        type === "manager"
          ? await axios.get("/event-managers")
          : await axios.get("/event-vendors");

      type === "manager" ? setManagers(res.data) : setVendors(res.data);
    } catch (err) {
      console.error("Assignment error:", err);
      message.error("Assignment failed. Please try again.");
    } finally {
      setAssigning((prev) => ({ ...prev, [type + eventId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );
  }

  const cardStyle = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(30, 174, 219, 0.1)',
    border: '1px solid rgba(30, 174, 219, 0.2)',
    marginBottom: '24px',
    overflow: 'hidden',
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #1EAEDB 0%, rgba(30, 174, 219, 0.8) 100%)',
    color: 'white',
    padding: '16px 24px',
    margin: '-1px -1px 16px -1px',
    borderRadius: '12px 12px 0 0',
  };

  const statCardStyle = {
    textAlign: 'center',
    padding: '16px',
    borderRadius: '8px',
    background: 'rgba(30, 174, 219, 0.05)',
    border: '1px solid rgba(30, 174, 219, 0.2)',
  };

  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f8fdff, #ffffff)',
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Title level={1} style={{ 
            color: '#1EAEDB', 
            marginBottom: '8px',
            fontSize: '2.5rem',
            fontWeight: 'bold'
          }}>
            <CalendarOutlined style={{ marginRight: '12px' }} />
            Admin Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Manage events, assign team members, and monitor your platform
          </Text>
        </div>

        {/* Overview Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <CalendarOutlined style={{ fontSize: '24px', color: '#1EAEDB', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: 0, color: '#1EAEDB' }}>
                {events.length}
              </Title>
              <Text>Total Events</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <UserOutlined style={{ fontSize: '24px', color: '#1EAEDB', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: 0, color: '#1EAEDB' }}>
                {users.length}
              </Title>
              <Text>Total Users</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <TeamOutlined style={{ fontSize: '24px', color: '#1EAEDB', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: 0, color: '#1EAEDB' }}>
                {managers.length}
              </Title>
              <Text>Managers</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={statCardStyle}>
              <ShopOutlined style={{ fontSize: '24px', color: '#1EAEDB', marginBottom: '8px' }} />
              <Title level={3} style={{ margin: 0, color: '#1EAEDB' }}>
                {vendors.length}
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
            itemLayout="vertical"
            dataSource={events}
            renderItem={(ev) => {
              const evManagers = managers.filter((m) => m.eventId === ev.id);
              const evVendors = vendors.filter((v) => v.eventId === ev.id);
              
              return (
                <Card key={ev.id} style={cardStyle}>
                  <div style={headerStyle}>
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Title level={3} style={{ margin: 0, color: 'white' }}>
                          {ev.name}
                        </Title>
                      </Col>
                      <Col>
                        <Tag color="white" style={{ color: '#1EAEDB', fontWeight: 'bold' }}>
                          Active
                        </Tag>
                      </Col>
                    </Row>
                  </div>

                  <div style={{ padding: '0 24px' }}>
                    <Paragraph style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.6',
                      color: '#666',
                      marginBottom: '24px'
                    }}>
                      {ev.description}
                    </Paragraph>

                    {/* Event Stats */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '12px',
                          background: 'rgba(30, 174, 219, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <TableOutlined style={{ 
                            fontSize: '20px', 
                            color: '#1EAEDB', 
                            marginRight: '12px' 
                          }} />
                          <div>
                            <Text strong style={{ color: '#1EAEDB' }}>
                              {ev.tables?.length || 0}
                            </Text>
                            <br />
                            <Text type="secondary">Tables</Text>
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '12px',
                          background: 'rgba(30, 174, 219, 0.05)',
                          borderRadius: '8px'
                        }}>
                          <AppstoreOutlined style={{ 
                            fontSize: '20px', 
                            color: '#1EAEDB', 
                            marginRight: '12px' 
                          }} />
                          <div>
                            <Text strong style={{ color: '#1EAEDB' }}>
                              {ev.menuItems?.length || 0}
                            </Text>
                            <br />
                            <Text type="secondary">Menu Items</Text>
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {/* Team Assignment */}
                    <Collapse 
                      ghost 
                      expandIconPosition="end"
                      style={{
                        background: 'transparent',
                        border: 'none'
                      }}
                      items={[
                        {
                          key: 'managers',
                          label: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <TeamOutlined style={{ 
                                color: '#1EAEDB', 
                                marginRight: '8px',
                                fontSize: '18px'
                              }} />
                              <Text strong style={{ color: '#1EAEDB' }}>
                                Event Managers
                              </Text>
                              <Badge 
                                count={evManagers.length} 
                                style={{ 
                                  backgroundColor: '#1EAEDB',
                                  marginLeft: '8px'
                                }} 
                              />
                            </div>
                          ),
                          children: (
                            <div style={{ padding: '16px 0' }}>
                              <Row gutter={[16, 16]}>
                                <Col xs={24} lg={16}>
                                  {evManagers.length === 0 ? (
                                    <Empty 
                                      description="No managers assigned" 
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      style={{ margin: '16px 0' }}
                                    />
                                  ) : (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                      {evManagers.map((m) => (
                                        <Card 
                                          key={m.id}
                                          size="small"
                                          style={{ 
                                            borderLeft: '4px solid #1EAEDB',
                                            borderRadius: '8px'
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar 
                                              icon={<UserOutlined />} 
                                              style={{ backgroundColor: '#1EAEDB' }}
                                            />
                                            <Text strong style={{ marginLeft: '12px' }}>
                                              {m.user.name}
                                            </Text>
                                          </div>
                                        </Card>
                                      ))}
                                    </Space>
                                  )}
                                </Col>
                                <Col xs={24} lg={8}>
                                  <Select
                                    placeholder="Assign new manager"
                                    style={{ width: '100%' }}
                                    onSelect={(userId) => handleAssign("manager", ev.id, userId)}
                                    loading={assigning["manager" + ev.id]}
                                    allowClear
                                    size="large"
                                  >
                                    {users
                                      .filter((u) => u.role === "MANAGER")
                                      .filter((u) => !evManagers.some(m => m.user.id === u.id))
                                      .map((u) => (
                                        <Option key={u.id} value={u.id}>
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar 
                                              size="small" 
                                              icon={<UserOutlined />}
                                              style={{ backgroundColor: '#1EAEDB' }}
                                            />
                                            <span style={{ marginLeft: '8px' }}>{u.name}</span>
                                          </div>
                                        </Option>
                                      ))}
                                  </Select>
                                </Col>
                              </Row>
                            </div>
                          )
                        },
                        {
                          key: 'vendors',
                          label: (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <ShopOutlined style={{ 
                                color: '#1EAEDB', 
                                marginRight: '8px',
                                fontSize: '18px'
                              }} />
                              <Text strong style={{ color: '#1EAEDB' }}>
                                Event Vendors
                              </Text>
                              <Badge 
                                count={evVendors.length} 
                                style={{ 
                                  backgroundColor: '#1EAEDB',
                                  marginLeft: '8px'
                                }} 
                              />
                            </div>
                          ),
                          children: (
                            <div style={{ padding: '16px 0' }}>
                              <Row gutter={[16, 16]}>
                                <Col xs={24} lg={16}>
                                  {evVendors.length === 0 ? (
                                    <Empty 
                                      description="No vendors assigned" 
                                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      style={{ margin: '16px 0' }}
                                    />
                                  ) : (
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                      {evVendors.map((v) => (
                                        <Card 
                                          key={v.id}
                                          size="small"
                                          style={{ 
                                            borderLeft: '4px solid #1EAEDB',
                                            borderRadius: '8px'
                                          }}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar 
                                              icon={<ShopOutlined />} 
                                              style={{ backgroundColor: '#1EAEDB' }}
                                            />
                                            <Text strong style={{ marginLeft: '12px' }}>
                                              {v.user.name}
                                            </Text>
                                          </div>
                                        </Card>
                                      ))}
                                    </Space>
                                  )}
                                </Col>
                                <Col xs={24} lg={8}>
                                  <Select
                                    placeholder="Assign new vendor"
                                    style={{ width: '100%' }}
                                    onSelect={(userId) => handleAssign("vendor", ev.id, userId)}
                                    loading={assigning["vendor" + ev.id]}
                                    allowClear
                                    size="large"
                                  >
                                    {users
                                      .filter((u) => u.role === "VENDOR")
                                      .filter((u) => !evVendors.some(v => v.user.id === u.id))
                                      .map((u) => (
                                        <Option key={u.id} value={u.id}>
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar 
                                              size="small" 
                                              icon={<ShopOutlined />}
                                              style={{ backgroundColor: '#1EAEDB' }}
                                            />
                                            <span style={{ marginLeft: '8px' }}>{u.name}</span>
                                          </div>
                                        </Option>
                                      ))}
                                  </Select>
                                </Col>
                              </Row>
                            </div>
                          )
                        }
                      ]}
                    />
                  </div>
                </Card>
              );
            }}
          />
        )}
      </div>
    </div>
  );
}