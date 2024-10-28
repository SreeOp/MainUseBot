const { EmbedBuilder, ChannelType } = require('discord.js');
const axios = require('axios');

module.exports = async (client) => {
  const channelId = '1297917830527979531'; // Replace with your target channel ID

  // Function to fetch and format the Cfx.re status data
  const getCfxStatusEmbed = async () => {
    try {
      // Fetching data from Cfx.re status endpoints
      const [statusResponse, componentsResponse] = await Promise.all([
        axios.get('https://status.cfx.re/api/v2/status.json'),
        axios.get('https://status.cfx.re/api/v2/components.json'),
      ]);

      const statusData = statusResponse.data.status;
      const componentsData = componentsResponse.data.components;

      // Map component statuses with emojis
      const statusEmoji = {
        operational: '🟢',
        degraded_performance: '🟡',
        partial_outage: '🟠',
        major_outage: '🔴',
        under_maintenance: '🛠️',
      };

      // Format component statuses
      const componentsStatus = componentsData.map((component) => {
        const emoji = statusEmoji[component.status] || '❔';
        return `${emoji} ${component.name}: ${component.status.replace(/_/g, ' ')}`;
      }).join('\n');

      // Create the embed
      const embed = new EmbedBuilder()
        .setColor('#FF4D00') // Set the embed color
        .setTitle('🦋 Cfx.re Status')
        .setDescription(statusData.description)
        .addFields(
          { name: 'Overall Status', value: `${statusEmoji[statusData.indicator]} ${statusData.description}` },
          { name: 'Components Status', value: componentsStatus }
        )
        .setFooter({ text: 'Cfx.re Status' })
        .setTimestamp();

      return embed;

    } catch (error) {
      console.error('Error fetching Cfx.re status:', error);
      return null;
    }
  };

  // Function to send the embed message
  const sendStatusMessage = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error('Invalid channel or channel type.');
        return;
      }

      const embed = await getCfxStatusEmbed();

      if (embed) {
        await channel.send({ embeds: [embed] });
        console.log('Cfx.re status message sent successfully.');
      } else {
        await channel.send('Failed to retrieve Cfx.re status.');
      }

    } catch (error) {
      console.error('Error sending the status message:', error);
    }
  };

  // Call this function when needed, such as on bot startup or on a schedule.
  sendStatusMessage();
};
