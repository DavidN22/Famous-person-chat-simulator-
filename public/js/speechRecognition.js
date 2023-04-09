const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
// This function initializes the speech recognition. It is used in the public\js\script.js file.

export function initializeSpeechRecognition(userInput, toggleButton) {
  toggleButton.addEventListener('click', () => {
    toggleSpeechRecognition(userInput, toggleButton);
  });
// This event listener listens for the result event and adds the text to the user input.
  recognition.addEventListener('result', (event) => {
    const text = event.results[0][0].transcript;
    if (userInput.value.length > 0) {
      userInput.value += ' ' + text;
    } else {
      userInput.value = text;
    }
  });
// This event listener listens for the end event and toggles the speech recognition.
  recognition.addEventListener('end', () => {
    if (isListening) {
      toggleSpeechRecognition(userInput, toggleButton);
    }
  });
// This event listener listens for the error event and logs the error.
  recognition.addEventListener('error', (event) => {
    console.error('Error in speech recognition:', event.error);
  });
}


let isListening = false;
// This function toggles the speech recognition. It is used in the public\js\script.js file.
function toggleSpeechRecognition(userInput, toggleButton) {
  const micOnSound = document.getElementById('mic-on-sound');
  const micOn = document.getElementById('microphone-icon')
  // This if statement checks if the user input is empty. If it is empty, it will not toggle the speech recognition.
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
