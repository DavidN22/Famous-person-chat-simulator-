import { handleFamousPersonSelect } from './script.js';
import { addVoiceButton } from './fourmUpload.js';
export function createVoiceButton(voiceName) {
    // Add the new person to the conversationHistory object
  
    const voiceButton = document.createElement('div');
    voiceButton.classList.add('famousPerson-select-item');
    voiceButton.setAttribute('data-name', voiceName);

    const img = document.createElement('img');
    img.src = 'js/add_placeholder.png'; // Set the default image source here
    img.alt = voiceName;
    img.addEventListener('click', (event) => handleChangeImage(event, voiceButton));

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = '&times;';
    deleteButton.addEventListener('click', (e) => handleDeleteButtonClick(e, voiceButton));
  
    voiceButton.appendChild(deleteButton);  
    voiceButton.appendChild(img);
    voiceButton.appendChild(document.createTextNode(voiceName));
  
  
    voiceButton.addEventListener('click', () => handleFamousPersonSelect(voiceButton));
  
    const famousPersonSelectContainer = document.querySelector('.famousPerson-select-container');
    famousPersonSelectContainer.insertBefore(voiceButton, addVoiceButton);
  }
  
  function handleChangeImage(event, voiceButton) {
    event.stopPropagation(); // Prevent triggering the voiceButton click event
  
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
  
    input.addEventListener('change', () => {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = voiceButton.querySelector('img');
          img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    });
  
    input.click(); 
  }

  export function handleDeleteButtonClick(event, voiceButton) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this voice?')) {
      voiceButton.remove();
      const option = document.createElement('option');
      const voiceName = voiceButton.getAttribute('data-name');
      option.text = voiceName;

      
    }
  }

