"use client";
import React, { useEffect, useRef } from "react";
import * as Tone from "tone";

const Oscilloscope = () => {
  useEffect(() => {
    // 创建一个振荡器
    const osc = new Tone.Oscillator("C4", "sine").start();

    // 创建一个包络
    const envelope = new Tone.AmplitudeEnvelope({
      attack: 0.1, // 攻击时间
      decay: 0.2, // 衰减时间
      sustain: 0.9, // 持续时间
      release: 1.5, // 释放时间
    }).toDestination();

    // 将振荡器连接到包络
    osc.connect(envelope);

    // 触发包络的开始和结束
    envelope.triggerAttackRelease("4n");
  }, []);
};

export default Oscilloscope;
