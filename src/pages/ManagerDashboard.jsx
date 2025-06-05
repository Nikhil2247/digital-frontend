// File: src/pages/ManagerDashboard.jsx
import { useEffect, useState } from "react";
import axios from "../api/axios";
import {
  Typography,
  Spin,
  message,
  Table,
  Select,
  Tag,
  Space,
  Card,
  Empty,
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PRIMARY_COLOR = "#1eaedb";

export default function ManagerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading Dashboard Data...");

  let userId = null;
  try {
    const userItem = localStorage.getItem('user');
    if (userItem) {
      userId = JSON.parse(userItem)?.sub;
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  useEffect(() => {
    if (!userId) {
      message.error("User not identified. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setLoadingMessage("Fetching your events...");
      try {
        const assignmentsRes = await axios.get(`/event-managers/manager/${userId}`);
        const assignmentsData = assignmentsRes.data || [];
        setAssignments(assignmentsData);

        setLoadingMessage("Processing initial order list...");
        // First, get the basic order list from assignments
        const basicOrdersFromAssignments = assignmentsData.flatMap((assignment) =>
          (assignment.event?.orders || []).map((order) => ({
            ...order, // Contains id, status, createdAt, updatedAt, eventId, tableId, guestId
            eventName: assignment.event?.name || "Unknown Event",
            // Initial tableDisplay, might be updated if full order fetch provides more
            tableDisplay: order.tableId ? `Table ID: ${order.tableId.slice(-6)}` : "N/A",
          }))
        );

        if (basicOrdersFromAssignments.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        setLoadingMessage(`Workspaceing details for ${basicOrdersFromAssignments.length} order(s)...`);
        // Now, fetch full details for each order
        const detailedOrdersPromises = basicOrdersFromAssignments.map(async (basicOrder) => {
          try {
            // Assuming an endpoint like /orders/:id gives full order details
            const orderDetailRes = await axios.get(`/orders/${basicOrder.id}`);
            const detailedOrderData = orderDetailRes.data;
            return {
              ...basicOrder, // Keep eventName and other pre-processed fields
              ...detailedOrderData, // This should include orderItems, totalAmount, and potentially a populated table object
              // Update tableDisplay if detailed data includes table number
              tableDisplay: detailedOrderData.table?.number
                ? `Table #${detailedOrderData.table.number}`
                : basicOrder.tableDisplay, // Fallback to ID if no number
            };
          } catch (err) {
            console.warn(`Failed to fetch details for order ${basicOrder.id}:`, err);
            // Return the basic order data so it still appears, but without full details
            return {
              ...basicOrder,
              orderItems: [], // Default to empty if details fetch fails
              totalAmount: null, // Default to null
            };
          }
        });

        const settledDetailedOrders = await Promise.all(detailedOrdersPromises);
        setOrders(settledDetailedOrders);

      } catch (err) {
        console.error("Fetch Data Error:", err);
        message.error(
          `Failed to load dashboard data: ${err.response?.data?.message || err.message}`
        );
        setOrders([]); // Clear orders on critical failure
      } finally {
        setLoading(false);
        setLoadingMessage("Loading Dashboard Data..."); // Reset
      }
    };
    fetchData();
  }, [userId]);

  const onStatusChange = async (orderId, status) => {
    // ... (onStatusChange function remains the same)
    try {
      await axios.patch(`/orders/${orderId}/status`, { status });
      message.success(`Order ${orderId} status updated to ${status.replace("_", " ")}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Update Status Error:", err);
      message.error(
        `Failed to update order status: ${err.response?.data?.message || err.message}`
      );
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      fixed: "left",
      responsive: ["md"],
      render: (idText) => <Text copyable={{text: idText}}>{idText.slice(-6)}...</Text>, // Show last 6 chars, copyable full ID
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: "Event",
      dataIndex: "eventName",
      key: "eventName",
      responsive: ["xs"],
      sorter: (a, b) => a.eventName.localeCompare(b.eventName),
      filters: assignments.map(a => ({text: a.event.name, value: a.event.name})).filter((v,i,a)=>a.findIndex(t=>(t.text === v.text))===i), // Unique event names for filters
      onFilter: (value, record) => record.eventName.includes(value),
    },
    {
      title: "Table",
      dataIndex: "tableDisplay", // Updated to use the processed tableDisplay field
      key: "tableDisplay",
      width: 150,
      responsive: ["sm"],
      sorter: (a, b) => (a.tableDisplay || "").localeCompare(b.tableDisplay || ""),
    },
    {
      title: "Items",
      dataIndex: "orderItems",
      key: "items",
      responsive: ["lg"],
      width: 230,
      render: (items) =>
        items && items.length > 0 ? (
          <Space direction="vertical" size={2}>
            {items.slice(0, 2).map((i) => ( // Show first 2 items
              <Tag key={i.id || i.menuItem?.id} className="text-xs truncate max-w-[200px]" style={{borderColor: PRIMARY_COLOR + '80', color: PRIMARY_COLOR, backgroundColor: PRIMARY_COLOR + '10'}}>
                {i.menuItem?.name || "Item (name missing)"} (x{i.quantity})
              </Tag>
            ))}
            {items.length > 2 && <Text type="secondary" className="text-xs ml-1">...and {items.length - 2} more</Text>}
          </Space>
        ) : (
          <Text type="secondary" className="text-xs">No items or details missing</Text>
        ),
    },
  
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => onStatusChange(record.id, newStatus)}
          className="w-full min-w-[130px]"
        >
          {["PENDING", "IN_PROGRESS", "READY", "SERVED", "CANCELLED"].map((s_val) => (
            <Option key={s_val} value={s_val}>
              <Tag
                color={
                  s_val === "READY" ? "green"
                    : s_val === "IN_PROGRESS" ? "geekblue"
                    : s_val === "SERVED" ? "purple"
                    : s_val === "CANCELLED" ? "red"
                    : "orange" // PENDING
                }
                className="m-0 px-2 py-0.5 text-xs"
              >
                {s_val.replace("_", " ")}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'In Progress', value: 'IN_PROGRESS' },
        { text: 'Ready', value: 'READY' },
        { text: 'Served', value: 'SERVED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
      onFilter: (value, record) => record.status.includes(value),
    },
    {
      title: "Ordered At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (ts) => ts ? new Date(ts).toLocaleString() : 'N/A',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
      responsive: ["sm"],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" tip={loadingMessage} />
      </div>
    );
  }

  if (!userId && !loading) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4 text-center">
        <Title level={3} className="mb-4">Access Denied</Title>
        <Paragraph>We couldn't identify your user session. Please try logging in again.</Paragraph>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen">
      <div className="max-w-screen-2xl mx-auto space-y-8"> {/* Even wider for manager */}
        <Title level={2} className="text-2xl sm:text-3xl font-semibold pt-4 text-center sm:text-left" style={{ color: PRIMARY_COLOR }}>
          Manager Dashboard
        </Title>

        {assignments.length > 0 && (
            <Card className="shadow-lg border-t-2" style={{borderColor: PRIMARY_COLOR + '50'}}>
                <Title level={4} style={{color: PRIMARY_COLOR}} className="mb-2 text-lg">Managed Events ({assignments.length})</Title>
                <Space wrap size={[8,8]}>
                    {assignments.map(a => (
                        <Tag key={a.event.id} style={{borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, backgroundColor: PRIMARY_COLOR + '10'}} className="text-sm px-2 py-1">{a.event.name}</Tag>
                    ))}
                </Space>
            </Card>
        )}

        <Card className="shadow-xl overflow-hidden border-t-4 !mt-3" style={{borderColor: PRIMARY_COLOR}}>
          <Title level={4} className="text-xl sm:text-2xl font-semibold mb-6" style={{ color: PRIMARY_COLOR }}>
            All Event Orders ({orders.length})
          </Title>
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10, responsive: true, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders` }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <div className="text-gray-500 py-8 text-center">
                   <Empty description={<span>No orders found for your managed events.</span>}/>
                </div>
              ),
            }}
          />
        </Card>
        <div className="text-center py-4 text-sm text-gray-500">
            Manager Dashboard &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}