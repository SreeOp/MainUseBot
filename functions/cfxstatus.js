const { EmbedBuilder, ChannelType } = require('discord.js');
const axios = require('axios'); // For fetching data from the API
const cron = require('node-cron'); // For scheduling regular updates

module.exports = (client) => {
  const channelId = '1297917830527979531'; // Replace with your target channel ID

  // Function to fetch the overall status and components data
  const getStatusData = async () => {
    try {
      // Fetch the overall status from the status API
      const overallResponse = await axios.get('https://status.cfx.re/api/v2/status.json');
      const overallStatus = overallResponse.data.status.indicator === 'none' ? '🟢 All systems operational' : '🔴 Some systems are down';

      // Fetch the components data from the components API
      const componentsResponse = await axios.get('https://status.cfx.re/api/v2/components.json');
      const components = componentsResponse.data.components;

      // Build the components status string
      const componentsStatus = components.map(component => {
        const statusEmoji = component.status === 'operational' ? '🟢' : '🔴';
        return `${statusEmoji} ${component.name}: ${component.status}`;
      }).join('\n');

      // Create the embed
      const statusEmbed = new EmbedBuilder()
        .setColor(overallStatus.includes('🟢') ? '#00FF00' : '#FF0000') // Set green if operational, red if down
        .setTitle('🦋 Cfx.re Status')
        .setDescription('Live status update of Cfx.re services.')
        .addFields(
          { name: 'Overall Status', value: overallStatus },
          { name: 'Components Status', value: componentsStatus }
        )
        .setTimestamp();

      return statusEmbed;

    } catch (error) {
      console.error('Error fetching Cfx.re status:', error);
      return null;
    }
  };

  // Function to send the status message to the channel
  const sendStatusMessage = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || channel.type !== ChannelType.GuildText) {
        console.error('Invalid channel or channel type.');
        return;
      }

      const embed = await getStatusData();
      if (embed) {
        // Send the embed message or update it
        await channel.send({ embeds: [embed] });
        console.log('Cfx.re status message sent successfully.');
      } else {
        await channel.send('Failed to retrieve Cfx.re status.');
      }

    } catch (error) {
      console.error('Error sending the status message:', error);
    }
  };

  // Schedule the task to run every minute to check and update the status
  cron.schedule('* * * * *', () => {
    console.log('Checking and updating Cfx.re status...');
    sendStatusMessage();
  }, {
    timezone: "Asia/Kolkata" // Use the correct timezone for your region
  });
};
