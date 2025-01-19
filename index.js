// Import the required modules and functions
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config(); // Load environment variables

// Import the setStatus function, warScheduler, welcome function, cfxStatus function, and voiceLogger
const setStatus = require('./functions/setStatus');
const warScheduler = require('./functions/warScheduler');
const welcome = require('./functions/welcome');
const ticket = require('./functions/ticket');
const cfxStatus = require('./functions/cfxStatus'); // Import the Cfx.re status function
const whitelist = require('./functions/whitelist');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] }); // Include GuildVoiceStates intent

// Initialize commands collection
client.commands = new Collection();

// Command files
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Set commands to the collection
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Deploy commands
const deployCommands = require('./deploy-commands');
deployCommands().catch(console.error);

// Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set the bot's status
  setStatus(client);

  // Initialize war scheduler
  warScheduler(client);

  // Initialize welcome message functionality
  welcome(client);

  // Initialize ticket message functionality
  ticket(client);

  // Initialize whitelist message functionality
  whitelist(client);

  // Call the Cfx.re status function to send status to a channel
  cfxStatus(client); 
});

// Function to handle interactions (buttons, modals, etc.)
async function handleInteraction(interaction) {
  if (interaction.isButton()) {
    // Handle button interactions
    if (interaction.customId === 'apply-whitelist') {
      // Your existing button logic for applying for whitelist
      await interaction.reply('You clicked apply-whitelist!');
    }
    else if (interaction.customId === 'reject-whitelist') {
      // Handle the rejection button logic
      await interaction.reply('You clicked reject-whitelist!');
    }
    // Add more button handling cases as needed
  }
  
  else if (interaction.isModalSubmit()) {
    // Handle modal submissions (e.g., whitelist application)
    if (interaction.customId === 'whitelist-application') {
      // Process the modal inputs and send response
      const name = interaction.fields.getTextInputValue('real-name');
      await interaction.reply(`Application submitted with name: ${name}`);
    }
  }
  else {
    await interaction.reply({ content: 'Unknown interaction type.', ephemeral: true });
  }
}

// Interaction create event
client.on('interactionCreate', async interaction => {
  try {
    // Call the function to handle the interaction
    await handleInteraction(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'There was an error handling the interaction.', ephemeral: true });
    } else {
      await interaction.followUp({ content: 'There was an error handling the interaction.', ephemeral: true });
    }
  }
});

// Login to Discord with your app's token from environment variables
client.login(process.env.DISCORD_TOKEN);

// Set up an Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
