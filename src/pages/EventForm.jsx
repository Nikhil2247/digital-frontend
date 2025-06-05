// src/components/EmbeddedEventForm.jsx
import React, { useState, useEffect } from "react";
import axios from "../api/axios"; // Assuming this is your configured axios instance
import { Form, Input, Button, DatePicker, message, Space, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import Title from "antd/es/typography/Title";

// Props:
// eventIdForEdit (string|null): ID of event to edit, null for new event.
// onFormSubmitSuccess (function): Callback on successful submission.
// onCancel (function): Callback for cancelling/closing the form.

export default function EmbeddedEventForm({
  eventIdForEdit,
  onFormSubmitSuccess,
  onCancel,
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // State to manage Ant Design Upload's file list
  const isEditMode = !!eventIdForEdit;

  // Base64 conversion helper is removed as we are sending the file directly.

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      axios
        .get(`/events/${eventIdForEdit}`)
        .then((res) => {
          form.setFieldsValue({
            name: res.data.name,
            description: res.data.description || "",
            startDate: res.data.startDate ? moment(res.data.startDate) : null,
            endDate: res.data.endDate ? moment(res.data.endDate) : null,
            venue: res.data.venue || "",
          });
          // To display an existing image, your backend should provide `res.data.photoUrl`.
          // Then, you would set fileList like this:
          // if (res.data.photoUrl) {
          //   setFileList([{
          //     uid: '-1', // Or a unique ID, e.g., from the image data itself
          //     name: res.data.photoFilename || 'image.png', // A descriptive name
          //     status: 'done',
          //     url: res.data.photoUrl, // The URL to display the image
          //     // If you want the backend to know this is an existing file, you might add a custom property:
          //     // isExisting: true,
          //   }]);
          // } else {
          //   setFileList([]);
          // }
          // For now, clearing file list. User must re-upload if they want to change the image.
          setFileList([]);
        })
        .catch((err) => {
          console.error("Failed to fetch event data:", err);
          message.error("Failed to load event data for editing.");
        })
        .finally(() => setLoading(false));
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [eventIdForEdit, form, isEditMode]);

  const handleFileChange = ({ fileList: newFileList }) => {
    // Only keep the latest file if maxCount is 1.
    // Ant Design's Upload component usually handles this with maxCount prop,
    // but this ensures our state is also in sync with that behavior.
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
    }
    // Prevent upload and manage file list manually if validation fails
    if (!(isJpgOrPng && isLt2M)) {
      return Upload.LIST_IGNORE; // Prevents file from being added to the list automatically if invalid
    }
    // Return false to manage upload manually (already done by setting fileList in handleFileChange)
    // or true if you want AntD to handle it (but we need originFileObj).
    // It's common to return false and then handle the file yourself.
    // However, for our case, we let AntD add it to the list via `handleFileChange` and then grab `originFileObj`.
    // `beforeUpload`'s primary role here is validation.
    return true;
  };

  const handleSubmit = async (values) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description || ""); // Ensure empty string if undefined
    formData.append("venue", values.venue);
    formData.append(
      "startDate",
      values.startDate ? values.startDate.toISOString() : ""
    ); // Send empty string or null for dates
    formData.append(
      "endDate",
      values.endDate ? values.endDate.toISOString() : ""
    );

    // Check if there is a file to upload
    // fileList[0].originFileObj is the actual File object
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("photo", fileList[0].originFileObj);
    } else if (
      isEditMode &&
      fileList.length > 0 &&
      fileList[0].url &&
      !fileList[0].originFileObj
    ) {
      // This condition means an existing image is present (has a URL) and wasn't changed.
      // If you want to inform the backend that the image hasn't changed, you might not append 'photo'
      // or send a specific field e.g., formData.append('existingPhotoUrl', fileList[0].url);
      // For this example, if no *new* file is selected, 'photo' field won't be sent.
      // The backend should be designed to not clear the photo if the 'photo' field is missing on an update.
    }

    // If you want to allow clearing an image in edit mode without uploading a new one,
    // you'll need a mechanism. For example, if fileList is empty after a user action (e.g., clicking 'remove' on a displayed image)
    // you might send `formData.append('photo', '');` or `formData.append('removePhoto', 'true');`
    // This depends on your backend API design.

    try {
      let response;
      if (isEditMode) {
        // When using FormData, Axios will automatically set the Content-Type header.
        response = await axios.patch(`/events/${eventIdForEdit}`, formData);
        message.success("Event updated successfully!");
      } else {
        response = await axios.post("/events", formData);
        message.success("Event created successfully!");
        form.resetFields();
        setFileList([]);
      }
      // --- CRUCIAL CHANGE HERE ---
      // Pass the new event ID back to the parent component (VendorDashboard)
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(response.data.id); // Assuming your backend returns the created/updated event object with an 'id'
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      message.error(`Failed to save event: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
    >
      <Title level={4} style={{ marginBottom: 24 }}>
        {isEditMode ? "Edit Event" : "Create New Event"}
      </Title>
      <Form.Item
        name="name"
        label="Event Name"
        rules={[{ required: true, message: "Please input the event name!" }]}
      >
        <Input placeholder="Enter event name" />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Enter event description" />
      </Form.Item>
      <Form.Item
        name="venue"
        label="Venue"
        rules={[{ required: true, message: "Please input the event venue!" }]}
      >
        <Input placeholder="Enter event venue" />
      </Form.Item>
      <Form.Item
        name="photo" // Name here is for Form's values, not directly related to FormData key if getValueFromEvent is used
        label="Event Photo"
        // valuePropName="fileList" // This is correct for controlling Upload component
        // getValueFromEvent correctly gets the file list from Upload's onChange
        // For `fileList` state management, we use `handleFileChange` which updates `fileList` state.
        // The Upload component below directly uses the `fileList` state.
        // The validator is optional based on your requirements.
        rules={[
          {
            validator: (_, value) => {
              // value here is fileList from Upload's onChange
              // if (!isEditMode && (!fileList || fileList.length === 0)) {
              //   return Promise.reject(new Error('Please upload an event photo for new events!'));
              // }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Upload
          listType="picture"
          maxCount={1}
          fileList={fileList} // Controlled component: uses state
          onChange={handleFileChange} // Updates state
          beforeUpload={beforeUpload} // Validates file before adding to list (or attempting upload)
          onRemove={() => {
            // Handle removal of file
            setFileList([]);
            // If you are in edit mode and had an existing image, removing it might mean
            // you want to delete it on the backend. You'd need to track this state.
            // For instance, form.setFieldsValue({ photo: null }); might be needed if 'photo'
            // field in the form instance itself is being used to track this.
          }}
        >
          <Button icon={<UploadOutlined />}>Upload Photo</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="startDate"
        label="Start Date & Time"
        rules={[{ required: true, message: "Please select the start date!" }]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item
        name="endDate"
        label="End Date & Time"
        rules={[{ required: true, message: "Please select the end date!" }]}
      >
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item style={{ textAlign: "right", marginTop: 24 }}>
        <Space>
          {onCancel && (
            <Button
              onClick={onCancel}
              disabled={loading}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
            }}
          >
            {isEditMode ? "Update Event" : "Create Event"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

// Re-export PRIMARY_COLOR if EmbeddedEventForm uses it directly and it's not passed via style prop.
// It's used in the submit button style.
const PRIMARY_COLOR = "#1eaedb";
