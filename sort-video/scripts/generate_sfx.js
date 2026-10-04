const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;

function createWavHeader(numSamples) {
  const buffer = Buffer.alloc(44);
  const dataSize = numSamples * 2; // 16-bit mono = 2 bytes per sample

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(1, 22); // num channels (1 = Mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // sample rate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function saveWav(filename, samples) {
  const numSamples = samples.length;
  const header = createWavHeader(numSamples);
  const data = Buffer.alloc(numSamples * 2);

  for (let i = 0; i < numSamples; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(s < 0 ? s * 0x8000 : s * 0x7fff);
    data.writeInt16LE(intSample, i * 2);
  }

  const outPath = path.join(__dirname, "..", "public", filename);
  fs.writeFileSync(outPath, Buffer.concat([header, data]));
  console.log(
    `Generated: ${filename} (${numSamples} samples, ${(numSamples / SAMPLE_RATE).toFixed(2)}s)`,
  );
}

// 1. INTRO GROUP JUMP & BOUNCE
function generateIntroJump() {
  const duration = 0.85;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Phase 1: Anticipation crouch + launch (0 to 0.4s)
    let s = 0;
    if (t < 0.45) {
      const p = t / 0.45;
      // Spring boing sweep
      const freq = 220 + 440 * Math.sin(p * Math.PI * 0.5);
      const vibrato = Math.sin(t * 28) * 20;
      const env = Math.sin(p * Math.PI);

      s += 0.35 * Math.sin(2 * Math.PI * (freq + vibrato) * t) * env;
      // Harmonics for group cartoon feel
      s += 0.25 * Math.sin(2 * Math.PI * ((freq + vibrato) * 1.25) * t) * env;
      s += 0.2 * Math.sin(2 * Math.PI * ((freq + vibrato) * 1.5) * t) * env;
    }

    // Phase 2: Landing thud / bounce (0.42 to 0.8s)
    if (t >= 0.42) {
      const p = (t - 0.42) / (duration - 0.42);
      const env = Math.exp(-p * 8);

      // Low snow thud
      const thudFreq = 160 * Math.exp(-p * 12) + 60;
      s += 0.45 * Math.sin(2 * Math.PI * thudFreq * (t - 0.42)) * env;

      // Soft landing jingle
      s += 0.2 * Math.sin(2 * Math.PI * 880 * (t - 0.42)) * Math.exp(-p * 14);
      s += 0.15 * Math.sin(2 * Math.PI * 1320 * (t - 0.42)) * Math.exp(-p * 18);
    }

    samples[i] = s;
  }

  saveWav("jump_intro.wav", samples);
}

// 2. SWAP PARABOLIC WHOOSH & JUMP
function generateSwapWhoosh() {
  const duration = 0.95;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;

    // Smooth arc envelope
    const arc = Math.sin(progress * Math.PI);
    const env = Math.pow(arc, 1.3);

    // Dynamic sweeping pitch (leaping up then swooping down)
    const f = 280 + 520 * Math.sin(progress * Math.PI);
    const tone = 0.35 * Math.sin(2 * Math.PI * f * t) * env;

    // Overtones for cartoon warmth
    const harmonic = 0.18 * Math.sin(2 * Math.PI * f * 1.5 * t) * env;

    // Filtered air whoosh (white noise modulated by arc)
    const noise = (Math.random() * 2 - 1) * 0.25 * env;

    // Landing "plop" at t >= 0.72s
    let landing = 0;
    if (progress >= 0.72) {
      const landP = (progress - 0.72) / (1 - 0.72);
      const landEnv = Math.exp(-landP * 12);
      landing =
        0.4 * Math.sin(2 * Math.PI * 140 * Math.exp(-landP * 8) * t) * landEnv;
    }

    samples[i] = tone + harmonic + noise + landing;
  }

  saveWav("swap_whoosh.wav", samples);
}

