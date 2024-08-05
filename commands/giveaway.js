const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// This would ideally be some persistent storage or database
const giveaways = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveawaaay')
    .setDescription('Start a giveaway')
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway (e.g., 10h, 15m, 2d)')
        .setRequired(true)),
  async execute(interaction) {
    const durationInput = interaction.options.getString('duration');
    let durationMs;

    // Parse duration input
    const match = durationInput.match(/^(\d+)(d|h|m|s)$/);
    if (!match) {
      return interaction.reply({ content: 'Invalid duration format. Please use the format like 10h, 15m, 2d.', ephemeral: true });
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'd':
        durationMs = value * 86400000; // days to milliseconds
        break;
      case 'h':
        durationMs = value * 3600000; // hours to milliseconds
        break;
      case 'm':
        durationMs = value * 60000; // minutes to milliseconds
        break;
      case 's':
        durationMs = value * 1000; // seconds to milliseconds
        break;
    }

    const endTime = Date.now() + durationMs;

    const embed = new EmbedBuilder()
      .setColor(0xFF4D00)
      .setTitle('Giveaway Started!')
      .setDescription('Click the button below to join the giveaway!')
      .addFields(
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

    // Store giveaway information
    giveaways[message.id] = {
      endTime,
      participants: [],
      intervalId: null
    };

    // Function to update the embed
    const updateEmbed = () => {
      if (Date.now() >= giveaways[message.id].endTime) {
        clearInterval(giveaways[message.id].intervalId);
        embed.setDescription('Giveaway Ended');
        const participants = giveaways[message.id].participants;
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const winnerId = participants[winnerIndex];
        embed.addFields({ name: 'Winner', value: `<@${winnerId}>` });
        message.edit({ embeds: [embed], components: [] });
        return;
      }

      embed.setFields(
        { name: 'Time Left', value: `<t:${Math.floor(giveaways[message.id].endTime / 1000)}:R>` }
      );
      message.edit({ embeds: [embed] });
    };

    giveaways[message.id].intervalId = setInterval(updateEmbed, 60000); // Update every minute

    // Ensure to clear this interval if the bot restarts or stops
  },
  buttonHandler: async (interaction) => {
    if (interaction.customId === 'join_giveaway') {
      const giveaway = giveaways[interaction.message.id];
      if (!giveaway.participants.includes(interaction.user.id)) {
        giveaway.participants.push(interaction.user.id);
        await interaction.reply({ content: 'You have joined the giveaway!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'You are already in the giveaway!', ephemeral: true });
      }
    }
  }
};
