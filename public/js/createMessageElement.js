// createMessageElement.js
import { handleMuteButtonClick, muteState } from './audioHandler.js';

export function createMessageElement(text, role, audioUrl, messageType = '') {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${role}-message`);

  // Apply custom styles for the 'famousPerson-switch' message
  if (messageType === 'famousPerson-switch') {
    messageElement.classList.add('famousPerson-switch-message');
  }

  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.textContent = text;
  messageElement.appendChild(messageText);

  if (role === 'ai' && audioUrl) {
    const muteButton = document.createElement('button');
    muteButton.classList.add('mute-button');
    muteButton.textContent = muteState ? '🔈' : '🔊';
    muteButton.dataset.audioUrl = audioUrl;
    muteButton.addEventListener('click', handleMuteButtonClick);
    messageElement.appendChild(muteButton);
  }

  return messageElement;
}
