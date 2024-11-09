"use client";
import React, { useMemo } from "react";
import { Handle, HandleProps } from "@xyflow/react";
import { useStore } from "../utils/store"; // Import zustand store

interface TargetHandleProps extends HandleProps {
  label?: string;
}

const TargetHandle = ({ label, ...props }: TargetHandleProps) => {
  return <Handle {...props} type="target" />;
};

export default TargetHandle;
