// /functions/stayInVoiceChannel.js
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

async function stayInVoiceChannel(client, guildId, channelId) {
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);

  if (!channel || channel.type !== 'GUILD_VOICE') {
    console.error('The provided channel ID is not a voice channel.');
    return;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
      ]);
      // Seems to be reconnecting to a new channel - ignore disconnect
    } catch (error) {
      // Seems to be a real disconnect which won't automatically reconnect
      connection.destroy();
      stayInVoiceChannel(client, guildId, channelId); // Rejoin the voice channel
    }
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    // Rejoin the voice channel if connection is destroyed
    stayInVoiceChannel(client, guildId, channelId);
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log('The bot has joined the voice channel and is ready!');
  } catch (error) {
    console.error('Failed to connect to the voice channel:', error);
    connection.destroy();
  }
}

module.exports = stayInVoiceChannel;
