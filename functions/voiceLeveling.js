const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { Collection } = require('discord.js');
const cron = require('node-cron');

const userVoiceLevels = new Collection(); // Track user voice activity levels

module.exports = (client) => {
  const leaderboardChannelId = '1301413995307077634'; // Replace with your channel ID for leaderboard posting

  // Track voice state changes for leveling up users
  client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member.user.bot) return;

    const userId = newState.member.id;

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
      const joinTime = Date.now();
      userVoiceLevels.set(userId, { joinTime });
    }
    
    // User left a voice channel
    else if (oldState.channelId && !newState.channelId) {
      const userData = userVoiceLevels.get(userId);
      if (!userData || !userData.joinTime) return;

      const timeSpent = (Date.now() - userData.joinTime) / 1000; // Convert to seconds
      const points = Math.floor(timeSpent / 60); // 1 point per minute
      
      // Update user's level and experience
      userVoiceLevels.set(userId, {
        level: (userData.level || 0) + points,
        joinTime: null // Reset join time
      });
    }
  });

  // Generate leaderboard image
  const generateLeaderboardImage = async () => {
    const canvas = createCanvas(800, 600);
    const context = canvas.getContext('2d');

    // Background and title
    context.fillStyle = '#2C2F33';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FF4D00';
    context.font = '30px Arial';
    context.fillText('Voice Activity Leaderboard', 200, 50);

    // Sort users by level
    const sortedUsers = [...userVoiceLevels.entries()]
      .sort((a, b) => b[1].level - a[1].level)
      .slice(0, 10); // Top 10 users

    // Draw each user on the leaderboard
    for (let i = 0; i < sortedUsers.length; i++) {
      const [userId, data] = sortedUsers[i];
      const user = await client.users.fetch(userId);

      context.fillStyle = '#FFFFFF';
      context.font = '20px Arial';
      context.fillText(`${i + 1}. ${user.username}`, 50, 100 + i * 50);
      context.fillText(`Level: ${data.level}`, 300, 100 + i * 50);
    }

    return canvas.toBuffer('image/png');
  };

  // Post leaderboard every minute
  cron.schedule('*/1 * * * *', async () => {
    try {
      const channel = await client.channels.fetch(leaderboardChannelId);
      if (!channel) return;

      const leaderboardImage = await generateLeaderboardImage();
      await channel.send({ files: [{ attachment: leaderboardImage, name: 'leaderboard.png' }] });
      console.log('Leaderboard updated.');
    } catch (error) {
      console.error('Error posting leaderboard:', error);
    }
  });
};
