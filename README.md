# 🎹 Air-Piano

Air-Piano is a browser-based virtual piano that lets you play music using **hand gestures** instead of a physical keyboard.  
It uses **Web MIDI API** to generate MIDI signals from gestures, routes them through a **virtual MIDI port** (loopMIDI), and produces realistic piano sound via **Sforzando** using the included `SalamanderGrandPianoV3.sfz` sample set.

---

## ✨ Features
- Play piano using just your **hand gestures** and a webcam.
- Uses **Web MIDI API** directly in the browser.
- Routes MIDI notes through **loopMIDI** into **Sforzando**.
- High-quality **Salamander Grand Piano** sampled instrument included (`.sfz`).
- Built with **React + Vite** for fast and modern development.

---

## 📦 Requirements
- [Node.js (LTS)](https://nodejs.org/en/download)  
- [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)  
- [Plogue Sforzando (64-bit)](https://www.plogue.com/products/sforzando.html)  

---

## ⚙️ Setup

### 1. Clone or Download
Download the repository ZIP and extract, or clone it:
```bash
git clone https://github.com/Rohaz-bhalla/Air-Piano.git
cd Air-Piano

2. Install Dependencies
npm install

3. Start Development Server
npm run dev

🎛️ Configure MIDI & Audio
A. loopMIDI

Install and open loopMIDI.

Click + to create a port (name it AirPiano).

Keep loopMIDI running in the background.

B. Sforzando

Install and open Sforzando (64-bit Standalone).

In MIDI Settings, enable Input: AirPiano (or whatever you named your loopMIDI port).

Drag SalamanderGrandPianoV3.sfz (from project root) into Sforzando.

Test by clicking Sforzando’s on-screen keys — you should hear piano sound.

▶️ Usage

Open the app in your browser.

Allow MIDI device access when prompted.

Start performing gestures in front of your webcam.

The app sends MIDI notes → loopMIDI → Sforzando → Piano sound output.

Pipeline:

Gestures → Browser (MIDI) → loopMIDI → Sforzando (.sfz) → Audio

🛠️ Build for Production
npm run build
npm run preview

❓ Troubleshooting

No sound:

Check Sforzando has the .sfz loaded.

Make sure MIDI In: AirPiano is enabled in Sforzando.

Verify loopMIDI is running.

Browser doesn’t show MIDI permission prompt:

Use Chrome/Edge.

Only works on localhost or HTTPS.

Laggy sound:

In Sforzando, use ASIO driver if available.

Lower buffer size (128–256).

📜 License

This project is open source.
Piano samples (SalamanderGrandPianoV3.sfz) are provided under their respective license.
