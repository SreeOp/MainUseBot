const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');

module.exports = (client) => {
  const channelId = '1266779806582702171'; // Replace with your Discord channel ID
  const serverIP = '64.227.138.59';   // Replace with your FiveM server IP
  const port = '30120';                // Replace with your server's port (default is 30120)

  const updateServerStatus = async () => {
    try {
      // Fetch dynamic and players data
      const [dynamicRes, playersRes] = await Promise.all([
        axios.get(`http://${serverIP}:${port}/dynamic.json`, { timeout: 10000 }),
        axios.get(`http://${serverIP}:${port}/players.json`, { timeout: 10000 })
      ]);

      const dynamicData = dynamicRes.data;
      const playersData = playersRes.data;

      // Extract data from responses
      const currentPlayers = playersData.length;
      const maxPlayers = dynamicData.sv_maxclients || 'Unknown';
      const serverName = dynamicData.hostname || 'FiveM Server';
      const restartTimes = '6:30 AM, 6:30 PM'; // Replace with actual restart times

      // Determine server status
      const serverStatus = currentPlayers >= 0 ? '🟢 Online ✅' : '🔴 Offline ❌';

      // Create the embed message
      const embed = new EmbedBuilder()
        .setColor(serverStatus.includes('Online') ? '#00FF00' : '#FF0000') // Green for online, red for offline
        .setTitle(`${serverName} | Server Status`)
        .setDescription(
          `You can join the server **${serverName}** using the connect button below. Live server status is displayed below!`
        )
        .addFields(
          { name: 'Server Status', value: serverStatus, inline: true },
          { name: 'Online Players', value: `${currentPlayers}/${maxPlayers}`, inline: true },
          { name: 'Restart Times', value: restartTimes, inline: false }
        )
        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=674dd3a9&is=674c8229&hm=f7c111ab36c7fa4c944d87df2f6e5d6c70c94e91e12018cea74e2a33c44e1be6&') // Replace with your custom image URL
        .setFooter({ text: `${serverName} | Last Updated` })
        .setTimestamp();

      // Add a connection button
      const button = new ButtonBuilder()
        .setLabel('Connect')
        .setStyle(ButtonStyle.Link)
        .setURL(`fivem://connect/${serverIP}`);

      const actionRow = new ActionRowBuilder().addComponents(button);

      // Send or update the embed in the channel
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

      // Handle failure (server offline or fetch error)
      const embed = new EmbedBuilder()
        .setColor('#FF0000') // Red for offline
        .setTitle('Server Status')
        .setDescription('🔴 The server is currently offline or unreachable.')
        .setFooter({ text: 'Last Checked' })
        .setTimestamp();

      const channel = await client.channels.fetch(channelId);
      const messages = await channel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();

      if (lastMessage && lastMessage.embeds.length > 0) {
        await lastMessage.edit({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }
    }
  };

  // Schedule updates every 1 minute
  setInterval(updateServerStatus, 60000);

  // Initial update
  updateServerStatus();
};
