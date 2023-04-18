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
const nodemailer = require('nodemailer');
const openai = new OpenAIApi(configuration);
const app = express();
const conversationHistory = {

};

app.set('trust proxy', true);


app.use(express.static('public'));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}`);

} );



const ipCharacterCounts = {};
// POST request to handle audio
app.post('/api/audio', express.json(), async (req, res) => {
  const { person, question, skipAudio } = req.body;

  const ipAddress = req.ip;
  if (!ipCharacterCounts[ipAddress]) {
    ipCharacterCounts[ipAddress] = 0;
  }
  // If skipAudio is false, check character limit
  if (!skipAudio) {
    const validationResult = await checkCharacterLimit(req);
    if (validationResult === false) {
      return res.sendStatus(403);
    }
  }

  // Get the response from the ChatGPT
  const responses = await getChatGPTResponse(person, question);
  responseSave = responses;

  if (skipAudio) {
    // If skipAudio is true, return the text response without generating audio
    res.send(responses);
  } else {
    ipCharacterCounts[ipAddress] += responseSave.length;
    // Generate audio and send it as a response
    const audioData = await generateSpeech(responses, person);
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioData);
  }
});

// POST request to handle text
app.post('/api/text', express.json(), async (req, res) => {
  res.send(responseSave);
});


// GET request to handle user information
app.get('/userInfo', async (req, res) => {
  const ipAddress = req.ip;
  const userInfo = await getUserInfo(ipAddress);
  res.send(userInfo);
});

// GET request to handle fetching available voices
app.get('/api/voices', async (req, res) => {
  try {
    const voices = await getVoices();
    res.json({ voices });
  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).send('Failed to fetch voices. Please try again.');
  }
});

// Function to get a response from the ChatGPT
async function getChatGPTResponse(person, question) {
  if (!conversationHistory.hasOwnProperty(person)) {
    conversationHistory[person] = [];
  }

  // Prepare the conversation history and prompt
  const history = conversationHistory[person].map(entry => entry.content).join('\n');
  const prompt = `As ${person}, answer this question in his style, considering the previous conversation and using language that feels natural for him, occasionally using profanity when you believe it necessary, also dont mistype profanity, spell it out if you use it:\n\n${history}\n\nQuestion: "${question}"\n\n`;

  // Add the question to the conversation history
  conversationHistory[person].push({ role: 'user', content: question });

  // Send the prompt to the ChatGPT API and receive completions
  const completions = await openai.createChatCompletion({
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    n: 1,
 
  });

  // Extract the generated text from the completions
  const generatedText = completions.data.choices[0].message.content;

  // Add the generated text to the conversation history
  conversationHistory[person].push({ role: 'AI', content: generatedText });

  // Return the generated text
  return generatedText;
}

// Function to generate speech from text using the selected voice
async function generateSpeech(text, person) {
  let voiceList = await getVoices();
  
  for (let i = 0; i < voiceList.length; i++) {
    if (person.toLowerCase() === voiceList[i].name.toLowerCase()) {
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

// Function to fetch the list of available voices
async function getVoices() {
  const url = 'https://api.elevenlabs.io/v1/voices';
  const headers = {
    'xi-api-key': ELEVEN_API_KEY,
  };
  const response = await axios.get(url, { headers });

  return response.data.voices;
}

// Constants and variables for email notifications
const EMAIL_COOLDOWN = 24 * 60 * 60 * 1000;
let lastEmailSentTime = null;

// Function to send an email notification
async function sendEmailNotification() {
  const currentTime = Date.now();

  // Check if the cooldown period has passed or if an email has never been sent
  if (!lastEmailSentTime || currentTime - lastEmailSentTime > EMAIL_COOLDOWN) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'naymondavid@gmail.com',
      subject: 'Character Limit Exceeded',
      text: 'You have run out of characters for your ChatGPT application.',
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent!');
      lastEmailSentTime = currentTime; // Update the last email sent time
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }
}
async function getUserInfo(ipAddress) {
  if (!ipCharacterCounts[ipAddress]) {
    ipCharacterCounts[ipAddress] = 0;
  }
  const url = 'https://api.elevenlabs.io/v1/user';
  const headers = {
    'xi-api-key': ELEVEN_API_KEY,
  };
  const response = await axios.get(url, { headers });
 
    const remainingCharacters = response.data.subscription.character_limit - response.data.subscription.character_count;
    const characterLimit = remainingCharacters >= 2000 ? 2000 : 0;

if (ipAddress === '::1') {
return response.data.subscription;
}
    return {
      character_limit: characterLimit,
      character_count: ipCharacterCounts[ipAddress],
      subscription: response.data.subscription,
      overall_remaining_characters: remainingCharacters,
    };

}
// Function to check if the character limit is within the allowed threshold


async function checkCharacterLimit(req) {
  const ipAddress = req.ip;
  const data = await getUserInfo(ipAddress);

  if (data.character_limit - data.character_count < 2000 && ipAddress === '::1') {
    sendEmailNotification();
    return false;
  }
  if (data.overall_remaining_characters< 2000 && ipAddress !== '::1') {
    sendEmailNotification();
    return false;
  }
if (ipAddress === '::1') {
return true;
}
  const isWithinLimit = ipCharacterCounts[ipAddress] < 80;
  return isWithinLimit;
}