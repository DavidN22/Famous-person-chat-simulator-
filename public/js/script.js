import { playAIResponseAudio, stopAudio, processAudioResponse } from './audioHandler.js';
import { createMessageElement } from './createMessageElement.js';
import { createTypingIndicatorElement } from './createTypingIndicatorElement.js';
import { initializeSpeechRecognition } from './speechRecognition.js';

// DOM element selectors
const famousPersonSelectItems = document.querySelectorAll('.famousPerson-select-item');
const userInput = document.getElementById('user-input');
const submitButton = document.getElementById('submit-button');
const chatLog = document.getElementById('chat-log');
const characterCountElement = document.getElementById('character-count');
const toggleButton = document.getElementById('microphone-button');
const searchbar = document.getElementById('searchbar');
const searchbar2 = document.getElementById('searchbar2');
const darkModeSwitch = document.getElementById('dark-mode-switch');
const darkModeText = document.querySelector('.dark-mode-text');
const audioToggleSwitch = document.getElementById('audio-toggle-switch');
const audioToggleText = document.querySelector('.switch-text');
const clearChatButton = document.getElementById('clear-chat-button');
const characterCount = document.getElementById('character-counts');
const deleteButton = document.getElementById("delete-text-button");

searchbar.addEventListener('input', filterFamousPersonButtons);
if (searchbar2) {
searchbar2.addEventListener('input', filterFamousPersonButtons);
}

function filterFamousPersonButtons(event) {
  const searchText = event.target.value.toLowerCase();
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
document.addEventListener("DOMContentLoaded", function () {
  // Get the modal and the close button
  const disclaimerModal = document.getElementById("disclaimerModal");
  const closeButton = document.querySelector(".close");

  // Show the modal with a fade-in effect when the page loads
  disclaimerModal.style.display = "block";
  setTimeout(() => {
    disclaimerModal.style.opacity = 1;
  }, 100);

  // Close the modal with a fade-out effect when the close button is clicked
  closeButton.onclick = function () {
    disclaimerModal.style.opacity = 0;
    setTimeout(() => {
      disclaimerModal.style.display = "none";
    }, 500);
  };

  // Close the modal with a fade-out effect when the user clicks anywhere outside of the modal content
  window.onclick = function (event) {
    if (event.target == disclaimerModal) {
      disclaimerModal.style.opacity = 0;
      setTimeout(() => {
        disclaimerModal.style.display = "none";
      }, 500);
    }
  };
});


const navbarToggler = document.getElementById('navbar-toggler');
const famousPersonSelectContainerResponsive = document.getElementById('famousPerson-select-container-responsive');

navbarToggler.addEventListener('click', () => {
  famousPersonSelectContainerResponsive.classList.toggle('active');
});

// Update character count on user input
userInput.addEventListener('input', updateCharacterCount);

function updateCharacterCount() {
  const inputLength = userInput.value.length;

  if (inputLength > 500) {
    characterCount.textContent = '500/500';
    characterCount.classList.add('shake');

    // Remove shake class after 1 second
    setTimeout(() => {
      characterCount.classList.remove('shake');
    }, 1000);

    // Trim the input to the maximum allowed length
    userInput.value = userInput.value.slice(0, 500);
  } else {
    characterCount.textContent = `${inputLength}/500`;
  }
}

// Show or hide delete button depending on user input length
userInput.addEventListener("input", toggleDeleteButtonVisibility);

function toggleDeleteButtonVisibility() {
  if (userInput.value.length > 0) {
    deleteButton.classList.remove('hidden');
  } else {
    deleteButton.classList.add('hidden');
  }
}

// Clear user input when delete button is clicked
deleteButton.addEventListener("click", clearInput);

function clearInput() {
  userInput.value = "";
  characterCount.textContent = `0/500`;
  deleteButton.classList.add('hidden');
  userInput.focus();
}

// Clear chat log when clear chat button is clicked
clearChatButton.addEventListener('click', clearChat);

function clearChat() {
  if (confirm("Are you sure you want to clear the chat?")) {
    chatLog.innerHTML = '';
    chatLog.appendChild(clearChatButton);
  }
}

// Fetch user information and update remaining characters
await get();

async function get() {
  const response = await fetch("/userInfo", {
    method: 'GET',
  });
  const data = await response.json();

  const remainingCharacters = data.character_limit - data.character_count;
  if (remainingCharacters < 0) {
     characterCountElement.innerHTML = `Remaining characters: 0`;
  }
  else{
  characterCountElement.innerHTML = `Remaining characters: ${remainingCharacters}`;
  }
  return remainingCharacters;
}

// Initialize speech recognition
initializeSpeechRecognition(userInput, toggleButton);


// Variable to store the current famous person
let currentFamousPerson = '';

// Function to handle the selection of a famous person
export function handleFamousPersonSelect(item) {
  const selectedFamousPerson = item.dataset.name;

  // Check if the selected famous person is different from the current famous person
  if (selectedFamousPerson !== currentFamousPerson) {
    stopAudio();

    // Update the current famous person
    currentFamousPerson = selectedFamousPerson;

    // Deselect all famous person items
    const allFamousPersonItems = document.querySelectorAll('.famousPerson-select-item');
    allFamousPersonItems.forEach(item => item.classList.remove('famousPerson-selected'));

    // Select the clicked famous person item
    item.classList.add('famousPerson-selected');

    // Display a message in the chat log for the famous person switch
    const userMessage = createMessageElement(`You are now talking to ${currentFamousPerson}`, 'user', null, 'famousPerson-switch');
    addToChatLog(userMessage);
  }
}

// Attach the click event to each famous person select item
famousPersonSelectItems.forEach(item => {
  item.addEventListener('click', () => handleFamousPersonSelect(item));
});

// Attach the submit event to the submit button
submitButton.addEventListener('click', handleSubmit);

// Attach the keydown event to the user input field
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
});

