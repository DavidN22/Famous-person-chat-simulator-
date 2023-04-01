import { playAIResponseAudio, stopAudio } from './audioHandler.js';
import { createMessageElement } from './createMessageElement.js';
import { createTypingIndicatorElement } from './createTypingIndicatorElement.js';
import { initializeSpeechRecognition } from './speechRecognition.js';
const famousPersonSelectItems = document.querySelectorAll('.famousPerson-select-item');
const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const chatLog = document.getElementById('chat-log');
const characterCountElement = document.getElementById('character-count');



const toggleButton = document.getElementById('microphone-button');


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.interimResults = false;

let isListening = false;

toggleButton.addEventListener('click', () => {
    if (!isListening) {
        recognition.start();
       
    } else {
        recognition.stop();
      
    }
    isListening = !isListening;
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
        recognition.start();
    }
});

recognition.addEventListener('error', (event) => {
    console.error('Error in speech recognition:', event.error);
});


initializeSpeechRecognition(userInput, toggleButton, submitButton);



let currentFamousPerson = '';

famousPersonSelectItems.forEach(item => {
  item.addEventListener('click', () => {
    const selectedFamousPerson = item.dataset.name;

    if (selectedFamousPerson !== currentFamousPerson) {
      stopAudio();

      currentFamousPerson = selectedFamousPerson;

      famousPersonSelectItems.forEach(item => item.classList.remove('selected'));
      item.classList.add('selected');

      const userMessage = createMessageElement(`You are now talking to ${currentFamousPerson}`, 'user', null, 'famousPerson-switch');
      addToChatLog(userMessage);
    }
  });
});

submitButton.addEventListener('click', handleSubmit);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleSubmit();
  }
});
await get();
async function get() {
  const response = await fetch("/userInfo", {
    method: 'GET',
  });
  const data = await response.json();

  const remainingCharacters = data.character_limit - data.character_count;
  characterCountElement.textContent = `Remaining characters: ${remainingCharacters}`;
  return remainingCharacters;
}





async function send(name, person, question) {
  const respond = await fetch(name, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person, question }),
  });
  return respond;
}

async function handleSubmit() {
  if (currentFamousPerson === '') {
    alert('Please select a famousPerson');
    return;
  }

  const question = userInput.value.trim();

  if (question === '') {
    alert('Please enter a question');
    return;
  }

  const userMessage = createMessageElement(question, 'user');
  addToChatLog(userMessage);

  userInput.value = '';

  // Create and show typing indicator
  const typingIndicator = createTypingIndicatorElement();
  addToChatLog(typingIndicator);

  const audioResponse = await send('/api/audio', currentFamousPerson, question);
  const audioBlob = await audioResponse.blob();
  const audioUrl = createAudioUrl(audioBlob);

  playAIResponseAudio(audioUrl);

  const previousMuteButton = chatLog.querySelector('.mute-button');
  if (previousMuteButton) {
    previousMuteButton.remove();
  }
  const textResponse = await send('/api/text');

  const generatedText = await textResponse.text();

  // Remove typing indicator
  typingIndicator.remove();

  const aiMessage = createMessageElement(generatedText, 'ai', audioUrl);
  addToChatLog(aiMessage);
  await get();
}

function addToChatLog(messageElement) {
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function createAudioUrl(audioBlob) {
  return URL.createObjectURL(audioBlob);
}

