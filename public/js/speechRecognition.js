const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;

export function initializeSpeechRecognition(userInput, toggleButton, sendButton) {
  toggleButton.addEventListener('click', () => {
    toggleSpeechRecognition(toggleButton);
  });

  sendButton.addEventListener('click', () => {
    if (isListening) {
      toggleSpeechRecognition(toggleButton);
    }
  });

  recognition.addEventListener('result', (event) => {
    const text = event.results[0][0].transcript;
    if (userInput.value.length > 0) {
      userInput.value += ' ' + text;
    } else {
      userInput.value = text;
    }
  });

  recognition.addEventListener('end', () => {
    if (isListening) {
      toggleSpeechRecognition();
    }
  });

  recognition.addEventListener('error', (event) => {
    console.error('Error in speech recognition:', event.error);
  });
}

let isListening = false;

function toggleSpeechRecognition(toggleButton) {
  if (!isListening) {
    recognition.start();
    toggleButton.classList.add('microphone-on');
  } else {
    recognition.stop();
    toggleButton.classList.remove('microphone-on');
  }
  isListening = !isListening;
}
