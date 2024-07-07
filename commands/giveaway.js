const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Starts a giveaway')
    .addStringOption(option =>
      option.setName('prize')
        .setDescription('The prize for the giveaway')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration of the giveaway in seconds')
        .setRequired(true)),

  async execute(interaction) {
    const prize = interaction.options.getString('prize');
    const duration = interaction.options.getInteger('duration');
    
    const embed = new MessageEmbed()
      .setTitle('🎉 Giveaway! 🎉')
      .setDescription(`Prize: **${prize}**\nReact with 🎉 to enter!\nEnds in: **${duration}** seconds`)
      .setColor('#BC13FE');

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    
    await message.react('🎉');

    setTimeout(async () => {
      const fetchedMessage = await message.fetch();
      const reactions = fetchedMessage.reactions.cache.get('🎉');
      
      if (!reactions) return interaction.followUp('No one entered the giveaway.');

      const users = await reactions.users.fetch();
      const filteredUsers = users.filter(user => !user.bot);

      if (filteredUsers.size === 0) {
        return interaction.followUp('No valid entries, giveaway canceled.');
      }

      const winner = filteredUsers.random();

      interaction.followUp(`🎉 Congratulations ${winner}! You won the **${prize}**! 🎉`);
    }, duration * 1000);
  },
};
