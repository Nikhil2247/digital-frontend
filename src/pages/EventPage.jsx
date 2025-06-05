import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import {
  Typography,
  Card,
  List,
  Spin,
  message,
  InputNumber,
  Button,
  Divider,
  Table as AntTable,
  Space,
  Tag,
  Row,
  Col,
  Drawer,
  Image,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  InfoCircleOutlined,
  MenuOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const primaryColor = "#1EAEDB";

// Helper function to convert hex to rgb for box shadow alpha
const hexToRgb = (hex) => {
  if (!hex || hex.length < 6) return "30, 173, 219"; // Default color if hex is invalid
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};
const primaryBgColorClass = "bg-blue-600";
const primaryBorderColorClass = "border-blue-600";
const primaryHoverBgClass = "hover:bg-blue-700";
// Reusable CartContents component
const CartContents = ({
  cart,
  onPlaceOrder,
  isMobile,
  updateCartItemQuantity,
  cartTotal, // Ensure this prop is received
}) => {
  const localCartColumns = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Paragraph
          strong
          style={{ margin: 0, fontSize: isMobile ? "0.9em" : "1em" }}
        >
          {text}
        </Paragraph>
      ),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: isMobile ? 120 : 140, // Adjusted width
      align: "center",
      render: (qty, record) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            size="small"
            onClick={() => updateCartItemQuantity(record.menuItemId, qty - 1)}
            aria-label={`Decrease quantity of ${record.name}`}
          />
          <InputNumber
            min={0}
            value={qty}
            onChange={(value) =>
              updateCartItemQuantity(
                record.menuItemId,
                value === null ? 0 : value
              )
            }
            style={{ width: isMobile ? 35 : 45, textAlign: "center" }}
            controls={false}
            aria-label={`Quantity of ${record.name}`}
          />
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => updateCartItemQuantity(record.menuItemId, qty + 1)}
            aria-label={`Increase quantity of ${record.name}`}
          />
        </Space>
      ),
    },
    // { // Restored Price column
    //   title: "Price",
    //   dataIndex: "price",
    //   key: "price",
    //   align: "right",
    //   render: (price) => (
    //     <Text style={{ fontSize: isMobile ? "0.9em" : "1em" }}>
    //       ₹{price.toFixed(2)}
    //     </Text>
    //   ),
    // },
    // { // Restored Total column
    //   title: "Total",
    //   key: "total",
    //   align: "right",
    //   render: (_, record) => (
    //     <Paragraph strong style={{ margin: 0, fontSize: isMobile ? "0.9em" : "1em" }}>
    //       ₹{(record.quantity * record.price).toFixed(2)}
    //     </Paragraph>
    //   ),
    // },
  ];

  return (
    <>
      <AntTable
        dataSource={cart}
        columns={localCartColumns}
        pagination={false}
        rowKey="menuItemId"
        size={isMobile ? "small" : "middle"}
        style={{ marginBottom: 24 }}
        scroll={{ x: isMobile ? "100%" : undefined }}
        summary={() => (
          // Restored summary
          <AntTable.Summary.Row style={{ backgroundColor: "#f9f9f9" }}>
            <AntTable.Summary.Cell
              index={0}
              colSpan={localCartColumns.length - 1} // Span all columns except the last one
              style={{ textAlign: "right", paddingRight: "8px" }}
            >
              {/* <Title
                level={5}
                style={{ margin: 0, color: primaryColor, fontSize: isMobile ? "1.05em" : "1.1em" }}
              >
                Grand Total:
              </Title> */}
            </AntTable.Summary.Cell>
            <AntTable.Summary.Cell
              index={localCartColumns.length - 1}
              style={{ textAlign: "right" }}
            >
              {/* <Title
                level={5}
                style={{ margin: 0, color: primaryColor, fontSize: isMobile ? "1.05em" : "1.1em" }}
              >
                ₹{cartTotal.toFixed(2)} {/* Use cartTotal prop *
              </Title> */}
            </AntTable.Summary.Cell>
          </AntTable.Summary.Row>
        )}
      />
      <Button
        type="primary"
        block
        size="large"
        style={{
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          height: "50px",
          fontSize: "18px",
          fontWeight: "bold",
          boxShadow: `0 4px 10px rgba(${hexToRgb(primaryColor)}, 0.4)`,
        }}
        onClick={onPlaceOrder}
      >
        Place Order Now
      </Button>
    </>
  );
};

