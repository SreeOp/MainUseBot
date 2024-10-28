const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const cron = require('node-cron');

module.exports = async (client) => {
  const channelId = '1297917830527979531'; // Replace with the target channel ID
  const onlineEmoji = '<a:online_emoji:1300482830731575348>'; // Replace with your animated online emoji
  const offlineEmoji = '<a:offline_emoji:1300482784938164348>'; // Replace with your animated offline emoji

  // Function to fetch and send Cfx.re status
  const fetchAndSendStatus = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.error('Invalid channel.');

      // Fetch status data
      const [statusRes, componentsRes] = await Promise.all([
        axios.get('https://status.cfx.re/api/v2/status.json'),
        axios.get('https://status.cfx.re/api/v2/components.json')
      ]);

      const status = statusRes.data.status;
      const components = componentsRes.data.components;

      // Build the embed
      const embed = new EmbedBuilder()
        .setTitle(`${onlineEmoji} Cfx.re Status`)
        .setDescription(status.description)
        .setColor(status.indicator === 'none' ? '#00FF00' : '#FF0000')
        .setTimestamp()
        .setFooter({ text: 'Cfx.re status updated every minute' });

      // Add each component's status to the embed
      components.forEach(component => {
        const emoji = component.status === 'operational' ? onlineEmoji : offlineEmoji;
        embed.addFields({
          name: `${emoji} ${component.name}`,
          value: component.status.charAt(0).toUpperCase() + component.status.slice(1),
          inline: true
        });
      });

      // Find or send the status message
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(msg => msg.author.id === client.user.id && msg.embeds[0]?.title.includes('Cfx.re Status'));

      if (botMessage) {
        await botMessage.edit({ embeds: [embed] });
        console.log('Cfx.re status updated.');
      } else {
        await channel.send({ embeds: [embed] });
        console.log('Cfx.re status message sent.');
      }
    } catch (error) {
      console.error('Error fetching or sending Cfx.re status:', error);
    }
  };

  // Schedule the task to run every minute
  cron.schedule('* * * * *', fetchAndSendStatus, {
    timezone: 'Asia/Kolkata' // Set to Indian Standard Time
  });
};
