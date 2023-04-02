
let currentAudio;
let muteState = false;

export async function processAudioResponse(audioResponse) {
  const audioBlob = await audioResponse.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  return audioUrl;
}
export function playAIResponseAudio(audioUrl) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(audioUrl);
  currentAudio.muted = muteState;
  currentAudio.play();
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

export function handleMuteButtonClick(e) {
  const button = e.target;
  const audioUrl = button.dataset.audioUrl;

  if (!currentAudio || currentAudio.src !== audioUrl) {
    playAIResponseAudio(audioUrl);
  }

  muteState = !muteState;
  currentAudio.muted = muteState;
  button.textContent = muteState ? '🔈' : '🔊';
}

export { muteState };
