import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Typography,
  Tag,
  Image,
  Tooltip,
  Select, // Import Select
} from "antd";
import { PlusOutlined, DownloadOutlined, QrcodeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select; // Destructure Option from Select

const PRIMARY_COLOR = "#1eaedb";

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [events, setEvents] = useState([]); // State to store events
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const primaryColor = "#1EAEDB"; // Define primary color (already defined as PRIMARY_COLOR, but kept for consistency)

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await axios.get("tables");
      setTables(res.data);
    } catch (err) {
      message.error("Failed to load tables.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      // Assuming your events endpoint is something like '/events'
      // You might need to adjust this URL based on your backend
      const res = await axios.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      message.error("Failed to load events for table assignment.");
    }
  };

  const handleAdd = async (values) => {
    try {
      await axios.post("/tables", values);
      message.success("Table added successfully!");
      form.resetFields();
      setIsModalOpen(false);
      fetchTables(); // Re-fetch tables to show the new one
    } catch (err) {
      message.error("Failed to add table.");
    }
  };

  const downloadQRCode = (qrCodeUrl, tableNumber) => {
    if (!qrCodeUrl) {
      message.warn("No QR code available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `table-${tableNumber}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: "Table Number",
      dataIndex: "number",
      key: "number",
      sorter: (a, b) => a.number - b.number,
      render: (text) => <Tag color={primaryColor}>{text}</Tag>,
    },
    {
      title: "Event",
      dataIndex: ["event", "name"],
      key: "event",
      render: (text) => text || <Tag color="default">N/A</Tag>,
    },
    {
      title: "QR Code",
      dataIndex: "qrCode",
      key: "qrCode",
      render: (qrCode, record) =>
        qrCode ? (
          <Space>
            <Image src={qrCode} alt={`QR Code for Table ${record.number}`} width={60} />
            <Tooltip title="Download QR Code">
              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadQRCode(qrCode, record.number)}
                style={{ borderColor: primaryColor, color: primaryColor }}
              />
            </Tooltip>
          </Space>
        ) : (
          <Tag color="default">No QR Code</Tag>
        ),
    },
    // Orders column commented out as per your provided code
    // {
    //   title: "Orders",
    //   dataIndex: "orders",
    //   key: "orders",
    //   render: (orders) =>
    //     orders && orders.length ? (
    //       <Space direction="vertical">
    //         {orders.map((order) => (
    //           <Tag key={order.id} color={order.status === "READY" ? "green" : "orange"}>
    //             {order.status}
    //           </Tag>
    //         ))}
    //       </Space>
    //     ) : (
    //       <Tag color="default">No Orders</Tag>
    //     ),
    // },
  ];

  useEffect(() => {
    fetchTables();
    fetchEvents(); // Fetch events when the component mounts
  }, []);

  return (
    <div className="max-w-7xl">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          background: "#fff",
          padding: "20px",
          borderColor: PRIMARY_COLOR,
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
        }}
      >
        <Title level={3} style={{ margin: 0, color: "#333" }}>
          <QrcodeOutlined style={{ marginRight: "10px", color: primaryColor }} />
          Table Management
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
        >
          Add Table
        </Button>
      </div>

      <Table
        dataSource={tables}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 7, showSizeChanger: false }}
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)",
          borderColor: PRIMARY_COLOR,
        }}
        bordered
      />

      <Modal
        title={
          <span style={{ color: primaryColor }}>
            <PlusOutlined style={{ marginRight: "8px" }} />
            Add New Table
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAdd} style={{ marginTop: "20px" }}>
          <Form.Item
            label={<span style={{ color: primaryColor }}>Table Number</span>}
            name="number"
            rules={[{ required: true, message: "Please enter table number" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g., 101" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: primaryColor }}>Select Event</span>}
            name="eventId" // This will store the selected event's ID
            rules={[{ required: true, message: "Please select an event" }]}
          >
            <Select placeholder="Select an event for this table">
              {events.map((event) => (
                <Option key={event.id} value={event.id}>
                  {event.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              style={{ backgroundColor: primaryColor, borderColor: primaryColor, marginTop: "16px" }}
            >
              Add Table
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tables;