const { ActivityType } = require('discord.js');

// Array of status messages with their types
const statusMessages = [
  { name: "Zyronix", type: ActivityType.Playing },
  { name: "You !", type: ActivityType.Watching },
  { name: "Bot Under Development", type: ActivityType.Listening },
  { name: "https://youtube.com/@zyronix_7?si=7azLhT_KRCivkXuw", type: ActivityType.Streaming }
];

let currentIndex = 0;

module.exports = (client) => {
  function updateStatus() {
    const currentStatus = statusMessages[currentIndex];
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
