// functions/staffApplication.js
module.exports = async (client, interaction) => {
  if (!interaction.isButton()) return;

  const { customId, member } = interaction;
  const applicantId = interaction.user.id;

  const acceptEmbed = {
    color: 0x00FF00,
    title: 'Application Accepted',
    description: `Congratulations <@${applicantId}>, your application has been accepted by ${member.user.tag}.`,
    timestamp: new Date(),
  };

  if (customId === 'accept') {
    await interaction.reply({ embeds: [acceptEmbed], ephemeral: true });
    const appChannel = client.channels.cache.get(process.env.APPLY_CHANNEL_ID);
    if (appChannel) {
      await appChannel.send({ content: `<@${applicantId}>`, embeds: [acceptEmbed] });
    }
  }
};
