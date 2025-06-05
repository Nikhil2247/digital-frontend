// EventOrderPage.js
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Assuming axios is configured
import {
  Typography,
  Spin,
  message,
  Table,
  Tag,
  Select,
  Button,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PRIMARY_COLOR = "#1eaedb"; // Consistent with VendorDashboard
const HOVER_PRIMARY_COLOR = "#188db1"; // Consistent with VendorDashboard

export default function EventOrderPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventOrdersAndDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch event details
      let currentEvent = null;
      try {
        const eventRes = await axios.get(`/events/${eventId}`);
        currentEvent = eventRes.data;
        setEventDetails(currentEvent);
      } catch (eventErr) {
        console.warn(`Failed to fetch event details for ID ${eventId}:`, eventErr);
        // Continue to fetch orders even if event details fail
        // The page can still function by showing "Orders for Event ID: {eventId}"
      }

      // Fetch all orders and filter
      const orderRes = await axios.get("/orders");
      const filteredOrders = orderRes.data.filter(
        (order) => String(order.eventId) === String(eventId) // Ensure type consistency for comparison
      );
      setOrders(filteredOrders);

    } catch (err) {
      console.error("Fetch Event Orders Error:", err);
      setError(
        `Failed to load orders: ${err.response?.data?.message || err.message}`
      );
      message.error(
        `Failed to load orders: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventOrdersAndDetails();
    } else {
      message.error("Event ID is missing.");
      setLoading(false);
      setError("Event ID is missing from the URL.");
    }
  }, [eventId]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.patch(`/orders/${orderId}/status`, { status });
      message.success(
        `Order ${orderId} status updated to ${status.replace("_", " ")}`
      );
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Update Order Status Error:", err);
      message.error(
        `Failed to update status: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      responsive: ["md"],
    },
    {
      title: "Table",
      dataIndex: ["table", "number"],
      key: "table",
      render: (num) => (num ? `#${num}` : "N/A"),
      width: 80,
    },
    {
      title: "Items",
      dataIndex: "orderItems",
      key: "items",
      render: (items) =>
        items && items.length > 0 ? (
          <Space direction="vertical" size="small">
            {items.map((i) => (
              <Tag key={i.id} color={PRIMARY_COLOR} className="text-xs">
                {i.menuItem?.name || "Unknown Item"} x{i.quantity}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">No items</Text>
        ),
      width: 200,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          className="w-full min-w-[140px]"
        >
          {["PENDING", "IN_PROGRESS", "READY", "SERVED"].map((s_val) => (
            <Option key={s_val} value={s_val}>
              <Tag
                color={
                  s_val === "READY"
                    ? "green"
                    : s_val === "IN_PROGRESS"
                    ? "blue"
                    : s_val === "SERVED"
                    ? "purple"
                    : "orange"
                }
                className="m-0 px-2 py-0.5 text-xs"
              >
                {s_val.replace("_", " ")}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
      width: 150,
    },
    {
      title: "Ordered At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (ts) => (ts ? new Date(ts).toLocaleString() : "N/A"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      width: 180,
      responsive: ["sm"],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" tip={`Loading orders for ${eventDetails ? eventDetails.name : `event ${eventId}`}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4 text-center">
        <Title level={3} className="mb-4 text-red-500">
          Error
        </Title>
        <Paragraph>{error}</Paragraph>
        <Button
          type="primary"
          onClick={() => navigate(-1)} // Go back to the previous page
          style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <Title
              level={2}
              className="text-2xl sm:text-3xl font-semibold"
              style={{ color: PRIMARY_COLOR, marginBottom: 0 }}
            >
              {eventDetails ? `Orders for ${eventDetails.name}` : `Orders for Event ID: ${eventId}`}
            </Title>
            {eventDetails && eventDetails.venue && (
                <Text type="secondary" className="block">Venue: {eventDetails.venue}</Text>
            )}
          </Col>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/vendor/dashboard")} // Or navigate(-1) to go back
              style={{
                color: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.backgroundColor = HOVER_PRIMARY_COLOR;
                e.currentTarget.style.borderColor = HOVER_PRIMARY_COLOR;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = PRIMARY_COLOR;
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = PRIMARY_COLOR;
              }}
            >
              Back to Dashboard
            </Button>
          </Col>
        </Row>

        <Card
          className="shadow-xl overflow-hidden border-t-4"
          style={{ borderColor: PRIMARY_COLOR }}
        >
          <Title
            level={4}
            className="text-xl sm:text-2xl font-semibold mb-6"
            style={{ color: PRIMARY_COLOR }}
          >
            Incoming Orders ({orders.length})
          </Title>
          <Table
            dataSource={orders}
            columns={orderColumns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              responsive: true,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
            }}
            scroll={{ x: "max-content" }}
            className="elegant-table" // You might need to define this class or use AntD's styling
            locale={{
              emptyText: (
                <div className="text-gray-500 py-8 text-center">
                  <Paragraph>
                    No orders found for this event at the moment.
                  </Paragraph>
                </div>
              ),
            }}
          />
        </Card>

        <div className="text-center py-4 text-sm text-gray-500">
          Event Orders &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}