"use client";
import React from "react";
import { Handle, useHandleConnections, HandleProps } from "@xyflow/react";
import { useEffect } from "react";

interface TargetHandleProps extends HandleProps {
  label?: string; // label 是一个可选属性
}

const TargetHandle = ({ label, ...props }: TargetHandleProps) => {
  const connections = useHandleConnections({
    type: "target",
    id: props.id,
  });

  useEffect(() => {}, [connections]);

  return <Handle {...props} isConnectable={connections.length < 1} />;
};

export default TargetHandle;
