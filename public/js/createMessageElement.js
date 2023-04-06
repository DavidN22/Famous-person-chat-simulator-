// createMessageElement.js
import { createMuteButton,createReplayButton } from './audioHandler.js';

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
    const muteButton = createMuteButton(audioUrl);
    const replayButton = createReplayButton(audioUrl);
    messageElement.appendChild(muteButton);
    messageElement.appendChild(replayButton);
  }

  return messageElement;
}
