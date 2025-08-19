
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const sampleBuffers = {};
const activeSources = {};

// Map MIDI note numbers to sample file names (e.g., 60 = C4)
const noteToFile = {
  60: "C4.mp3",
  62: "D4.mp3",
  64: "E4.mp3",
  65: "F4.mp3",
  67: "G4.mp3",
  69: "A4.mp3",
  71: "B4.mp3",
  72: "C5.mp3"
};


async function loadSample(note) {
  if (sampleBuffers[note]) return sampleBuffers[note];
  const file = noteToFile[note];
  if (!file) return null;
  try {
    const response = await fetch(`/piano-samples/${file}`);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    sampleBuffers[note] = audioBuffer;
    return audioBuffer;
  } catch (e) {
    return null;
  }
}


export async function playTone(note) {
  const buffer = await loadSample(note);
  if (buffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
    activeSources[note] = source;
  } else {
    // Fallback: play synthesized sine wave
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    activeSources[note] = osc;
    // Stop after 1 second
    osc.stop(audioCtx.currentTime + 1);
    setTimeout(() => {
      if (activeSources[note] === osc) delete activeSources[note];
    }, 1100);
  }
}

export function stopTone(note) {
  const source = activeSources[note];
  if (source) {
    try {
      source.stop();
    } catch (e) { }
    delete activeSources[note];
  }
}
