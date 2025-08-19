import React, { useEffect, useRef, useState } from 'react';
import Soundfont from 'soundfont-player';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs';
import { setupWebcam, detectFingersUp, midiNoteToFreq } from './utils';
import FingerVisualizer from './components/FingerVisualizer';

const SUSTAIN_TIME = 2000;

const App = () => {
  const pianoPlayer = useRef(null);
  const videoRef = useRef(null);
  const midiOutput = useRef(null);
  const prevState = useRef({ oneFinger: false, twoFingers: false, threeFingers: false, fourFingers: false });
  const audioCtx = useRef(null);
  const oscillators = useRef({});

  const [fingers, setFingers] = useState({ thumb: false, index: false, middle: false, ring: false, pinky: false });
  const [chordBubble, setChordBubble] = useState("");
  const [webcamError, setWebcamError] = useState("");

  const startAudioContext = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    } else if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  useEffect(() => {
    const init = async () => {
      // Load piano soundfont
      pianoPlayer.current = await Soundfont.instrument(new (window.AudioContext || window.webkitAudioContext)(), 'acoustic_grand_piano');
      try {
        await setupWebcam(videoRef.current);
      } catch (err) {
        setWebcamError("Unable to access camera. Please check browser permissions and hardware.");
        return;
      }
      const model = await handpose.load();

      try {
        const midiAccess = await navigator.requestMIDIAccess();
        const outputs = [...midiAccess.outputs.values()];
        if (outputs.length > 0) {
          midiOutput.current = outputs[0];
          console.log("✅ MIDI device connected:", midiOutput.current.name);
        } else {
          console.warn("⚠️ No MIDI device found. Using Web Audio.");
        }
      } catch {
        console.warn("Web MIDI not supported. Using Web Audio.");
      }

      const predict = async () => {
        const predictions = await model.estimateHands(videoRef.current, true);
        if (predictions.length > 0) {
          const landmarks = predictions[0].landmarks;
          const fingerStates = detectFingersUp(landmarks);
          setFingers(fingerStates);

          const numFingersUp = Object.values(fingerStates).filter(Boolean).length;

          if (numFingersUp === 1 && !prevState.current.oneFinger) {
            playChord([62, 66, 69], "D Major");
            prevState.current = { oneFinger: true, twoFingers: false, threeFingers: false, fourFingers: false };
          } else if (numFingersUp === 2 && !prevState.current.twoFingers) {
            playChord([59, 62, 66], "B Minor");
            prevState.current = { oneFinger: false, twoFingers: true, threeFingers: false, fourFingers: false };
          } else if (numFingersUp === 3 && !prevState.current.threeFingers) {
            playChord([55, 59, 62], "G Major");
            prevState.current = { oneFinger: false, twoFingers: false, threeFingers: true, fourFingers: false };
          } else if (numFingersUp === 4 && !prevState.current.fourFingers) {
            playChord([57, 61, 64], "A Major");
            prevState.current = { oneFinger: false, twoFingers: false, threeFingers: false, fourFingers: true };
          } else if (numFingersUp === 0) {
            prevState.current = { oneFinger: false, twoFingers: false, threeFingers: false, fourFingers: false };
          }
        } else {
          prevState.current = { oneFinger: false, twoFingers: false, threeFingers: false, fourFingers: false };
        }
        requestAnimationFrame(predict);
      };

      predict();
    };

    init();
  }, []);

  const playChord = (notes, chordName = "") => {
    if (midiOutput.current) {
      notes.forEach((note) => midiOutput.current.send([0x90, note, 127]));
    } else if (pianoPlayer.current) {
      notes.forEach((note) => pianoPlayer.current.play(note));
    } else {
      notes.forEach((note) => playTone(note));
    }

    if (chordName) {
      setChordBubble(chordName);
      setTimeout(() => setChordBubble(""), 1500);
    }
  };

  const playTone = (midiNote) => {
    if (!audioCtx.current) return;
    const freq = midiNoteToFreq(midiNote);
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.current.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    oscillators.current[midiNote] = { osc, gain };

    setTimeout(() => stopTone(midiNote), SUSTAIN_TIME);
  };

  const stopTone = (midiNote) => {
    const node = oscillators.current[midiNote];
    if (node) {
      node.gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.2);
      node.osc.stop(audioCtx.current.currentTime + 0.2);
      delete oscillators.current[midiNote];
    }
  };

  return (
    <div className="p-4 text-center relative">
      {webcamError && (
        <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">
          {webcamError}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-2">🎹 Air Piano</h1>
      <p className="mb-2">Use your hand to play chords with finger gestures.</p>

      <div className="mb-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={startAudioContext}>
          Start Piano
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded ml-2" onClick={() => { startAudioContext(); playTone(69); }}>
          Test A4 Note
        </button>
      </div>

      <video ref={videoRef} autoPlay playsInline width="640" height="480" className="mx-auto rounded-lg shadow-md mirror" />

      {chordBubble && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-6 py-2 rounded-full shadow-lg animate-bounce">
          🎵 {chordBubble} Played!
        </div>
      )}

      <FingerVisualizer fingers={fingers} />
    </div>
  );
};

export default App;