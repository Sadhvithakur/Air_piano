// utils.js

export const setupWebcam = async (videoRef) => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Webcam not supported');
  }
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.srcObject = stream;
  return new Promise((resolve) => {
    videoRef.onloadedmetadata = () => {
      resolve();
    };
  });
};

// Detect if each finger is raised based on landmarks
export const detectFingersUp = (landmarks) => {
  const fingers = {
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false
  };

  // Tip landmarks (based on handpose model)
  const tips = {
    thumb: 4,
    index: 8,
    middle: 12,
    ring: 16,
    pinky: 20
  };

  // Base joints (lower joints)
  const bases = {
    thumb: 2,
    index: 5,
    middle: 9,
    ring: 13,
    pinky: 17
  };

  for (const finger in tips) {
    const tip = landmarks[tips[finger]];
    const base = landmarks[bases[finger]];

    if (finger === 'thumb') {
      // Thumb moves sideways => compare X
      fingers[finger] = tip[0] > base[0] + 20; // 20px threshold
    } else {
      // Other fingers move vertically => compare Y
      fingers[finger] = tip[1] < base[1] - 10; // 10px threshold
    }
  }

  return fingers;
};

// Convert MIDI note number to frequency (for Web Audio)
export const midiNoteToFreq = (note) => {
  return 440 * Math.pow(2, (note - 69) / 12);
};
