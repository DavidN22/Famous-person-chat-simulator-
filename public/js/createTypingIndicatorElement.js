export function createTypingIndicatorElement() {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', 'ai-message');
  
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
  
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      typingIndicator.appendChild(dot);
    }
  
    messageContainer.appendChild(typingIndicator);
  
    return messageContainer;
  }
  