// VendorDashboard.js
import { useEffect, useState } from "react";
import axios from "../api/axios"; // Assuming axios is configured
import {
  Typography,
  Spin,
  message,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Table,
  Tag,
  Space,
  Card,
  List,
  Modal,
  DatePicker,
  Image,
} from "antd";
import EmbeddedEventForm from "./EventForm"; // Assuming this component exists
import Tables from "./Tables"; // Import the Tables component

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const PRIMARY_COLOR = "#1eaedb";
const HOVER_PRIMARY_COLOR = "#188db1";
// --- ADD THIS IMPORT ---
import { useNavigate } from "react-router-dom"; // For navigation
import MenuCreationForm from "./MenuCreationForm";
import Manager from "./ManagerAssignmentForm";
import AssignManagerModal from "./ManagerAssignmentForm";
export default function VendorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false); // For menu item creation
  const [form] = Form.useForm(); // For menu item form
  const userId = JSON.parse(localStorage.getItem("user"))?.sub;
  // console.log(userId, "User ID from localStorage");
  const navigate = useNavigate();

  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null); // For future edit functionality
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for the AssignManagerModal
  const [isAssignManagerModalVisible, setIsAssignManagerModalVisible] =
    useState(false);
  const [selectedEventForManagers, setSelectedEventForManagers] =
    useState(null);
  const [allUsers, setAllUsers] = useState([]); // To fetch all users (for managers)
  const [allManagers, setAllManagers] = useState([]); // To fetch all event managers (assignments)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const usersRes = await axios.get("/users"); // Fetch all users to get managers
        const managersRes = await axios.get("/event-managers"); // Fetch all event-manager assignments

        //  setAssignments(vendorAssignmentsRes.data);
        setAllUsers(usersRes.data);
        setAllManagers(managersRes.data);
      } catch (err) {
        console.error("Error loading vendor dashboard data:", err);
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Function to show the Assign Manager Modal
  const showAssignManagerModal = (event) => {
    setSelectedEventForManagers(event);
    setIsAssignManagerModalVisible(true);
  };

  // Function to close the Assign Manager Modal
  const handleAssignManagerModalClose = async () => {
    setIsAssignManagerModalVisible(false);
    setSelectedEventForManagers(null); // Clear selected event

    // Re-fetch managers to update the list in the dashboard if changes were made
    try {
      const managersRes = await axios.get("/event-managers");
      setAllManagers(managersRes.data);
    } catch (err) {
      console.error("Error refetching managers after modal close:", err);
      message.error("Failed to refresh manager data.");
    }
  };

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const [assignRes, orderRes] = await Promise.all([
        axios.get(`/event-vendors/vendor/${userId}`),
        axios.get("/orders"),
      ]);

      const assignedEvents = assignRes.data.map((a) => a.event);
      const eventIds = new Set(assignedEvents.map((e) => e.id));
      const filteredOrders = orderRes.data.filter((o) =>
        eventIds.has(o.eventId)
      );

      setAssignments(assignRes.data);
      setOrders(filteredOrders);
    } catch (err) {
      console.error("Fetch Data Error:", err);
      message.error(
        `Failed to load vendor data: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      message.error("User not identified. Please log in again.");
      setLoading(false);
      return;
    }
    fetchVendorData();
  }, [userId]);

  // const onCreateMenu = async (values) => {
  //   setCreating(true);
  //   try {
  //     // Send all form values, including the new tags
  //     await axios.post("/menu", { ...values });
  //     message.success("Menu item created successfully!");
  //     form.resetFields();
  //     // Refresh assignments to get updated menuItems for events
  //     const res = await axios.get(`/event-vendors/vendor/${userId}`);
  //     setAssignments(res.data);
  //   } catch (err) {
  //     console.error("Create Menu Error:", err);
  //     message.error(
  //       `Failed to create menu item: ${
  //         err.response?.data?.message || err.message
  //       }`
  //     );
  //   } finally {
  //     setCreating(false);
  //   }
  // };

  const onStatusChange = async (orderId, status) => {
    try {
      await axios.patch(`/orders/${orderId}/status`, { status });
      message.success(
        `Order ${orderId} status updated to ${status.replace("_", " ")}`
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error("Update Status Error:", err);
      message.error(
        `Failed to update status: ${err.response?.data?.message || err.message}`
      );
    }
  };

  // Event Form Modal Handlers
  const showCreateEventModal = () => {
    setEditingEventId(null); // Ensure it's for creation
    setIsEventModalVisible(true);
  };

  const showEditEventModal = (eventId) => {
    setEditingEventId(eventId); // Set the ID for editing
    setIsEventModalVisible(true);
  };
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleEventModalCancel = () => {
    setIsEventModalVisible(false);
    setEditingEventId(null); // Clear editing ID on cancel
  };
  const handleFormSuccess = () => {
    setIsModalVisible(false); // Close modal on successful form submission
    // assignments are already refreshed inside MenuCreationForm's onCreateMenu
    // so no need to explicitly fetch again here.
  };

  // --- MODIFIED: handleEventFormSuccess to include assignment ---
  const handleEventFormSuccess = async (newlyCreatedEventId) => {
    setIsEventModalVisible(false);

    // Only attempt assignment if a new event was created (not edited)
    if (newlyCreatedEventId && !editingEventId) {
      // Check !editingEventId to ensure it's a creation flow
      try {
        await axios.post("/event-vendors/assign", {
          eventId: newlyCreatedEventId,
          userId: userId,
        });
        //    message.success("Event created and assigned to you successfully!");
      } catch (assignError) {
        console.error("Auto-assign vendor failed:", assignError);
        message.warn(
          `Event created, but auto-assignment failed: ${
            assignError.response?.data?.message || assignError.message
          }`
        );
      }
    } else {
      message.info("Event updated successfully!");
    }
    setEditingEventId(null); // Clear editing ID
    fetchVendorData(); // Refresh data to show new event and its assignment
  };
  // --- ADD NAVIGATION HANDLER FOR EVENT CLICK ---
  const handleEventCardClick = (eventId) => {
    navigate(`/order/${eventId}`); // Navigate to the specific event's order page
  };
  // const orderColumns = [
  //   {
  //     title: "Order ID",
  //     dataIndex: "id",
  //     key: "id",
  //     width: 100,
  //     fixed: "left",
  //     responsive: ["md"],
  //   },
  //   {
  //     title: "Table",
  //     dataIndex: ["table", "number"],
  //     key: "table",
  //     render: (num) => (num ? `#${num}` : "N/A"),
  //     width: 80,
  //   },
  //   {
  //     title: "Items",
  //     dataIndex: "orderItems",
  //     key: "items",
  //     render: (items) =>
  //       items && items.length > 0 ? (
  //         <Space direction="vertical" size="small">
  //           {items.map((i) => (
  //             <Tag key={i.id} color={PRIMARY_COLOR} className="text-xs">
  //               {i.menuItem?.name || "Unknown Item"} x{i.quantity}
  //             </Tag>
  //           ))}
  //         </Space>
  //       ) : (
  //         <Text type="secondary">No items</Text>
  //       ),
  //     width: 200,
  //   },
  //   {
  //     title: "Status",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (status, record) => (
  //       <Select
  //         value={status}
  //         onChange={(newStatus) => onStatusChange(record.id, newStatus)}
  //         className="w-full min-w-[140px]"
  //       >
  //         {["PENDING", "IN_PROGRESS", "READY", "SERVED"].map((s_val) => (
  //           <Option key={s_val} value={s_val}>
  //             <Tag
  //               color={
  //                 s_val === "READY"
  //                   ? "green"
  //                   : s_val === "IN_PROGRESS"
  //                   ? "blue"
  //                   : s_val === "SERVED"
  //                   ? "purple"
  //                   : "orange"
  //               }
  //               className="m-0 px-2 py-0.5 text-xs"
  //             >
  //               {s_val.replace("_", " ")}
  //             </Tag>
  //           </Option>
  //         ))}
  //       </Select>
  //     ),
  //     width: 150,
  //   },
  //   {
  //     title: "Ordered At",
  //     dataIndex: "createdAt",
  //     key: "createdAt",
  //     render: (ts) => new Date(ts).toLocaleString(),
  //     sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  //     defaultSortOrder: "descend",
  //     width: 180,
  //     responsive: ["sm"],
  //   },
  // ];

  if (loading && !isEventModalVisible) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" tip="Loading Dashboard..." />
      </div>
    );
  }

  if (!userId && !loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4 text-center">
        <Title level={3} className="mb-4">
          Access Denied
        </Title>
        <Paragraph>
          We couldn't identify your user session. Please try logging in again.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between lg:flex-nowrap flex-wrap items-center">
          <Title
            level={2}
            className="text-2xl sm:text-3xl font-semibold pt-4 text-center sm:text-left"
            style={{ color: PRIMARY_COLOR }}
          >
            Vendor Dashboard
          </Title>
          <div className="flex space-x-2">
            <Button
              type="primary"
              onClick={showModal}
              className="text-white font-medium"
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
                marginBottom: "20px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = HOVER_PRIMARY_COLOR)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)
              }
            >
              Add New Menu Item
            </Button>
            <Button
              type="primary"
              onClick={showCreateEventModal}
              style={{
                backgroundColor: PRIMARY_COLOR,
                borderColor: PRIMARY_COLOR,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = HOVER_PRIMARY_COLOR)
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)
              }
            >
              Create New Event
            </Button>
          </div>
        </div>

        {/* Events with Menu Items */}
        <div>
          <Title
            level={3}
            className="text-xl sm:text-2xl font-semibold mb-4 mt-6"
            style={{ color: PRIMARY_COLOR }}
          >
            Your Events
          </Title>
          {assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map(({ event }) => (
                <Card
                  key={event.id}
                  onClick={() => handleEventCardClick(event.id)}
                  title={
                    <span
                      className="font-semibold"
                      style={{ color: PRIMARY_COLOR }}
                    >
                      {event.name}
                    </span>
                  }
                  extra={
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button
                        type="default"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          showEditEventModal(event.id);
                        }}
                        style={{
                          borderColor: PRIMARY_COLOR,
                          color: PRIMARY_COLOR,
                        }}
                      >
                        Edit Event
                      </Button>
                      <Button
                        type="primary" // Use primary for action
                        size="small"
                        onClick={(e) => {
                          // Prevent card click if button is clicked
                          e.stopPropagation();
                          showAssignManagerModal(event); // Pass the entire event object
                        }}
                        style={{
                          backgroundColor: PRIMARY_COLOR,
                          borderColor: PRIMARY_COLOR,
                        }}
                      >
                        Assign Managers
                      </Button>
                    </div>
                  }
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-2 "
                  style={{ borderColor: PRIMARY_COLOR }}
                >
                  {event.photo && (
                    <div className="mb-4 -mx-6 -mt-6">
                      <div className="h-56 w-full overflow-hidden ">
                        <Image
                          src={event.photo}
                          alt={`${event.name} photo`}
                          className="w-full h-full object-cover"
                          preview={false}
                          placeholder={
                            <div className="flex items-center justify-center h-full bg-gray-200">
                              <Spin />
                            </div>
                          }
                          onError={(e) => {
                            console.error("Image failed to load:", event.photo);
                            e.target.src =
                              "https://via.placeholder.com/150?text=Image+Load+Error";
                            message.error(
                              `Failed to load image for ${event.name}. Check console.`
                            );
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {event.description && (
                    <Paragraph className="text-gray-600 mb-3 text-sm">
                      {event.description}
                    </Paragraph>
                  )}
                  {event.venue && (
                    <Paragraph className="text-gray-600 text-sm mb-3">
                      <Text strong>Venue:</Text> {event.venue}
                    </Paragraph>
                  )}
                  <Paragraph className="text-gray-600 text-sm mb-3">
                    <Text strong>Starts:</Text>{" "}
                    {event.startDate
                      ? new Date(event.startDate).toLocaleString()
                      : "N/A"}
                  </Paragraph>
                  <Paragraph className="text-gray-600 text-sm mb-3">
                    <Text strong>Ends:</Text>{" "}
                    {event.endDate
                      ? new Date(event.endDate).toLocaleString()
                      : "N/A"}
                  </Paragraph>

                  <List
                    dataSource={event.menuItems || []}
                    header={
                      <strong
                        className="font-medium text-md"
                        style={{ color: PRIMARY_COLOR }}
                      >
                        Menu Items ({event.menuItems?.length || 0})
                      </strong>
                    }
                    renderItem={(item) => (
                      <List.Item className="flex justify-between items-center py-2 px-0">
                        <div>
                          <Text strong className="text-gray-800 text-sm">
                            {item.name}
                          </Text>
                          {item.description && (
                            <Text type="secondary" className="block text-xs">
                              {item.description}
                            </Text>
                          )}
                          {/* Displaying new tags based on 'tag' and 'recTag' */}
                          <div className="mt-1">
                            {item.tag && ( // Check if 'tag' exists
                              <Tag
                                color={item.tag === "Veg" ? "green" : "red"}
                                className="mr-1 text-xs"
                              >
                                {item.tag}
                              </Tag>
                            )}
                            {item.recTag && ( // Check if 'recTag' exists
                              <Tag color={PRIMARY_COLOR} className="text-xs">
                                {item.recTag}
                              </Tag>
                            )}
                          </div>
                        </div>
                      </List.Item>
                    )}
                    locale={{
                      emptyText: (
                        <div className="text-gray-500 py-4 text-center text-sm">
                          No menu items added yet for this event.
                        </div>
                      ),
                    }}
                  />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md">
              <div className="text-center py-8 text-gray-500">
                <Paragraph>
                  You are not currently assigned to any events, or no events
                  have associated menu items.
                </Paragraph>
              </div>
            </Card>
          )}
        </div>

        {/* Tables Component */}
        <Tables />

        <div className="text-center py-4 text-sm text-gray-500">
          Vendor Dashboard &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Modal for Creating/Editing Event */}
      <Modal
        title={null}
        visible={isEventModalVisible}
        onCancel={handleEventModalCancel}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <EmbeddedEventForm
          eventIdForEdit={editingEventId}
          onFormSubmitSuccess={handleEventFormSuccess}
          onCancel={handleEventModalCancel}
        />
      </Modal>
      {/* The Modal Component */}
      <Modal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null} // Hide the default footer buttons as the form has its own submit button
        width={800} // Adjust modal width as needed
        destroyOnClose={true} // Destroys content on close to reset form state
      >
        <MenuCreationForm
          userId={userId}
          assignments={assignments}
          setAssignments={setAssignments}
          onFormSuccess={handleFormSuccess} // Pass success callback
          onCancel={handleModalCancel} // Pass cancel callback (though not directly used by form's button)
        />
      </Modal>

      {selectedEventForManagers && ( // Only render modal if an event is selected
        <AssignManagerModal
          visible={isAssignManagerModalVisible}
          event={selectedEventForManagers}
          allUsers={allUsers} // Pass all users to filter by role inside the modal
          // Filter managers specific to this event before passing them
          currentManagers={allManagers.filter(
            (m) => m.eventId === selectedEventForManagers.id
          )}
          onClose={handleAssignManagerModalClose}
          onAssignSuccess={handleAssignManagerModalClose} // Call the close function which also re-fetches
        />
      )}
    </div>
  );
}
