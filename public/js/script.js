import { playAIResponseAudio, stopAudio,processAudioResponse } from './audioHandler.js';
import { createMessageElement } from './createMessageElement.js';
import { createTypingIndicatorElement } from './createTypingIndicatorElement.js';
import { initializeSpeechRecognition } from './speechRecognition.js';
import './fourmUpload.js';
const famousPersonSelectItems = document.querySelectorAll('.famousPerson-select-item');
const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const chatLog = document.getElementById('chat-log');
const characterCountElement = document.getElementById('character-count');
const toggleButton = document.getElementById('microphone-button');
const searchbar = document.getElementById('searchbar');
const darkModeSwitch = document.getElementById('dark-mode-switch');
const darkModeText = document.querySelector('.dark-mode-text');
const audioToggleSwitch = document.getElementById('audio-toggle-switch');
const audioToggleText = document.querySelector('.switch-text');


/////////////////////////////////////////////////////////////////////////////
await get();
async function get() {
  const response = await fetch("/userInfo", {
    method: 'GET',
  });
  const data = await response.json();

  const remainingCharacters = data.character_limit - data.character_count;
  characterCountElement.innerHTML = `Remaining characters: ${remainingCharacters}`;
  return remainingCharacters;
}

/////////////////////////////////////////////////////////////////////////////

initializeSpeechRecognition(userInput, toggleButton);

/////////////////////////////////////////////////////////////////////////////

let currentFamousPerson = '';
export function handleFamousPersonSelect(item) {
  const selectedFamousPerson = item.dataset.name;

  if (selectedFamousPerson !== currentFamousPerson) {
    stopAudio();

    currentFamousPerson = selectedFamousPerson;

    const allFamousPersonItems = document.querySelectorAll('.famousPerson-select-item');
    allFamousPersonItems.forEach(item => item.classList.remove('famousPerson-selected'));

    item.classList.add('famousPerson-selected');

    const userMessage = createMessageElement(`You are now talking to ${currentFamousPerson}`, 'user', null, 'famousPerson-switch');
    addToChatLog(userMessage);
  }
}

famousPersonSelectItems.forEach(item => {
  item.addEventListener('click', () => handleFamousPersonSelect(item));
});

/////////////////////////////////////////////////////////////////////////////
submitButton.addEventListener('click', handleSubmit);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit();
  }
});


searchbar.addEventListener('input', filterFamousPersons);
function filterFamousPersons() {
  const searchText = searchbar.value.toLowerCase();
  const famousPersonButtons = document.querySelectorAll('.famousPerson-select-item');
  famousPersonButtons.forEach(button => {
    const buttonName = button.getAttribute('data-name').toLowerCase();
    if (buttonName.includes(searchText)) {
      button.style.display = 'flex';
    } else {
      button.style.display = 'none';
    }
  });
}




darkModeSwitch.addEventListener('change', toggleDarkMode);
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode');
  darkModeText.textContent = "Dark Mode: " + (darkModeSwitch.checked ? "On" : "Off");
}


audioToggleSwitch.addEventListener('change', toggleAudioModeText);
function toggleAudioModeText(){
  audioToggleText.textContent = "Text Only: " + (audioToggleSwitch.checked ? "On" : "Off");
}
/////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////
async function send(name, person, question,skipAudio) {
  const respond = await fetch(name, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person, question, skipAudio }),
  });

  if (respond.status === 403) {
 
    const r = createMessageElement("You have reached your character limit. Please upgrade to a premium account to continue using the service.","ai")
addToChatLog(r);
  }
  return respond;
}




/////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////
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

  // Change the button's style and content
  submitButton.innerHTML = `<div class="loader">Wait...</div>`;
  submitButton.classList.add('loading-button');
  submitButton.disabled = true;
  const typingIndicator = createTypingIndicatorElement();
  addToChatLog(typingIndicator);

  /////////////////////
  const skipAudio = audioToggleSwitch.checked;
  const response = await send('/api/audio', currentFamousPerson, question, skipAudio);
  let generatedText = '';
  let audioUrl = '';

 
  if (skipAudio) {
    const jsonResponse = await response.text();
    generatedText = jsonResponse;
   
  } 
   else{
     audioUrl = await processAudioResponse(response);
    playAIResponseAudio(audioUrl);
    const textResponse = await send('/api/text');
    generatedText = await textResponse.text();
   }
  /////////////////////

  const previousMuteButton = chatLog.querySelector('.mute-button');
  const prevousReplayButton = chatLog.querySelector('.replay-button');
  if (previousMuteButton) {
    previousMuteButton.remove();
    prevousReplayButton.remove();
  }

  typingIndicator.remove();

  let aiMessage = '';
  if (generatedText === 'You have reached your character limit. Please upgrade to a premium account to continue using the service.') {
    aiMessage = createMessageElement(generatedText, 'ai');
  } else {
    aiMessage = skipAudio
      ? createMessageElement(generatedText, 'ai')
      : createMessageElement(generatedText, 'ai', audioUrl);
      addToChatLog(aiMessage);
  } 
  console.log('Generated text:', generatedText, 'Audio URL:', audioUrl);




 
  await get();

  // Revert the button's style and content
  submitButton.innerHTML = "Send";
  submitButton.classList.remove('loading-button');
  submitButton.disabled = false;
}


/////////////////////////////////////////////////////////////////////////////
function addToChatLog(messageElement) {
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}
