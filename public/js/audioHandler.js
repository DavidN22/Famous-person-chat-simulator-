let currentAudio;
let muteState = false;
// This function handles the mute button click. It is used in the public\js\audioHandler.js file.
export function createMuteButton(audioUrl) {
  const muteButton = document.createElement('button');
  muteButton.classList.add('mute-button');
  muteButton.textContent = muteState ? '🔈' : '🔊';
  muteButton.dataset.audioUrl = audioUrl;
  muteButton.addEventListener('click', handleMuteButtonClick);
  return muteButton;
}
// This function handles the replay button click. It is used in the public\js\audioHandler.js file.
export function createReplayButton(audioUrl) {
  const replayButton = document.createElement('button');
  replayButton.classList.add('replay-button');
  replayButton.textContent = '↺';
  replayButton.dataset.audioUrl = audioUrl;
  replayButton.addEventListener('click', handleReplayButtonClick);
  return replayButton;
}
// This function processes the audio response. It is used in the public\js\audioHandler.js file.
export async function processAudioResponse(audioResponse) {
  const audioBlob = await audioResponse.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  return audioUrl;
}
// This function plays the audio response. It is used in the public\js\audioHandler.js file.
export function playAIResponseAudio(audioUrl) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(audioUrl);
  currentAudio.muted = muteState;
  currentAudio.play();
}
// This function stops the audio response. It is used in the public\js\audioHandler.js file.
export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}
// This function handles the mute button click. It is used in the public\js\audioHandler.js file.
export function handleMuteButtonClick(e) {
  const button = e.target;
  const audioUrl = button.dataset.audioUrl;
// This if statement handles the mute button click.
  if (!currentAudio || currentAudio.src !== audioUrl) {
    playAIResponseAudio(audioUrl);
  }

  muteState = !muteState;
  currentAudio.muted = muteState;
  button.textContent = muteState ? '🔈' : '🔊';
}

// This function handles the replay button click. It is used in the public\js\audioHandler.js file.
export function handleReplayButtonClick(e) {
  const button = e.target;
  const audioUrl = button.dataset.audioUrl;
// This if statement handles the replay button click.
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  playAIResponseAudio(audioUrl);
}
// This function exports the muteState variable. To see if the mute button is clicked or not.
export { muteState };
