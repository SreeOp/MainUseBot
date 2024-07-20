const { EmbedBuilder } = require('discord.js');

module.exports = async (client, member) => {
  const autoRoleId = process.env.AUTO_ROLE_ID;
  const logChannelId = process.env.LOG_CHANNEL_ID;

  if (!autoRoleId || !logChannelId) return;

  try {
    const role = member.guild.roles.cache.get(autoRoleId);
    if (role) {
      await member.roles.add(role);

      const logChannel = member.guild.channels.cache.get(logChannelId);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle('Role Assigned')
          .setDescription(`Assigned role ${role.name} to ${member.user.tag}`)
          .setColor('GREEN')
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Error assigning autorole:', error);
  }
};
