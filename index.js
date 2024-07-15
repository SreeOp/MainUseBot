const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
require('dotenv').config();

// Import the setStatus function
const setStatus = require('./functions/setStatus');

// Create a new client instance
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences // Ensure this is included to fetch member presence status
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

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

// Ready event
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Set the bot's status
  setStatus(client);
});

// Interaction create event
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
      } else {
        await interaction.followUp({ content: 'There was an error executing that command!', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'show_online_members') {
      // Define the role ID you're checking for
      const roleId = '1046786167644880946'; // Replace with actual role ID

      // Fetch the members with the role
      const membersWithRole = interaction.guild.roles.cache.get(roleId).members;

      // Filter members by online status
      const onlineMembers = membersWithRole.filter(member => member.presence?.status === 'online');

      // Prepare the list of online members
      const onlineMemberList = onlineMembers.map(member => member.user.username).join('\n') || 'No online members found';

      // Reply with the list of online members
      await interaction.reply({ content: `**Online Members with the role:**\n${onlineMemberList}`, ephemeral: true });
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
