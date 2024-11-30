"use client";

import { useState, useEffect } from "react";
import * as Tone from "tone";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const TransportControl = () => {
  const [bpm, setBpm] = useState(120); // 默认 BPM
  const [isPlaying, setIsPlaying] = useState(false); // Transport 状态
  const [position, setPosition] = useState("0:0:0"); // Transport 位置

  // 初始化 Tone.Transport 的配置
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm; // 设置 BPM

    // return () => {
    //   Tone.getTransport().stop(); // 清理，防止组件卸载后仍然运行
    // };
  }, [bpm]);

  // 实时更新 Transport 位置
  useEffect(() => {
    let animationFrameId: number | null = null;

    const updatePosition = () => {
      setPosition(Tone.getTransport().position.toString());
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updatePosition);
    } else {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  // 启动 Transport
  const handlePlay = async () => {
    await Tone.start(); // 解锁音频上下文
    Tone.getTransport().start();
    setIsPlaying(true);
  };

  // 停止 Transport
  const handleStop = () => {
    Tone.getTransport().stop();
    setIsPlaying(false);
  };

  return (
    <div className="p-4 border rounded-md shadow-md w-64 mx-auto backdrop-blur-sm">
      <h2 className="text-lg font-bold mb-4">Global Transport Control</h2>

      {/* 显示当前位置 */}
      <div className="mb-4 text-sm font-mono">Position: {position}</div>

      {/* Slider for BPM */}
      <div className="mb-4">
        <label htmlFor="bpm-slider" className="block text-sm font-medium mb-1">
          BPM: {bpm}
        </label>
        <Slider
          id="bpm-slider"
          min={60}
          max={240}
          step={1}
          value={[bpm]}
          onValueChange={(value) => setBpm(value[0])}
          className="mt-2"
        />
      </div>

      {/* Play/Stop Buttons */}
      <div className="flex gap-4">
        <Button
          variant="default"
          onClick={handlePlay}
          disabled={isPlaying}
          className="flex-1"
        >
          Play
        </Button>
        <Button
          variant="destructive"
          onClick={handleStop}
          disabled={!isPlaying}
          className="flex-1"
        >
          Stop
        </Button>
      </div>
    </div>
  );
};

export default TransportControl;
