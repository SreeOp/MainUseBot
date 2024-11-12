const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('presenceUpdate', (oldPresence, newPresence) => {
    // Check if newPresence is valid
    if (!newPresence || !newPresence.activities) {
      console.log('No presence activities detected.');
      return;
    }

    // Log activities for debugging
    console.log(`${newPresence.user.tag}'s new activities:`);
    newPresence.activities.forEach(activity => {
      console.log(`Type: ${activity.type}, Name: ${activity.name}, URL: ${activity.url}`);
    });

    // Check if there is a streaming activity on YouTube
    const streamingActivity = newPresence.activities.find(
      activity => activity.type === 'STREAMING' && activity.url && activity.url.includes('youtube.com')
    );

    if (streamingActivity) {
      // User has started streaming on YouTube
      const channelToAlert = client.channels.cache.get('1254436933875011615'); // Replace with your channel ID
      const username = newPresence.user.username;
      const streamLink = streamingActivity.url;

      if (channelToAlert && streamLink) {
        const embed = new EmbedBuilder()
          .setColor('#FF0000') // YouTube red color
          .setTitle(`${username} is streaming now!`)
          .setDescription(`Check out their stream: [Watch Now](${streamLink})`)
          .setTimestamp();

        channelToAlert.send({ embeds: [embed] })
          .then(() => console.log('Stream alert sent successfully'))
          .catch(err => console.error('Error sending stream alert:', err));
      } else {
        console.log('Channel not found or stream link missing.');
      }
    }
  });
};
