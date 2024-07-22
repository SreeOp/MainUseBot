const { ActivityType } = require('discord.js');

const statusMessages = [
  { name: "ZyX Projects", type: ActivityType.Playing },
  { name: "Custom Works", type: ActivityType.Watching },
  { name: "Musics !", type: ActivityType.Listening },
  { name: "members...", type: ActivityType.Watching } // Placeholder for member count
];

let currentIndex = 0;

module.exports = (client) => {
  function updateStatus() {
    const currentStatus = statusMessages[currentIndex];
    
    if (currentIndex === statusMessages.length - 1) {
      // Fetch the member count from the first guild
      const guild = client.guilds.cache.first();
      if (guild) {
        const memberCount = guild.memberCount;
        currentStatus.name = `${memberCount} members`;
      }
    }

    currentIndex = (currentIndex + 1) % statusMessages.length;

    client.user.setPresence({
      activities: [{ name: currentStatus.name, type: currentStatus.type }],
      status: 'dnd', // You can set this to 'online', 'idle', or 'invisible' as needed
    });
  }

  // Update status every 25 seconds (25000 ms)
  setInterval(updateStatus, 25000);

  // Initial status set
  updateStatus();
};
