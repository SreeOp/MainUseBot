const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.activities) return;

    const streamingActivity = newPresence.activities.find(
      activity => activity.type === 'STREAMING' && activity.platform === 'YouTube'
    );

    if (streamingActivity && (!oldPresence || !oldPresence.activities.some(
      activity => activity.type === 'STREAMING' && activity.platform === 'YouTube'
    ))) {
      // User has started streaming on YouTube
      const channelToAlert = client.channels.cache.get('1254436933875011615'); // Replace with your channel ID
      const username = newPresence.user.username;
      const streamLink = streamingActivity.url;

      if (channelToAlert && streamLink) {
        const embed = new EmbedBuilder()
          .setColor('#FFFFFF') 
          .setTitle(`${username} is streaming now!`)
          .setDescription(`Check out their stream: [Watch Now](${streamLink})`)
          .setTimestamp();

        channelToAlert.send({ embeds: [embed] });
      }
    }
  });
};
