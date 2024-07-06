const { ActivityType } = require('discord.js');

// Array of status messages
const statusMessages = [
  "No Skill Customs",
  "Vehicle Works",
  "Maps Works",
  "Cinematics Works"
];

let currentIndex = 0;

module.exports = (client) => {
  function updateStatus() {
    const currentStatus = statusMessages[currentIndex];
    currentIndex = (currentIndex + 1) % statusMessages.length;

    client.user.setPresence({
      activities: [{ name: currentStatus, type: ActivityType.Custom }],
      status: 'dnd',
    });
  }

  // Update status every 10 minutes (600000 ms)
  setInterval(updateStatus, 600000);

  // Initial status set
  updateStatus();
};
