const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Joins a voice channel and stays there 24/7.')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The voice channel to join')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');

      if (channel.type !== ChannelType.GuildVoice) {
        return await interaction.reply({ content: 'Please select a valid voice channel.', ephemeral: true });
      }

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      await interaction.reply({ content: `Joined ${channel.name} and staying there 24/7!`, ephemeral: true });
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
      } else {
        await interaction.followUp({ content: 'There was an error executing that command!', ephemeral: true });
      }
    }
  },
};
