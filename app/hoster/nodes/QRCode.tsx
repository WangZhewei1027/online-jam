"use client";
import { useEffect, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import { generateQRCode } from "@/app/utils"; // Ensure this import works correctly

function QRCode({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const [url, setUrl] = useState(""); // Holds the generated QR code URL

  useEffect(() => {
    // Async QR code generation inside useEffect
    async function init() {
      try {
        const tempUrl = window.location.href.replace("hoster", "audience");
        const qrUrl = await generateQRCode(tempUrl);
        setUrl(qrUrl); // Set the QR code URL in state
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    }
    init(); // Trigger QR code generation when the component mounts
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""} !p-0`}>
      {/* Display the QR Code */}
      {url ? (
        <img src={url} alt="QR Code" className="w-28 h-28 mx-auto rounded-sm" />
      ) : (
        <p>Loading QR Code...</p> // A fallback for when the QR code is loading
      )}

      <Handle type="target" position={Position.Left} />

      {/* Label for the QR Code */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default QRCode;
