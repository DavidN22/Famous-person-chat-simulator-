let currentAudio;
let muteState = false;

export function createMuteButton(audioUrl) {
  const muteButton = document.createElement('button');
  muteButton.classList.add('mute-button');
  muteButton.textContent = muteState ? '🔈' : '🔊';
  muteButton.dataset.audioUrl = audioUrl;
  muteButton.addEventListener('click', handleMuteButtonClick);
  return muteButton;
}

export function createReplayButton(audioUrl) {
  const replayButton = document.createElement('button');
  replayButton.classList.add('replay-button');
  replayButton.textContent = '↺';
  replayButton.dataset.audioUrl = audioUrl;
  replayButton.addEventListener('click', handleReplayButtonClick);
  return replayButton;
}

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


export function handleReplayButtonClick(e) {
  const button = e.target;
  const audioUrl = button.dataset.audioUrl;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  playAIResponseAudio(audioUrl);
}

export { muteState };
