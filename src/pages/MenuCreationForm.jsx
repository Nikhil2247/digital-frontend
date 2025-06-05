// src/components/MenuCreationForm.jsx
import React, { useState } from "react";
import { Form, Input, Select, Button, Card, message, Upload } from "antd"; // Added Upload
import { PlusOutlined } from '@ant-design/icons'; // For Upload button icon
import axios from "../api/axios"; // Or your custom api utility

const PRIMARY_COLOR = "#1eaedb";
const HOVER_PRIMARY_COLOR = "#188db1";

const { Option } = Select;

const MenuCreationForm = ({ userId, assignments, setAssignments, onFormSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false);

  // Helper for Form.Item to properly get value from Upload component
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onCreateMenu = async (values) => {
    setCreating(true);
    const formData = new FormData();

    // Append other form fields
    Object.keys(values).forEach(key => {
      if (key === 'photo') { // Handle photo separately
        if (values.photo && values.photo.length > 0) {
          // values.photo is an array of file objects from Upload.
          // The actual file is in originFileObj.
          formData.append('photo', values.photo[0].originFileObj, values.photo[0].name);
        }
      } else if (values[key] !== undefined && values[key] !== null) { // Append other fields if they exist
        formData.append(key, values[key]);
      }
    });
    
    // For debugging:
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    try {
      await axios.post("/menu", formData, {
        headers: {
          // Axios usually sets 'multipart/form-data' automatically for FormData,
          // but you can set it explicitly if needed.
          // 'Content-Type': 'multipart/form-data',
        },
      });
      message.success("Menu item created successfully!");
      form.resetFields(); // This will also clear the Upload component's fileList
      // Refresh assignments to get updated menuItems for events
      const res = await axios.get(`/event-vendors/vendor/${userId}`);
      setAssignments(res.data);
      if (onFormSuccess) {
        onFormSuccess();
      }
    } catch (err) {
      console.error("Create Menu Error:", err);
      message.error(
        `Failed to create menu item: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card bordered={false}> {/* Card styling removed as per comments for modal use */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onCreateMenu}
        // Adjusted gap for better spacing, keep your grid settings or adjust as needed
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 items-end"
      >
        <Form.Item
          name="eventId"
          label="Select Event"
          rules={[{ required: true, message: "Please select an event!" }]}
          className="w-full"
        >
          <Select
            placeholder="Choose event for this menu item"
            className="w-full"
            allowClear // Added allowClear
          >
            {assignments.map((a) => (
              <Option key={a.event.id} value={a.event.id}>
                {a.event.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label="Menu Item Name"
          rules={[{ required: true, message: "Please enter item name!" }]}
          className="w-full"
        >
          <Input placeholder="E.g., Paneer Tikka" />
        </Form.Item>

        <Form.Item
          name="tag"
          label="Type"
          rules={[{ required: true, message: "Please select item type!" }]}
          className="w-full"
        >
          <Select placeholder="Veg or Non-Veg?" allowClear>
            <Option value="Veg">Veg</Option>
            <Option value="Non-Veg">Non-Veg</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="recTag"
          label="Special Tag (Optional)"
          className="w-full"
        >
          <Select placeholder="e.g., Recommended, Best Seller" allowClear>
            <Option value="Recommended">Recommended</Option>
            <Option value="Best Seller">Best Seller</Option>
            <Option value="Featured">Featured</Option>
            {/* Add an option to clear this if needed, or rely on allowClear */}
            <Option value="">None</Option> 
          </Select>
        </Form.Item>

        {/* Photo Upload Field */}
        <Form.Item
          name="photo"
          label="Item Photo (Optional)"
          valuePropName="fileList" // Crucial for Upload component in Form
          getValueFromEvent={normFile} // Helper to process Upload value
          // rules={[{ required: true, message: "Please upload a photo!" }]} // Make it required if necessary
          className="w-full md:col-span-1" // You might want this to span more on smaller screens if it's alone on a row
        >
          <Upload
            name="photoFile" // This is not directly used if beforeUpload returns false
            listType="picture-card" // UI type: shows a card with preview
            maxCount={1} // Limit to one photo
            beforeUpload={() => false} // Prevent automatic upload, handle via form submission
            accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted image types
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
      


        <Form.Item
          name="description"
          label="Description (Optional)"
          // Adjusted span to allow photo and description on the same line for larger screens if desired
          // For xl:grid-cols-4, if photo takes 1, price takes 1, description can take 2
          className="w-full md:col-span-2 lg:col-span-2 xl:col-span-2" 
        >
          <Input.TextArea rows={3} placeholder="E.g., Marinated cottage cheese, grilled to perfection" />
        </Form.Item>


        {/* Submit Button - Adjust column span as needed based on final layout */}
        {/* Example: For xl:grid-cols-4, this could be xl:col-span-4 for a full-width button on its own row, or placed inline */}
        <Form.Item 
          className="w-full md:col-span-2 lg:col-span-1 xl:col-span-4" // Making it full width on a new row for XL
          // self-end might not be needed if items are laid out well or using gap-y
        >
          <Button
            type="primary"
            htmlType="submit"
            loading={creating}
            className="w-full text-white font-medium"
            style={{
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              height: '40px', // Standard AntD button height
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = HOVER_PRIMARY_COLOR)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = PRIMARY_COLOR)
            }
          >
            Add Menu Item
          </Button>
        </Form.Item>
         {/* Optional Cancel Button - if used within this form directly */}
         {onCancel && (
          <Form.Item 
            className="w-full md:col-span-2 lg:col-span-1 xl:col-span-4" // Mirroring submit button layout
          >
            <Button
              onClick={onCancel}
              className="w-full"
              style={{ height: '40px' }}
              disabled={creating}
            >
              Cancel
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};

export default MenuCreationForm;