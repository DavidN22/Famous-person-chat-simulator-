let currentAudio;
let muteState = false;

// This function processes the audio response. It is used in the public\js\audioHandler.js file.
export async function processAudioResponse(audioResponse) {
  const audioBlob = await audioResponse.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  return audioUrl;
}
// This function plays the audio response. It is used in the public\js\audioHandler.js file.
export function playAIResponseAudio(audioUrl, chatLog) {
  // Remove the previous audio player if it exists
  const previousAudioPlayer = chatLog.querySelector('audio');
  if (previousAudioPlayer) {
    previousAudioPlayer.pause();
    previousAudioPlayer.currentTime = 0;
    previousAudioPlayer.remove();
  }
  // Create an audio player with controls and append it to the chatLog
  const audioPlayer = document.createElement('audio');
  audioPlayer.controls = true;
  audioPlayer.src = audioUrl;
  audioPlayer.muted = muteState;

currentAudio = audioPlayer;
  return audioPlayer;
}



// This function stops the audio response. It is used in the public\js\audioHandler.js file.
export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}
export { muteState };
