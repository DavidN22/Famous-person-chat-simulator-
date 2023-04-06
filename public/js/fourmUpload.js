import { createVoiceButton} from './newUserHandler.js';

const addVoiceButton = document.getElementById('add-voice-button');
const addVoiceFormContainer = document.getElementById('add-voice-form-container');
const cancelAddVoiceButton = document.getElementById('cancel-add-voice');
const actionDropdown = document.getElementById('action-dropdown');
  const apiDropdown = document.getElementById('api-dropdown');
  const deleteDropdown = document.getElementById('delete-dropdown');
  let arr = ["Bella", "Antoni", "Elli", "Arnold", "Adam", "Sam","Domi"]


  function showUploadSection() {
    const uploadSection = document.getElementById('upload-section');
    const deleteSection = document.getElementById('delete-section');
    
    uploadSection.classList.remove('hidden');
    deleteSection.classList.add('hidden');
  }
  
  actionDropdown.addEventListener('change', function() {
    const uploadSection = document.getElementById('upload-section');
    const deleteSection = document.getElementById('delete-section');
    
    if (this.value === 'upload') {
      showUploadSection();
    } else if (this.value === 'delete') {
      deleteSection.classList.remove('hidden');
      uploadSection.classList.add('hidden');
    }
  });
  
  // Show the upload section by default when the page loads
  showUploadSection();

  function clearDropdownOptions(dropdown) {
    while (dropdown.options.length > 0) {
      dropdown.remove(0);
    }
  }

// Populate API voices dropdown
populateApiVoicesDropdown();
export async function populateApiVoicesDropdown() {
console.log('populating voices');

clearDropdownOptions(deleteDropdown);
clearDropdownOptions(apiDropdown);
  try {
    const response = await fetch('/api/voices');
    const data = await response.json();
    const voices = data.voices;

    for (let i = 0; i < voices.length; i++) {
      if (arr.includes(voices[i].name)) {
        continue;
      }
      const voice = voices[i];
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      option1.text = voice.name;
      option2.text = voice.name;
      option1.value = voice.voice_id; 
      option2.value = voice.voice_id;
      deleteDropdown.add(option1);
   apiDropdown.add(option2);
    }
  } catch (error) {
    console.error('Error fetching voices:', error);
  }
}

// send delete request
const deleteVoiceForm = document.getElementById('delete-voice-form');
deleteVoiceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const deleteDropdown = document.getElementById('delete-dropdown');
  const voiceName = deleteDropdown.options[deleteDropdown.selectedIndex].text;
  const voiceIds = deleteDropdown.options[deleteDropdown.selectedIndex].value;
  console.log(voiceName);
  console.log(voiceIds)
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voiceIds }),
    });
    if (response.ok) {

      await populateApiVoicesDropdown() 
      alert(voiceName +' deleted successfully!');
 
   
    } else {
      alert('Failed to delete the voice. Please try again.');
    }
  } catch (error) {
    console.error('Error deleting voice:', error);
    alert('Failed to delete the voice. Please try again.');
  }
});

addVoiceButton.addEventListener('click', () => {
  addVoiceFormContainer.classList.remove('hidden');
});

cancelAddVoiceButton.addEventListener('click', () => {
  addVoiceFormContainer.classList.add('hidden');
});


const uploadVoiceForm = document.getElementById('upload-voice-form');
 uploadVoiceForm.addEventListener('submit', async (e) => {
  addVoiceFormContainer.classList.add('hidden');
  e.preventDefault();

  
    const voiceName = document.getElementById('voice-name').value;
    const voiceFiles = document.getElementById('voice-file').files;

    if (!voiceName || !voiceFiles.length) {
      alert('Please provide a name and at least one audio file.');
      return;
    }

    const formData = new FormData();
    formData.append('name', voiceName);

    for (let i = 0; i < voiceFiles.length; i++) {
      formData.append('files', voiceFiles[i]);
    }

    try {
      const response = await fetch('/api/add-voice', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {

        await populateApiVoicesDropdown() 
          
        
      
        alert(voiceName +' added successfully!');
       
        createVoiceButton(voiceName);
      } else {
        alert('Failed to add the voice. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading voice:', error);
      alert('Failed to add the voice. Please try again.');
    }
  }
);


const importApiForm = document.getElementById('import-api-form');
importApiForm.addEventListener('submit', async (e) => {
  addVoiceFormContainer.classList.add('hidden');
  e.preventDefault();
 
  const selectedApiVoice = apiDropdown.options[apiDropdown.selectedIndex].text;
 
  alert(selectedApiVoice + " was added!")
  for (var i = 0; i < apiDropdown.options.length; i++) {
    if (apiDropdown.options[i].text === selectedApiVoice) {
      apiDropdown.remove(i);
    }
  }

  
  createVoiceButton(selectedApiVoice);
});



export {addVoiceButton};