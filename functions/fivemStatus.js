const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const axios = require('axios');

module.exports = (client) => {
  const channelId = '1266779806582702171'; // Replace with your channel ID
  const serverIP = '64.227.138.59';   // Replace with your server's IP
  const port = '30120';                // Replace with your server's port (default is 30120)

  const updateServerStatus = async () => {
    try {
      const playersResponse = await axios.get(`http://${serverIP}:${port}/players.json`);
      const infoResponse = await axios.get(`http://${serverIP}:${port}/info.json`);

      const playersData = playersResponse.data;
      const infoData = infoResponse.data;

      const currentPlayers = playersData.length;
      const maxPlayers = infoData.vars.sv_maxClients || 'Unknown';
      const serverName = infoData.vars.sv_projectName || 'FiveM Server';
      const restartTimes = '6:30 AM, 6:30 PM';

      const embed = new EmbedBuilder()
        .setColor('#00FF00') // Green for online
        .setTitle(`${serverName} | Server Status`)
        .setDescription(
          `You can join the server **${serverName}** using the connection link below.\n\nLive server status is displayed below!`
        )
        .addFields(
          { name: '🟢 Server Status', value: 'Online ✅', inline: false },
          { name: '👥 Online Players', value: `${currentPlayers}/${maxPlayers}`, inline: true },
          { name: '⏰ Restart Times', value: restartTimes, inline: true },
          { name: 'How to Connect', value: `Use the following command in your browser:\n\`fivem://connect/${serverIP}\`` }
        )
        .setImage('https://cdn.discordapp.com/attachments/1056903195961610275/1242682120141275176/standard_3.gif?ex=674dd3a9&is=674c8229&hm=f7c111ab36c7fa4c944d87df2f6e5d6c70c94e91e12018cea74e2a33c44e1be6&') // Replace with your image URL
        .setFooter({ text: `${serverName} | Last Updated` })
        .setTimestamp();

      const channel = await client.channels.fetch(channelId);
      const messages = await channel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();

      if (lastMessage && lastMessage.embeds.length > 0) {
        await lastMessage.edit({ embeds: [embed] });
      } else {
        await channel.send({ embeds: [embed] });
      }

      console.log('Server status updated successfully.');
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  setInterval(updateServerStatus, 60000);
  updateServerStatus();
};
