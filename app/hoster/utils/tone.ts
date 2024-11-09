import * as Tone from "tone";

// // 判断是否可以连接到 Destination 的节点类型
// export type ConnectableToDestination =
//   | Tone.ToneAudioNode
//   | AudioNode;

// 判断是否为控制信号的节点类型
export type ControlSignalNode = Tone.Envelope | Tone.Signal | Tone.LFO;

// 判断是否为音源节点
export type AudioSourceNode = Tone.Oscillator | Tone.Player | Tone.Noise;

// 功能性节点类型
export type FunctionalNode =
  | Tone.Gain
  | Tone.Filter
  | Tone.Panner
  | Tone.Compressor;

export function isAudioSourceNode(node: any): node is AudioSourceNode {
  return (
    node instanceof Tone.Oscillator ||
    node instanceof Tone.Player ||
    node instanceof Tone.Noise
  );
}

export function isControlSignalNode(node: any): node is ControlSignalNode {
  return (
    node instanceof Tone.Envelope ||
    node instanceof Tone.Signal ||
    node instanceof Tone.LFO
  );
}

export function isFunctionalNode(node: any): node is FunctionalNode {
  return (
    node instanceof Tone.Gain ||
    node instanceof Tone.Filter ||
    node instanceof Tone.Panner ||
    node instanceof Tone.Compressor
  );
}
