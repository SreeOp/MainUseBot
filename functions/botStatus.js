const { MessageEmbed } = require('discord.js');
const os = require('os');
const { Canvas } = require('@napi-rs/canvas');
const { performance } = require('perf_hooks');

module.exports = async (client) => {
  const channelId = '1266779806582702171'; // Replace with your channel ID
  const developerId = 'sreeop'; // Replace with your developer's ID

  // Function to generate the CPU and memory usage graph
  const generateGraph = async (usage) => {
    const canvas = new Canvas(600, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 600, 200);

    // Draw CPU usage graph (as an example)
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, usage * 6, 200); // Scale the CPU usage to fit in the graph

    return canvas.toBuffer();
  };

  // Function to send the bot status message
  const sendBotStatus = async () => {
    const ping = client.ws.ping;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
    const cpuUsage = (performance.now() - process.hrtime()[0]) / 1000; // CPU usage approximation
    const nodeVersion = process.version;
    const discordVersion = require('discord.js').version;
    const uptime = formatUptime(process.uptime());

    // Create the embed message
    const embed = new MessageEmbed()
      .setTitle('Bot Live Status')
      .addField('Uptime', uptime, true)
      .addField('Ping', `${ping}ms`, true)
      .addField('Memory Usage', `${memoryUsage.toFixed(2)} MB`, true)
      .addField('CPU Usage', `${cpuUsage.toFixed(2)}%`, true)
      .addField('Node Version', nodeVersion, true)
      .addField('Discord.js Version', discordVersion, true)
      .setColor('#FFFFFF')
      .setFooter(`Developed by <@${developerId}>`);

    // Generate CPU Usage graph
    const graphBuffer = await generateGraph(cpuUsage);

    // Send the message to the specified channel
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      channel.send({
        content: `Bot Status Update: <@${developerId}>`,
        embeds: [embed],
        files: [{ attachment: graphBuffer, name: 'cpu-usage.png' }],
      });
    } else {
      console.log('Channel not found');
    }
  };

  // Format uptime in HH:MM:SS
  const formatUptime = (uptime) => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Send the bot status every 10 minutes (600,000 ms)
  setInterval(sendBotStatus, 600000); // 600000 ms = 10 minutes

  // Also call it immediately when the bot starts
  sendBotStatus();
};