// Attach the input event to the search bar for filtering famous person buttons


// Attach the change event to the dark mode switch
darkModeSwitch.addEventListener('change', toggleDarkMode);

// Function to toggle dark mode
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode');
  darkModeText.textContent = "Dark Mode: " + (darkModeSwitch.checked ? "On" : "Off");
}

// Attach the change event to the audio toggle switch
audioToggleSwitch.addEventListener('change', toggleAudioModeText);

// Function to toggle the text only mode
function toggleAudioModeText() {
  audioToggleText.textContent = "Text-Only: " + (audioToggleSwitch.checked ? "On" : "Off");
}

let r = '';
let hasReachedCharacterLimit = false;
// Function to send a request to the server
async function send(name, person, question, skipAudio) {
  const respond = await fetch(name, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person, question, skipAudio }),
  });

  // If the status code is 403, inform the user they have reached the character limit
  if (respond.status === 403) {
    hasReachedCharacterLimit = true;
    r = "You have reached your character limit. Please upgrade to a premium account to continue using the service, but the **Text Only** mode is still available.";


    const userMessage = createMessageElement(r, 'ai');
    addToChatLog(userMessage);
    return true;
  }
  return respond;
}

// Function to handle the submission of a user's question
async function handleSubmit() {
  deleteButton.classList.add('hidden');

  // Validate if a famous person is selected
  if (currentFamousPerson === '') {
    alert('Please select a famousPerson');
    return;
  }

  // Validate if a question is entered
  const question = userInput.value.trim();
  if (question === '') {
    alert('Please enter a question');
    return;
  }

  // Display the user's question in the chat log
  const userMessage = createMessageElement(question, 'user');
  addToChatLog(userMessage);

  // Reset user input and character count
  userInput.value = '';
  characterCount.textContent = `0/500`;

  // Show a loading state on the submit button
  submitButton.innerHTML = `<div class="loader">Wait...</div>`;
  submitButton.classList.add('loading-button');
  submitButton.disabled = true;

  // Display a typing indicator in the chat log
  const typingIndicator = createTypingIndicatorElement();
  addToChatLog(typingIndicator);

  // Send the user's question to the server and receive a response



  const skipAudio = audioToggleSwitch.checked;

  const response = await send('/api/audio', currentFamousPerson, question, skipAudio);

  let generatedText = '';
  let audioUrl = '';


  if (response === true) {
    typingIndicator.remove();
    resetloadingButton();
  }


  if (skipAudio) {

    const jsonResponse = await response.text();
    generatedText = jsonResponse;
 audioUrl = null;

  } else {

    audioUrl = await processAudioResponse(response);
  
    const textResponse = await send('/api/text');
    generatedText = await textResponse.text();

    audioUrl = playAIResponseAudio(audioUrl, chatLog);
  }



  // Remove the typing indicator
  typingIndicator.remove();

  // Display the AI's response in the chat log
  let aiMessage = '';

aiMessage =  createMessageElement(generatedText, 'ai')

//const audioPlayer = skipAudio ? null : playAIResponseAudio(audioUrl, chatLog);
addToChatLog(aiMessage, audioUrl);


  await get();
  resetloadingButton()
  userInput.focus();

}
// Function to handle the submission of a user's question
function addToChatLog(messageElement, audioElement = null) {
  chatLog.appendChild(messageElement);
  if (audioElement) {
    chatLog.appendChild(audioElement);
    
    audioElement.play();
  }
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Function to reset the loading state on the submit button
function resetloadingButton() {
  submitButton.innerHTML = "Send";
  submitButton.classList.remove('loading-button');
  submitButton.disabled = false;
}