export default function EventPage() {
  const { eventId, tableNumber } = useParams();
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isCartDrawerVisible, setCartDrawerVisible] = useState(false);

  const isMobileView = screenWidth < 768;

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/events/${eventId}/number/${tableNumber}`);
      setTableData(res.data);
    } catch (err) {
      console.error("Failed to load event info:", err);
      message.error(
        "Failed to load event info. Please ensure the URL is correct."
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, tableNumber]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const onQtyChange = (id, value) => {
    const val = value === null ? 0 : Math.max(0, value);
    setQuantities((q) => ({ ...q, [id]: val }));
  };

  const addToCart = (item) => {
    const qty = quantities[item.id] || 1;
    if (qty < 1) {
      message.warning("Quantity must be at least 1 to add to cart.");
      return;
    }

    setCart((prevCart) => {
      const exists = prevCart.find((ci) => ci.menuItemId === item.id);
      if (exists) {
        return prevCart.map((ci) =>
          ci.menuItemId === item.id
            ? { ...ci, quantity: ci.quantity + qty }
            : ci
        );
      }
      return [
        ...prevCart,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: qty,
          price: item.price,
        },
      ];
    });
    message.success(`Added ${qty} × ${item.name} to cart.`);
    setQuantities((q) => ({ ...q, [item.id]: 1 }));

    if (isMobileView) {
      setCartDrawerVisible(true);
    }
  };

  const updateCartItemQuantity = (menuItemId, newQuantity) => {
    setCart((prevCart) => {
      if (newQuantity <= 0) {
        message.info(`Removed item from cart.`);
        return prevCart.filter((item) => item.menuItemId !== menuItemId);
      }
      return prevCart.map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      message.warning(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    try {
      await axios.post("/orders", {
        eventId,
        tableId: tableData.id,
        items: cart.map(({ menuItemId, quantity }) => ({
          menuItemId,
          quantity,
        })),
      });
      message.success(
        "Order placed successfully! We'll notify you when it's ready."
      );
      setCart([]);
      setQuantities({});
      if (isMobileView) {
        setCartDrawerVisible(false);
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      message.error(
        "Failed to place order. Please try again. " +
          (error.response?.data?.message || "")
      );
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Spin
          size="large"
          tip="Loading event details..."
          style={{ color: primaryColor }}
        />
      </div>
    );
  }

  if (!tableData) {
    return (
      <div
        style={{
          padding: 24,
          maxWidth: 800,
          margin: "auto",
          textAlign: "center",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginTop: "50px",
        }}
      >
        <Title level={4} style={{ color: "#ff4d4f" }}>
          <InfoCircleOutlined style={{ marginRight: 8 }} />
          Event Not Found
        </Title>
        <Paragraph type="secondary">
          No event information could be retrieved for the provided Table Number
          and Event ID. Please double-check the URL or contact event staff.
        </Paragraph>
      </div>
    );
  }

  const { event, number } = tableData;
  const menuItems = event?.menuItems || [];

  return (
    <div
      className="max-w-7xl mx-auto p-4"
      style={{
        paddingBottom:
          isMobileView && cart.length > 0 && !isCartDrawerVisible
            ? "90px"
            : "24px",
      }}
    >
      {" "}
      {/* Adjusted paddingBottom */}
      <Row justify="center">
        <Col xs={24} sm={24} md={22} lg={22} xl={22}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16, // Slightly more rounded for a softer look
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)", // More pronounced, elegant shadow
              marginBottom: 24,
              padding: "0", // Remove card's internal padding, manage it in content below
              overflow: "hidden", // Ensures background image respects border-radius
              position: "relative", // Needed for absolute positioning of overlay
              // Background image styling
              backgroundImage: event.photo ? `url(${event.photo})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              display: "flex", // To make content container fill space
              flexDirection: "column", // To stack content vertically
            }}
            bodyStyle={{
              padding: "0", // Ensure no padding from AntD's bodyStyle for custom content
              position: "relative", // Needed for z-index of content over overlay
              zIndex: 2, // Ensure content is above the overlay
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: "250px", // Ensure card has a minimum height to show background
            }}
          >
            {/* Overlay for readability: This creates the dark tint over the image */}
            {event.photo && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.60)", // Darker overlay for better text contrast
                  borderRadius: 16, // Match card border-radius
                  zIndex: 1, // Ensure overlay is behind content but above background
                }}
              />
            )}

            {/* Card Content Wrapper: Contains all text and tags */}
            <div
              style={{
                position: "relative", // To ensure this div's content is above the overlay
                zIndex: 2, // Explicitly set z-index to ensure it's on top
                padding: "20px 10px", // Generous internal padding
                width: "100%",
                textAlign: "center",
                color: "#fff", // Default text color to white for better contrast on dark background
              }}
            >
              <Title
                level={2}
                className="!instrument-sans"
                style={{
                  // Use a clean, modern font
                  color: "#fff", // White color for the title
                  textAlign: "center",
                  marginBottom: 8,
                  marginTop: 0,
                  lineHeight: 1, // Better line spacing
                  // fontWeight: 700, // Make title bolder
                  fontSize: "2.5em", // Larger font size for impact
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)", // Subtle text shadow for readability
                }}
              >
                Welcome to {event.name}!
              </Title>
              <Paragraph
                className="!instrument-sans"
                style={{
                  textAlign: "center",
                  fontSize: "18px", // Slightly larger description font
                  color: "#f0f0f0", // Off-white for description
                  maxWidth: 700, // Wider max-width for description
                  margin: "0 auto 10px", // More margin below description
                  lineHeight: 1.6, // Better line spacing
                }}
              >
                {event.description}
              </Paragraph>
              <div
                style={{ textAlign: "center", marginTop: 10, marginBottom: 10 }}
              >
                <Tag
                  color={primaryColor} // Use primary color for the tag background
                  style={{
                    padding: "10px 20px", // Larger padding for the tag
                    fontSize: "18px", // Larger font size for the tag
                    borderRadius: 25, // More rounded, pill-like tag
                    fontWeight: "semibold",
                    letterSpacing: "0.5px", // Slight letter spacing for appeal
                    backgroundColor: primaryColor, // Ensure solid primary color background
                    color: "#fff", // White text for contrast
                    border: "none", // Remove default tag border
                  }}
                >
                  Table Number:{" "}
                  <span style={{ fontWeight: "bold" }}>{number}</span>{" "}
                  {/* Even bolder */}
                </Tag>
                <Paragraph
                  style={{ marginTop: 10, color: "#e0e0e0", fontSize: "15px" }} // Slightly lighter for event duration
                >
                  Event Duration:{" "}
                  <strong>{new Date(event.startDate).toLocaleString()}</strong>{" "}
                  – <strong>{new Date(event.endDate).toLocaleString()}</strong>
                </Paragraph>
              </div>
            </div>
          </Card>

          {/* Menu Items Card */}
          <div className="bg-white rounded-xl lg:shadow-lg mb-6 p-2  lg:p-8">
            <h3
              className={`text-2xl sm:text-3xl font-semibold !instrument-sans text-[#1EAEDB]  mb-5 flex items-center`}
            >
              {/* MenuOutlined SVG */}
              <svg
                className="w-7 h-7 mr-3 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
              Our Delicious Menu
            </h3>
            {menuItems.length === 0 ? (
              <p className="text-gray-600 text-center py-5">
                No menu items available for this event yet. Please check back
                later!
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-6">
                {menuItems.map((item) => (
                  <Card
                    key={item.id}
                    hoverable
                    // Adjusted Ant Design Card styling for a more modern, eye-catching look
                    style={{
                      borderRadius: 12, // Slightly more rounded corners
                      overflow: "hidden",
                      height: "100%", // Ensures consistent height in a grid
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // Subtle shadow for depth
                      transition: "box-shadow 0.3s ease", // Smooth shadow transition on hover
                    }}
                    headStyle={{
                      backgroundColor: "#fff", // White background for the header
                      borderBottom: "1px solid #f0f0f0", // Lighter border
                      padding: "10px 12px", // More generous padding
                      minHeight: "auto", // Prevent fixed height if title wraps
                      display: "flex", // Enable flex for proper alignment in header
                      alignItems: "center", // Vertically center title and extra
                      justifyContent: "space-between", // Space out title and extra
                    }}
                    bodyStyle={{
                      padding: "20px", // More generous padding for body content
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                    cover={
                      // Display image using the 'cover' prop
                      item.photo ? (
                        <Image
                          alt={item.name}
                          src={item.photo}
                          style={{
                            width: "100%",
                            height: "150px", // Keep image height consistent
                            objectFit: "cover",
                            borderBottom: "1px solid #eee", // Subtle border below image
                          }}
                          preview={{
                            // Enable AntD Image preview capabilities
                            mask: (
                              <Space className="bg-black bg-opacity-50 text-white p-2 rounded">
                                {" "}
                                {/* Styled mask */}
                                <ShoppingCartOutlined /> Preview
                              </Space>
                            ),
                          }}
                        />
                      ) : (
                        // Fallback if no image URL
                        <div
                          style={{
                            height: "150px",
                            background: "#f8f8f8", // Lighter fallback background
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#bdbdbd", // Softer grey for icons/text
                            flexDirection: "column",
                            borderBottom: "1px solid #eee", // Consistent border for fallback
                          }}
                        >
                          <PictureOutlined style={{ fontSize: "56px" }} />{" "}
                          {/* Larger icon */}
                          <Text
                            type="secondary"
                            style={{ marginTop: 8, fontSize: "14px" }}
                          >
                            No Image Available
                          </Text>
                        </div>
                      )
                    }
                    title={
                      <span
                        className="!instrument-sans"
                        style={{
                          color: primaryColor,
                          //fontWeight: "700", // Bolder font weight
                          fontSize: "1.2em", // Slightly larger title
                          lineHeight: "1.3", // Better line spacing for potential multi-line titles
                        }}
                      >
                        {item.name}
                      </span>
                    }
                    extra={
                      <Space size={[4, 4]}>
                        {" "}
                        {/* Tighter spacing between tags */}
                        {item.tag && (
                          <Tag
                            color={item.tag === "Veg" ? "green" : "red"}
                            style={{
                              fontSize: "12px",
                              padding: "4px 8px",
                              borderRadius: 4,
                            }} // More prominent tag styling
                          >
                            {item.tag}
                          </Tag>
                        )}
                        {item.recTag && (
                          <Tag
                            style={{
                              backgroundColor: primaryColor, // Use primary color for recommended tag background
                              color: "#fff", // White text for contrast
                              fontSize: "12px",
                              padding: "4px 8px",
                              borderRadius: 4,
                              fontWeight: "600", // Make recommended tag text bolder
                            }}
                          >
                            {item.recTag}
                          </Tag>
                        )}
                      </Space>
                    }
                  >
                    <div>
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }} // Limit description to 2 lines for cleaner look
                        style={{
                          minHeight: "30px", // Ensure consistent height even for short descriptions
                          fontSize: "15px", // Slightly larger font for readability
                          lineHeight: "1.4", // Improved line spacing
                          marginBottom: 10,
                          color: "#666", // Softer grey for description
                        }}
                      >
                        {item.description ||
                          "No description available for this item."}
                      </Paragraph>

                      {/* Price Display: Un-comment if you want to show price here */}
                      {/* <Paragraph strong style={{ color: primaryColor, fontSize: '1.2em', marginBottom: 16, textAlign: 'right' }}>
      Price: ₹{item.price ? item.price.toFixed(2) : 'N/A'}
    </Paragraph> */}
                    </div>
                    <Space
                      direction="horizontal"
                      align="center"
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                        marginTop: "auto",
                        paddingTop: "10px", // Add some padding above action items
                        borderTop: "1px solid #f0f0f0", // Subtle top border
                      }}
                    >
                      <InputNumber
                        min={1}
                        value={quantities[item.id] || 1}
                        onChange={(val) => onQtyChange(item.id, val)}
                        style={{ width: 80, fontSize: "16px" }} // Slightly wider input, larger font
                        aria-label={`Quantity for ${item.name}`}
                        size="small" // Use Ant Design's large size for input for better touch targets
                      />
                      <Button
                        type="primary"
                        onClick={() => addToCart(item)}
                        style={{
                          backgroundColor: primaryColor,
                          borderColor: primaryColor,
                          height: "28px", // Consistent button height
                          fontSize: "16px", // Larger font for button text
                          padding: "0 20px", // More horizontal padding
                          borderRadius: 6, // Slightly more rounded button
                        }}
                        icon={<PlusOutlined />}
                        size="small" // Use Ant Design's large size for button
                      >
                        Add
                      </Button>
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {isMobileView ? (
            <>
              {/* --- MODIFIED CONDITION FOR "VIEW CART" BUTTON --- */}
              {cart.length > 0 && !isCartDrawerVisible && (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "calc(100% - 40px)",
                    maxWidth: "350px",
                    zIndex: 1050,
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                    height: "50px",
                    fontSize: "17px",
                    fontWeight: "bold",
                    boxShadow: `0 6px 15px rgba(${hexToRgb(
                      primaryColor
                    )}, 0.45)`,
                    borderRadius: "25px",
                  }}
                  onClick={() => setCartDrawerVisible(true)}
                >
                  {/* Restored cart total in button text */}
                  View Cart ({cart.length})
                </Button>
              )}
              <Drawer
                title={
                  <Title
                    level={4}
                    style={{ color: primaryColor, margin: 0, paddingTop: 10 }}
                  >
                    <ShoppingCartOutlined style={{ marginRight: 10 }} />
                    Your Order Cart
                  </Title>
                }
                placement="bottom"
                closable={true}
                onClose={() => setCartDrawerVisible(false)}
                open={isCartDrawerVisible}
                height="auto"
                style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                bodyStyle={{ padding: "20px", paddingBottom: "30px" }} // Ensure enough padding at bottom
                destroyOnClose // To reset scroll and state if any within drawer
                zIndex={1000}
              >
                {cart.length === 0 ? (
                  <Paragraph
                    type="secondary"
                    style={{ textAlign: "center", padding: "20px 0" }}
                  >
                    Your cart is currently empty.
                  </Paragraph>
                ) : (
                  <CartContents
                    cart={cart}
                    onPlaceOrder={placeOrder}
                    isMobile={true}
                    updateCartItemQuantity={updateCartItemQuantity}
                    // cartTotal={cartTotal} // Pass cartTotal
                  />
                )}
              </Drawer>
            </>
          ) : (
            <Card // Desktop cart view
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                padding: "20px 0",
                marginBottom: 24,
              }}
              bodyStyle={{ padding: "0 24px" }}
            >
              <Title
                level={3}
                style={{ color: primaryColor, marginBottom: 20 }}
              >
                <ShoppingCartOutlined style={{ marginRight: 10 }} />
                Your Order Cart
              </Title>
              {cart.length === 0 ? (
                <Paragraph
                  type="secondary"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Your cart is currently empty. Start by adding some delicious
                  items from the menu above!
                </Paragraph>
              ) : (
                <CartContents
                  cart={cart}
                  onPlaceOrder={placeOrder}
                  isMobile={false}
                  updateCartItemQuantity={updateCartItemQuantity}
                  // cartTotal={cartTotal} // Pass cartTotal
                />
              )}
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
