const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = (client) => {
  const channelId = '1266779806582702171'; // Replace with your channel ID
  const serverIP = '64.227.138.59';   // Replace with your server's IP
  const port = '30120';                // Replace with your server's port (default is 30120)

  const updateServerStatus = async () => {
    try {
      // Fetch server data
      const playersResponse = await fetch(`http://${serverIP}:${port}/players.json`);
      const infoResponse = await fetch(`http://${serverIP}:${port}/info.json`);

      const playersData = await playersResponse.json();
      const infoData = await infoResponse.json();

      // Extract relevant data
      const currentPlayers = playersData.length;
      const maxPlayers = infoData.vars.sv_maxClients || 'Unknown';
      const serverName = infoData.vars.sv_projectName || 'FiveM Server';
      const restartTimes = '6:30 AM, 6:30 PM'; // Replace with actual restart times

      // Create an embed message
      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green color for online
        .setTitle(`${serverName} | Server Status`)
        .setDescription(
          `You can join the server **${serverName}** using the server link below.\n\nLive server status is displayed below!`
        )
        .addFields(
          { name: '🟢 Server Status', value: 'Online ✅', inline: false },
          { name: '👥 Online Players', value: `${currentPlayers}/${maxPlayers}`, inline: true },
          { name: '⏰ Restart Times', value: restartTimes, inline: true }
        )
        .setImage('YOUR_CUSTOM_IMAGE_URL') // Replace with your image URL
        .setFooter({ text: `${serverName} | Last Updated` })
        .setTimestamp();

      // Add a button for server connection
      const button = new ButtonBuilder()
        .setLabel('Connect')
        .setStyle(ButtonStyle.Link)
        .setURL(`fivem://connect/${serverIP}`);

      const actionRow = new ActionRowBuilder().addComponents(button);

      // Send or edit the message in the channel
      const channel = await client.channels.fetch(channelId);
      const messages = await channel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();

      if (lastMessage && lastMessage.embeds.length > 0) {
        await lastMessage.edit({ embeds: [embed], components: [actionRow] });
      } else {
        await channel.send({ embeds: [embed], components: [actionRow] });
      }

      console.log('Server status updated successfully.');
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  // Update every 1 minute
  setInterval(updateServerStatus, 60000);

  // Initial update
  updateServerStatus();
};
