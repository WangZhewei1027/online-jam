"use client";
import React, { useState, useRef } from "react";

const Debugger = ({ text }: { text: any }) => {
  const count = useRef(0);
  count.current += 1;

  return (
    <div className="absolute z-50 border -bottom-24 left-0">
      <p>Debugger</p>
      <p>Count: {count.current}</p>
      <p>{text}</p>
    </div>
  );
};

export default Debugger;