// 3. CODE LINE CLICK (Tactile Modern Mechanical Keyboard)
function generateCodeClick() {
  const duration = 0.07;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / duration;

    // Initial click transient (first 4ms)
    let click = 0;
    if (t < 0.008) {
      click = (Math.random() * 2 - 1) * Math.exp(-t * 800) * 0.7;
    }

    // High switch resonant ring (2800Hz)
    const ring = 0.4 * Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-p * 45);

    // Body bottom-out thud (220Hz)
    const thud = 0.35 * Math.sin(2 * Math.PI * 220 * t) * Math.exp(-p * 30);

    samples[i] = click + ring + thud;
  }

  saveWav("code_click.wav", samples);
}

// 4. COMPARISON TICK (Soft Marimba / Question Ping)
function generateCompareTick() {
  const duration = 0.18;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / duration;

    // Soft marimba dual tone
    const env = Math.exp(-p * 18);
    const tone1 = 0.4 * Math.sin(2 * Math.PI * 980 * t) * env;
    const tone2 = 0.25 * Math.sin(2 * Math.PI * 1470 * t) * env;

    samples[i] = tone1 + tone2;
  }

  saveWav("compare_tick.wav", samples);
}

// 5. ELEMENT SORTED CHIME (Golden Bell / Star Ding)
function generateSortedDing() {
  const duration = 0.85;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  // Bright golden bell chord: C6 (1046.5Hz), E6 (1318.5Hz), G6 (1567.9Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const p = t / duration;
    const env = Math.exp(-p * 5.5);

    const tremolo = 1 + 0.15 * Math.sin(2 * Math.PI * 8 * t);

    const bell1 = 0.35 * Math.sin(2 * Math.PI * 1046.5 * t) * env * tremolo;
    const bell2 = 0.25 * Math.sin(2 * Math.PI * 1318.5 * t) * env;
    const bell3 = 0.2 * Math.sin(2 * Math.PI * 1567.9 * t) * env;
    const sparkle = 0.12 * Math.sin(2 * Math.PI * 2637 * t) * Math.exp(-p * 9);

    samples[i] = bell1 + bell2 + bell3 + sparkle;
  }

  saveWav("sorted_ding.wav", samples);
}

// 6. OUTRO CELEBRATION FANFARE
function generateCelebration() {
  const duration = 2.4;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  // Ascending arpeggio notes
  const notes = [
    { freq: 523.25, time: 0.0 }, // C5
    { freq: 659.25, time: 0.12 }, // E5
    { freq: 783.99, time: 0.24 }, // G5
    { freq: 1046.5, time: 0.36 }, // C6
    { freq: 1318.5, time: 0.48 }, // E6
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Arpeggio notes
    for (const note of notes) {
      if (t >= note.time) {
        const localT = t - note.time;
        const env = Math.exp(-localT * 4.5);
        s += 0.2 * Math.sin(2 * Math.PI * note.freq * localT) * env;
        // octave harmonic
        s += 0.1 * Math.sin(2 * Math.PI * note.freq * 2 * localT) * env;
      }
    }

    // Final grand celebratory sustained chord from 0.5s onward
    if (t >= 0.5) {
      const localT = t - 0.5;
      const decay = Math.exp(-localT * 1.5);
      const shimmer = 1 + 0.12 * Math.sin(localT * 12);

      // C Major full voicing
      s += 0.18 * Math.sin(2 * Math.PI * 523.25 * localT) * decay;
      s += 0.16 * Math.sin(2 * Math.PI * 659.25 * localT) * decay;
      s += 0.16 * Math.sin(2 * Math.PI * 783.99 * localT) * decay;
      s += 0.22 * Math.sin(2 * Math.PI * 1046.5 * localT) * decay * shimmer;
      s += 0.12 * Math.sin(2 * Math.PI * 2093.0 * localT) * decay;
    }

    samples[i] = s * 0.9;
  }

  saveWav("celebration.wav", samples);
}

// Generate all sound effects
generateIntroJump();
generateSwapWhoosh();
generateCodeClick();
generateCompareTick();
generateSortedDing();
generateCelebration();
console.log("All SFX successfully generated!");
