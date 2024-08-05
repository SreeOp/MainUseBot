const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start a giveaway')
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('hours')
        .setDescription('Number of hours for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Number of minutes for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Number of seconds for the giveaway')
        .setRequired(true)),
  async execute(interaction) {
    const days = interaction.options.getInteger('days');
    const hours = interaction.options.getInteger('hours');
    const minutes = interaction.options.getInteger('minutes');
    const seconds = interaction.options.getInteger('seconds');

    const duration = days * 86400000 + hours * 3600000 + minutes * 60000 + seconds * 1000;
    const endTime = Date.now() + duration;

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Giveaway Started!')
      .setDescription('Click the button below to join the giveaway!')
      .addFields(
        { name: 'Duration', value: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds` },
        { name: 'Ends at', value: `<t:${Math.floor(endTime / 1000)}:R>` }
      );

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('join_giveaway')
          .setLabel('Join Giveaway')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎉')
      );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const updateEmbed = () => {
      if (Date.now() >= endTime) {
        clearInterval(interval);
        embed.setDescription('Giveaway Ended');
        embed.setFields({ name: 'Winners', value: 'Winners will be announced soon!' });
        message.edit({ embeds: [embed], components: [] });
        return;
      }

      embed.setFields(
        { name: 'Time Left', value: `<t:${Math.floor(endTime / 1000)}:R>` }
      );
      message.edit({ embeds: [embed] });
    };

    const interval = setInterval(updateEmbed, 60000); // Update every minute

    // Ensure to clear this interval if the bot restarts or stops
  },
};
