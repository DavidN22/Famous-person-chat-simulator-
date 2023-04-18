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
 


  
  return messageElement;
}
