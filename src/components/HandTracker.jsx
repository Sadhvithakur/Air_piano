import React, { useEffect, useRef, useState } from "react";
import * as handpose from "@tensorflow-models/handpose";
import * as tf from "@tensorflow/tfjs";
import WebMidi from "webmidi";
import { playTone, stopTone } from "../utils/audioUtils";

const HandTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [midiOutput, setMidiOutput] = useState(null);

  // 🎹 D Scale Chord Mapping
  const chords = {
    left: {
      thumb: [62, 66, 69],   // D Major (D, F#, A)
      index: [64, 67, 71],   // E Minor (E, G, B)
      middle: [67, 71, 74],  // G Major (G, B, D)
    },
    right: {
      thumb: [69, 73, 76],   // A Major (A, C#, E)
      index: [71, 74, 78],   // B Minor (B, D, F#)
      middle: [66, 69, 73],  // F# Minor (F#, A, C#)
    }
  };

  const prevStates = {
    left: { thumb: 0, index: 0, middle: 0 },
    right: { thumb: 0, index: 0, middle: 0 }
  };

  useEffect(() => {
    async function setupCamera() {
      const video = videoRef.current;
      video.width = 640;
      video.height = 480;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      video.srcObject = stream;
    }

    async function loadModel() {
      await tf.setBackend("webgl");
      return await handpose.load();
    }

    async function detectHands(model) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;

      async function detect() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
          drawHands(predictions, ctx);
          processHandData(predictions);
        }

        requestAnimationFrame(detect);
      }

      detect();
    }

    function drawHands(predictions, ctx) {
      predictions.forEach((hand) => {
        hand.landmarks.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        });
      });
    }

    function processHandData(predictions) {
      predictions.forEach((hand) => {
        const handType = hand.label === "Right" ? "right" : "left";
        const fingers = detectFingers(hand.landmarks);

        Object.keys(chords[handType]).forEach((finger, i) => {
          if (fingers[i] === 1 && prevStates[handType][finger] === 0) {
            playChord(chords[handType][finger]);
          }
          if (fingers[i] === 0 && prevStates[handType][finger] === 1) {
            setTimeout(() => stopChord(chords[handType][finger]), 2000);
          }
          prevStates[handType][finger] = fingers[i];
        });
      });
    }

    function detectFingers(landmarks) {
      return [
        landmarks[4][1] < landmarks[3][1] ? 1 : 0, // Thumb
        landmarks[8][1] < landmarks[6][1] ? 1 : 0, // Index
        landmarks[12][1] < landmarks[10][1] ? 1 : 0 // Middle
      ];
    }

    function playChord(notes) {
      if (midiOutput) {
        notes.forEach((note) => midiOutput.send([0x90, note, 127]));
      }
      // Play sound for each note
      notes.forEach((note) => playTone(note));
    }

    function stopChord(notes) {
      if (midiOutput) {
        notes.forEach((note) => midiOutput.send([0x80, note, 0]));
      }
      // Stop sound for each note
      notes.forEach((note) => stopTone(note));
    }

    async function init() {
      await setupCamera();
      const model = await loadModel();
      detectHands(model);
    }

    init();
  }, [midiOutput]);

  useEffect(() => {
    WebMidi.enable((err) => {
      if (err) {
        console.error("MIDI could not be enabled:", err);
      } else {
        const output = WebMidi.outputs[0];
        if (output) {
          setMidiOutput(output);
        } else {
          console.warn("No MIDI output device found!");
        }
      }
    });
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default HandTracker;
