"use client";

import React, { useState } from "react";
import QRCode from "qrcode";

const QRCodeComponent = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL

  const handleClick = async () => {
    const currentUrl = window.location.href; // Get the current webpage URL
    try {
      const qrCode = await QRCode.toDataURL(currentUrl); // Generate QR code as Data URL
      setQrCodeUrl(qrCode); // Set the generated QR code to the state
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
      >
        Generate QR Code
      </button>

      {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="mt-4" />}
    </div>
  );
};

export default QRCodeComponent;
