const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwhitelist')
    .setDescription('Send the whitelist application embed.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to send the whitelist application.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({
        content: 'Please select a valid text channel!',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('Whitelist Application')
      .setDescription('Click the **Apply** button to start your whitelist application.')
      .setColor('#FF4500');
      .setEmoji("🟢")

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply-whitelist')
        .setLabel('Apply')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `Whitelist application message has been sent to <#${channel.id}>.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'There was an error sending the whitelist application message.',
        ephemeral: true,
      });
    }
  },
};
