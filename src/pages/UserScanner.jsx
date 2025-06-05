import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Typography, Card, Button, message, Spin } from 'antd';
import { QrcodeOutlined, LinkOutlined, ScanOutlined, ReloadOutlined } from '@ant-design/icons'; // Added ReloadOutlined
import { Link } from 'react-router-dom'; // Keep this if you use react-router-dom elsewhere, though Ant Design's Link is used for external links

const { Title, Paragraph, Text } = Typography;

export default function UserScanPage() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only proceed if scanning is true and the scanner isn't already active
    if (scanning && !scannerRunning) {
      const scanner = new Html5Qrcode("qr-reader");

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            setScanResult(decodedText);
            setScanning(false);
            message.success("QR Code scanned successfully!");
            // Stop the scanner only if it's currently running
            if (scannerRunning) {
              scanner.stop().then(() => scanner.clear()).catch(err => console.warn("Error stopping scanner after scan:", err.message));
              setScannerRunning(false);
            }
          },
          (errorMessage) => {
            // This callback is for scanning errors (e.g., no QR code detected).
            // We can ignore these for a smoother user experience unless it's a critical error.
          }
        )
        .then(() => {
          setScannerRunning(true);
          scannerRef.current = scanner;
        })
        .catch((err) => {
          console.error("Camera start error:", err);
          setError("Unable to access camera. Please allow permissions and refresh the page.");
          setScanning(false);
          setScannerRunning(false); // Ensure scannerRunning is false on error
        });
    }

    // Cleanup function: stop scanner when component unmounts or scanning stops
    return () => {
      if (scannerRef.current && scannerRunning) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
            scannerRef.current = null;
            setScannerRunning(false);
          })
          .catch((err) => {
            console.warn("Error stopping scanner during cleanup:", err.message);
          });
      }
    };
  }, [scanning, scannerRunning]); // Depend on scannerRunning to prevent multiple starts

  const handleNavigate = () => {
    if (scanResult) {
      // Safely open external link, ensuring it starts with http/https
      const url = scanResult.startsWith('http://') || scanResult.startsWith('https://')
        ? scanResult
        : `http://${scanResult}`; // Prepend http:// if missing

      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setError(null);
    setScanning(true);
    // If scanner was running, stop it to restart cleanly
    if (scannerRef.current && scannerRunning) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        scannerRef.current = null;
        setScannerRunning(false);
      }).catch(err => console.warn("Error stopping scanner for rescan:", err.message));
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-center font-sans">
      <Card className="rounded-2xl shadow-xl border border-blue-200 p-8 w-full max-w-md text-center bg-white transform transition-all duration-300 hover:shadow-2xl">
        <div className="mb-8">
          <QrcodeOutlined className="text-6xl text-indigo-500 mb-5 animate-bounce-slow" />
          <Title level={2} className="text-indigo-600 mb-3 font-extrabold tracking-tight">
            Scan QR Code
          </Title>
          <Paragraph className="text-gray-600 text-lg leading-relaxed">
            Quickly scan any QR code to access information or navigate to links.
          </Paragraph>
        </div>

        {scanning ? (
          <>
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden shadow-md border-2 border-indigo-300 relative"
              style={{ width: '100%', aspectRatio: '1/1' }} // Enforce square aspect ratio
            >
              {/* Optional: Add a scanning line animation for better visual feedback */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1 bg-green-400 opacity-75 rounded-full animate-scan-line"></div>
              </div>
            </div>

            {!error && (
              <div className="text-indigo-500 mt-5 flex items-center justify-center">
                <Spin size="small" className="mr-2" />
                <Text>Initializing camera...</Text>
              </div>
            )}
            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-lg mt-5 border border-red-200">
                <Text strong>{error}</Text>
              </div>
            )}
            <Button
              type="default"
              size="large"
              icon={<ReloadOutlined />}
              className="w-full mt-5 text-gray-700 border-gray-300 hover:border-gray-500 hover:text-gray-900 rounded-lg transition-all duration-200"
              onClick={handleRescan}
            >
              Cancel Scan / Rescan
            </Button>
          </>
        ) : !scanResult ? (
          <Button
            type="primary"
            size="large"
            icon={<ScanOutlined />}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
            onClick={() => {
              setError(null);
              setScanResult(null);
              setScanning(true);
            }}
          >
            Start QR Scan
          </Button>
        ) : (
          <div className="mt-6 text-left bg-gray-50 p-6 rounded-lg border border-gray-200">
            <Title level={5} className="text-gray-700 mb-3 font-semibold flex items-center">
              <QrcodeOutlined className="mr-2 text-indigo-500" /> Scanned Result:
            </Title>
            <a
              href={scanResult}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline break-all mb-5 text-base transition-colors duration-200"
            >
              {scanResult}
            </a>
            <div className="flex flex-col space-y-3">
              <Button
                type="primary"
                icon={<LinkOutlined />}
                className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200"
                onClick={handleNavigate}
              >
                Go to Link
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                className="w-full text-gray-700 border-gray-300 hover:border-gray-500 hover:text-gray-900 rounded-lg py-2.5 text-base font-medium transition-all duration-200"
                onClick={handleRescan}
              >
                Scan Another Code
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Tailwind CSS Custom Animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }

        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite linear alternate;
        }
      `}</style>
    </div>
  );
}