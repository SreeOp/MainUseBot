const Discord = require('discord.js');
const canvas = require('@napi-rs/canvas');

module.exports = (client) => {
  
  const welcomeChannelId = '1297917830527979531';

  client.on('guildMemberAdd', async (member) => {
       
    const frame = canvas.createCanvas(2000, 932);
    const ctx = frame.getContext('2d');
const bg = await canvas.loadImage('https://cdn.discordapp.com/attachments/1056903195961610275/1299665226802663465/background-image.png?ex=671e0710&is=671cb590&hm=d9c5f4a746caca90a2b37d1522fb6c0f1175312224df3b0abe7a34daccb86dac&');
ctx.drawImage(bg, 0, 0, frame.width, frame.height);

      const username = member.user.username;
const avatar = await canvas.loadImage(member.user.displayAvatarURL({ format: 'png', size: 256 }));
 
const radius = 100;
  ctx.save();
  ctx.beginPath();
  ctx.arc(1598, 250, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 1071  - radius, 597  - radius, radius * 2, radius * 2);
  ctx.restore();

    ctx.fillStyle = 'white';
    ctx.font = '70px Ariel';
    ctx.fillText(username, 1425, 90);

    const attachment = new Discord.AttachmentBuilder(await frame.encode('png'), 'welcome-image.png');

    const welcomeChannel = client.channels.cache.get(welcomeChannelId);
    welcomeChannel.send({ content: `Welcome to FarX, ${member}!`, files: [attachment]});
  });

};
