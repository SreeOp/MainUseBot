const { EmbedBuilder } = require('discord.js');

// Channel ID where logs will be sent
const LOG_CHANNEL_ID = '1254436933875011615';  // Replace with the actual log channel ID

module.exports = (client) => {
  // Listen for message delete event
  client.on('messageDelete', async (message) => {
    if (message.partial) return; // If message is not fully cached

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return; // Exit if the log channel doesn't exist

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .setColor('#FF4D00')
      .setDescription(`A message by <@${message.author.id}> was deleted in <#${message.channel.id}>`)
      .addFields({ name: 'Content:', value: message.content || '*No content*' })
      .setFooter({ text: `Message ID: ${message.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });

  // Listen for message update (edit) event
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.partial || newMessage.partial) return; // If message is not fully cached
    if (oldMessage.content === newMessage.content) return; // Ignore if content is the same

    const logChannel = oldMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return; // Exit if the log channel doesn't exist

    const embed = new EmbedBuilder()
      .setTitle('✏️ Message Edited')
      .setColor('#FF4D00')
      .setDescription(`A message by <@${oldMessage.author.id}> was edited in <#${oldMessage.channel.id}>`)
      .addFields(
        { name: 'Before:', value: oldMessage.content || '*No content*' },
        { name: 'After:', value: newMessage.content || '*No content*' }
      )
      .setFooter({ text: `Message ID: ${oldMessage.id}` })
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  });
};
