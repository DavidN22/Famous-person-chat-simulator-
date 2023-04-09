
// This function creates a typing indicator element and returns it. It is used in the
// public\js\script.js file to create a typing indicator element when the bot is typing.
export function createTypingIndicatorElement() {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'ai-message');
  
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
// This for loop creates three dots that are used to create the typing indicator.  
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingIndicator.appendChild(dot);
    }
  
    messageContainer.appendChild(typingIndicator);
  
    return messageContainer;
  }
  