const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

let isListening = false;

export function initializeSpeechRecognition(userInput, toggleButton) {
  if (recognition) {
    toggleButton.addEventListener('click', () => {
      toggleSpeechRecognition(userInput, toggleButton);
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
        toggleSpeechRecognition(userInput, toggleButton);
      }
    });

    recognition.addEventListener('error', (event) => {
      console.error('Error in speech recognition:', event.error);
    });
  }
}

function toggleSpeechRecognition(userInput, toggleButton) {
  if (recognition) {
    const micOnSound = document.getElementById('mic-on-sound');
    const micOn = document.getElementById('microphone-icon')

    if (!isListening) {
      recognition.start();

      toggleButton.classList.add('microphone-on');
      toggleButton.classList.add('microphone-icon-pressed')

      micOnSound.play();
    } else {
      recognition.stop();
      toggleButton.classList.remove('microphone-on');
      toggleButton.classList.remove('microphone-icon-pressed');
    }

    isListening = !isListening;
  }
}