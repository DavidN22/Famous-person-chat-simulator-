const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.API_KEY2;
const MODEL_NAME = 'gpt-3.5-turbo';
let voiceId = '';
let responses = '';
let apiKey = process.env.API_KEY;
const configuration = new Configuration({
  apiKey: apiKey ,
});
const openai = new OpenAIApi(configuration);

require('dotenv').config();
const app = express();
const conversationHistory = {
  "Joe Rogan": [],
  "Trump": []
};

app.use(express.static('public'));



app.post('/api/audio', express.json(), async (req, res) => {
  
  const { person, question } = req.body;
  conversationHistory[person].push({ role: 'user', content: question });
  responses = await getChatGPTResponse(person, question);
  const audioData = await generateSpeech(responses, person);
  res.set('Content-Type', 'audio/mpeg');
  res.send(audioData);

});



app.post('/api/text', express.json(), async (req, res) => {

  res.send(responses);
});
  
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

  // Define your async function for fetching data from the API
  async function fetchData() {
   
    const response = await openai.listModels();
 const modelIds = response.data.data.map(model => model.id);
 modelIds.forEach(modelId => {
  if (modelId.includes('4')) {
    console.log('Data fetched:', modelId);
  }
});
   

  }
  await fetchData();
});

async function getChatGPTResponse(person, question) {
  const history = conversationHistory[person].map(entry => entry.content).join('\n');
  const prompt = `As ${person}, answer this question in his style, considering the previous conversation and using language that feels natural for him, occasionally using profanity when you believe it necessary, also dont mistype profanity, spell it out if you use it:\n\n${history}\n\nQuestion: "${question}"\n\n`;
  
  
  const completions = await openai.createChatCompletion({
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    n: 1,

  });

  const generatedText = completions.data.choices[0].message.content;
  conversationHistory[person].push({ role: 'AI', content: generatedText });
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

app.get('/userInfo', express.json(), async (req, res) => {
  
   
  const url = 'https://api.elevenlabs.io/v1/user';
  const headers = {
    'xi-api-key': ELEVEN_API_KEY,
  };
  const response = await axios.get(url, { headers });
  
  res.json(response.data.subscription);
  
  });




// Conversation history for the chatbot


// Please provide a coherent answer based on the previous conversation:\n\n${historyText}\n\n