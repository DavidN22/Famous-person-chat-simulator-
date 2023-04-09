import { createMuteButton,createReplayButton } from './audioHandler.js';

// This function creates a message element and returns it. It is used in the
// public\js\script.js file to create a message element when the user or bot sends a message.

export function createMessageElement(text, role, audioUrl, messageType = '') {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', `${role}-message`);

 // This if statement adds a class to the message element if the message is a famous person switch message.
  if (messageType === 'famousPerson-switch') {
    messageElement.classList.add('famousPerson-switch-message');
    messageElement.classList.remove(`${role}-message`);
  }
  const messageText = document.createElement('div');
  messageText.classList.add('message-text');
  messageText.textContent = text;
  messageElement.appendChild(messageText);

// This if statement creates a mute button and a replay button if the message is from the bot.
  if (role === 'ai' && audioUrl) {
    const muteButton = createMuteButton(audioUrl);
    const replayButton = createReplayButton(audioUrl);
    messageElement.appendChild(muteButton);
    messageElement.appendChild(replayButton);
  }
 
  return messageElement;
}
