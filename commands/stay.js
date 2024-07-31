const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('Joins a voice channel and stays there 24/7.')
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The voice channel to join')
        .setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isVoice()) {
      return interaction.reply({ content: 'Please select a valid voice channel.', ephemeral: true });
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    connection.subscribe(player);

    const resource = createAudioResource('path_to_silence_audio.mp3'); // Add path to a silence audio file

    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      player.play(resource);
    });

    return interaction.reply({ content: `Joined ${channel.name} and staying there 24/7!`, ephemeral: true });
  },
};
