// File: src/components/AssignManagerModal.jsx
import { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Button,
  message,
  Spin,
  List,
  Avatar,
  Typography,
  Empty,
  Space,
  Card,
  Tag,
  Divider,
  Row,
  Col
} from "antd";
import { UserOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "../api/axios";

const { Option } = Select;
const { Text, Title } = Typography;

export default function AssignManagerModal({
  visible,
  event,
  allUsers,
  currentManagers, // Managers specifically assigned to this event
  onClose,
  onAssignSuccess, // Callback to refresh data in parent
}) {
  const [selectedManagerId, setSelectedManagerId] = useState(undefined);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState({}); // To track removal loading state
  const [eventSpecificManagers, setEventSpecificManagers] = useState(currentManagers);

  // Update internal state when props change (e.g., when a new event is selected)
  useEffect(() => {
    setEventSpecificManagers(currentManagers);
  }, [currentManagers, event]);

  if (!event) {
    return null; // Don't render if no event is passed
  }

  const availableManagers = allUsers.filter(
    (user) =>
      user.role === "MANAGER" &&
      !eventSpecificManagers.some((m) => m.user.id === user.id)
  );

  const handleAssignManager = async () => {
    if (!selectedManagerId) {
      message.warning("Please select a manager to assign.");
      return;
    }
    setAssigning(true);
    try {
      await axios.post("/event-managers/assign", {
        eventId: event.id,
        userId: selectedManagerId,
      });
      message.success("Manager assigned successfully!");
      setSelectedManagerId(undefined); // Clear selection

      // Optimistically update the local list
      const newlyAssignedUser = allUsers.find(u => u.id === selectedManagerId);
      if (newlyAssignedUser) {
        setEventSpecificManagers((prev) => [
          ...prev,
          { id: Math.random(), eventId: event.id, user: newlyAssignedUser }, // Add a temporary ID
        ]);
      }
      onAssignSuccess(); // Trigger a refetch in the parent component
    } catch (err) {
      console.error("Error assigning manager:", err);
      message.error("Failed to assign manager. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveManager = async (managerAssignmentId) => {
    setRemoving((prev) => ({ ...prev, [managerAssignmentId]: true }));
    try {
      await axios.delete(`/event-managers/${managerAssignmentId}`);
      message.success("Manager unassigned successfully!");
      // Filter out the removed manager from the local list
      setEventSpecificManagers((prev) =>
        prev.filter((m) => m.id !== managerAssignmentId)
      );
      onAssignSuccess(); // Trigger a refetch in the parent component
    } catch (err) {
      console.error("Error unassigning manager:", err);
      message.error("Failed to unassign manager. Please try again.");
    } finally {
      setRemoving((prev) => ({ ...prev, [managerAssignmentId]: false }));
    }
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Assign Managers for "{event.name}"
        </Title>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Done
        </Button>,
      ]}
      width={700}
      destroyOnClose // Important to reset form state when modal closes
    >
      <Divider />
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={24}>
          <Space direction="horizontal" style={{ width: '100%' }}>
            <Select
              placeholder="Select a manager to assign"
              style={{ flexGrow: 1 }}
              onChange={(value) => setSelectedManagerId(value)}
              value={selectedManagerId}
              allowClear
              size="large"
              disabled={availableManagers.length === 0} // Disable if no managers available
            >
              {availableManagers.length === 0 && (
                  <Option disabled>No more managers to assign</Option>
              )}
              {availableManagers.map((user) => (
                <Option key={user.id} value={user.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1EAEDB' }} />
                    <span style={{ marginLeft: '8px' }}>{user.name}</span>
                  </div>
                </Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAssignManager}
              loading={assigning}
              disabled={!selectedManagerId || availableManagers.length === 0}
              size="large"
            >
              Assign
            </Button>
          </Space>
        </Col>
      </Row>

      <Title level={5}>Assigned Managers ({eventSpecificManagers.length})</Title>
      {eventSpecificManagers.length === 0 ? (
        <Empty 
          description="No managers currently assigned to this event." 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: '20px' }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={eventSpecificManagers}
          renderItem={(m) => (
            <Card
              key={m.id}
              size="small"
              style={{
                marginBottom: '8px',
                borderLeft: '4px solid #1EAEDB',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1EAEDB' }} />
                  <Text strong>{m.user.name}</Text>
                  <Tag color="blue">{m.user.email}</Tag>
                </Space>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveManager(m.id)}
                  loading={removing[m.id]}
                  size="small"
                >
                  Remove
                </Button>
              </div>
            </Card>
          )}
        />
      )}
    </Modal>
  );
}