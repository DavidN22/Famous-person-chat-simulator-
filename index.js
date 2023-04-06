const express = require('express');
const axios = require('axios');
require('dotenv').config();
const multer = require('multer');
const FormData = require('form-data');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.API_KEY2;
const MODEL_NAME = 'gpt-3.5-turbo';
let voiceId = '';
let responseSave = '';
let apiKey = process.env.API_KEY;
const configuration = new Configuration({
  apiKey: apiKey ,
});

const openai = new OpenAIApi(configuration);


const app = express();
const conversationHistory = {

};

app.use(express.static('public'));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  // Define your async function for fetching data from the API
} );


//////////////////////////////ROUTES/////////////////////////////////////

app.post('/api/audio', express.json(), async (req, res) =>{
  const { person, question, skipAudio } = req.body;

  if (!skipAudio) {
    // Check character limit only if skipAudio is false
    const validationResult = await checkCharacterLimit(req);
    if (validationResult === false) {
      return res.sendStatus(403);
    }
  }

  const responses = await getChatGPTResponse(person, question);
  responseSave = responses;
  if (skipAudio) {
    // If skipAudio is true, return the text response without generating audio
    res.send(responses);
  } else {
    // Generate audio and send it as a response
    const audioData = await generateSpeech(responses, person);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioData);
  }
});

app.post('/api/text', express.json(), async (req, res) => {
  res.send(responseSave);
});
app.get('/userInfo', express.json(), async (req,res) => {
  
   
  const url = 'https://api.elevenlabs.io/v1/user';
  const headers = {
    'xi-api-key': ELEVEN_API_KEY,
    
  };
  const response = await axios.get(url, { headers });
 

  res.json(response.data.subscription);
  
  });
  app.post('/api/add-voice', upload.array('files'), async (req, res) => {
    const voiceName = req.body.name;
    const voiceFiles = req.files;
  
    console.log('Received voice name:', voiceName);
    console.log('Received voice files:', voiceFiles);
  
    try {
      const formData = new FormData();
      formData.append('name', voiceName);
      voiceFiles.forEach((file) => {
        formData.append('files', Buffer.from(file.buffer), file.originalname);
      });
  
      const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', formData, {
        headers: {
          ...formData.getHeaders(),
          'xi-api-key': ELEVEN_API_KEY,
        },
      });
  
      if (response.status === 200) {
        res.status(200).send('Voice added successfully!');
      } else {
        console.error('Error response from ElevenLabs:', response);
        res.status(500).send('Failed to add the voice. Please try again.');
      }
    } catch (error) {
      console.error('Error processing voice:', error);
      res.status(500).send('Failed to add the voice. Please try again.');
    }
  });




  app.get('/api/voices', async (req, res) => {
    try {
      const voices = await getVoices();
      res.json({ voices });
    } catch (error) {
      console.error('Error fetching voices:', error);
      res.status(500).send('Failed to fetch voices. Please try again.');
    }
  });





//delete route elevenlabs
app.delete('/api/delete',  express.json(),async (req, res) => {
  const voiceId = req.body.voiceIds;
  console.log(voiceId);
  try {
    const response = await axios.delete(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      headers: {
        'xi-api-key': ELEVEN_API_KEY,
      },
    });
    if (response.status === 200) {
      res.status(200).send('Voice deleted successfully!');
    } else {
      console.error('Error response from ElevenLabs:', response);
      res.status(500).send('Failed to delete the voice. Please try again.');
    }
  } catch (error) {
    console.error('Error deleting voice:', error);
    res.status(500).send('Failed to delete the voice. Please try again.');
  }
});


  //chat functions


async function getChatGPTResponse(person, question) {
  if (!conversationHistory.hasOwnProperty(person)) {
    conversationHistory[person] = [];
  }
const history = conversationHistory[person].map(entry => entry.content).join('\n');
  const prompt = `As ${person}, answer this question in his style, considering the previous conversation and using language that feels natural for him, occasionally using profanity when you believe it necessary, also dont mistype profanity, spell it out if you use it:\n\n${history}\n\nQuestion: "${question}"\n\n`;
  
conversationHistory[person].push({ role: 'user', content: question });
  const completions = await openai.createChatCompletion({
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    n: 1,

  });
 
  const generatedText = completions.data.choices[0].message.content;
  conversationHistory[person].push({ role: 'AI', content: generatedText });

  console.log(conversationHistory);
  return generatedText;
}

async function generateSpeech(text, person) {
let voiceList = await getVoices();
for (let i = 0; i < voiceList.length; i++) {
  if (person.toLowerCase() === voiceList[i].name.toLowerCase()){
    voiceId = voiceList[i].voice_id;

}
}


  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
  const data = { text };
  const headers = {
    'Content-Type': 'application/json',
    'xi-api-key': ELEVEN_API_KEY,
  };

  const response = await axios.post(url, data, {
    headers,
    responseType: 'arraybuffer',
  });

  return response.data;
}

async function getVoices() {
  const url = 'https://api.elevenlabs.io/v1/voices';
  const headers = {
    'xi-api-key': ELEVEN_API_KEY,
  };
  const response = await axios.get(url, { headers });
    
  return response.data.voices;

}


async function checkCharacterLimit(req) {
  // Calculate the total character count after adding the new question
  const response = await axios.get('http://localhost:' + PORT + '/userInfo');
  const data = await response.data;
  const remainingCharacters = data.character_limit - data.character_count;
  return remainingCharacters < 2000;

}




  


// Conversation history for the chatbot

// Please provide a coherent answer based on the previous conversation:\n\n${historyText}\n\n