const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const giveaways = {};  // This should be replaced by persistent storage in a real scenario

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
    const durationMs = parseDuration(durationInput);
    if (!durationMs) {
      return interaction.reply({ content: 'Invalid duration format. Please use the format like 10h, 15m, 2d.', ephemeral: true });
    }

    const endTime = Date.now() + durationMs;
    const embed = new EmbedBuilder()
      .setColor(0xFF4D00)
      .setTitle('Giveaway Started!')
      .setDescription('Click the button below to join the giveaway!')
      .addFields({ name: 'Ends at', value: `<t:${Math.floor(endTime / 1000)}:R>` });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('join_giveaway')
          .setLabel('Join Giveaway')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎉')
      );

    const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    giveaways[message.id] = { endTime, participants: [], intervalId: null };
    startInterval(message.id);
  },

  async buttonHandler(interaction) {
    if (interaction.customId === 'join_giveaway') {
      await interaction.deferUpdate();  // Acknowledge the interaction immediately
      const giveaway = giveaways[interaction.message.id];
      if (!giveaway) {
        return interaction.followUp({ content: 'This giveaway is no longer active.', ephemeral: true });
      }

      if (giveaway.participants.includes(interaction.user.id)) {
        return interaction.followUp({ content: 'You are already in the giveaway!', ephemeral: true });
      }

      giveaway.participants.push(interaction.user.id);
      return interaction.followUp({ content: 'You have joined the giveaway!', ephemeral: true });
    }
  }
};

function parseDuration(input) {
  const match = input.match(/^(\d+)(d|h|m|s)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd': return value * 86400000; // days to milliseconds
    case 'h': return value * 3600000; // hours to milliseconds
    case 'm': return value * 60000; // minutes to milliseconds
    case 's': return value * 1000; // seconds to milliseconds
    default: return null;
  }
}

function startInterval(giveawayId) {
  const updateEmbed = async () => {
    const giveaway = giveaways[giveawayId];
    if (Date.now() >= giveaway.endTime) {
      clearInterval(giveaway.intervalId);
      const embed = new EmbedBuilder()
        .setColor(0xFF4D00)
        .setTitle('Giveaway Ended')
        .setDescription('The giveaway has ended.');
      if (giveaway.participants.length > 0) {
        const winnerIndex = Math.floor(Math.random() * giveaway.participants.length);
        const winnerId = giveaway.participants[winnerIndex];
        embed.addFields({ name: 'Winner', value: `<@${winnerId}>` });
      } else {
        embed.setDescription('No participants in the giveaway.');
      }
      const originalMessage = await interaction.channel.messages.fetch(giveawayId);
      originalMessage.edit({ embeds: [embed], components: [] });
    }
  };

  giveaways[giveawayId].intervalId = setInterval(updateEmbed, 60000); // Update every minute
}
