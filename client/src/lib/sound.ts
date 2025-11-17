let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
  localStorage.setItem("shercoin-sound", enabled ? "1" : "0");
};

export const isSoundEnabled = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("shercoin-sound");
    return saved === null ? true : saved === "1";
  }
  return true;
};

export const playTapSound = () => {
  if (!isSoundEnabled()) return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

if (typeof window !== "undefined") {
  soundEnabled = isSoundEnabled();
}
