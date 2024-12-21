const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  Client,
} = require("discord.js");
const moment = require('moment-timezone');
const canvas = require("@napi-rs/canvas");
const { join } = require('path')
const { GlobalFonts } = require('@napi-rs/canvas');
let counter = 0;
function generateRandomCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${randomNumber}${randomLetter}`;
}

function getRandomCode() {
  const num = Math.floor(Math.random() * 100);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${num.toString().padStart(2, '0')} ${letter}`;
}


function RowCode() {
  return Math.floor(1 + Math.random() * 10); 
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("visa-accept")
    .setDescription("To Make A Whitelist Accpet")
    .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you want to make accept')
                .setRequired(true)
        ),
  async execute(interaction, client) {
      
      

      
      const mentionedUser = interaction.options.getUser('user');
      const currentDate = new Date().toLocaleDateString();
      const randomCode = generateRandomCode();
      const rowCode = RowCode()
      const randomSeat = getRandomCode()
      
      function getCurrentISTTime() {

    const ist = moment().tz('Asia/Kolkata').format('h:mm A');

    return ist;

}

  const currentTime = getCurrentISTTime();
    counter++; 
      const randomNumber = Math.floor(Math.random() * 8000) + 1000;
      GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'fonts', 'AQuietSleep.ttf'), 'SemiBold')
GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'fonts', 'A25-SQUANOVA.ttf'), 'SkCustom')
	  const frame = canvas.createCanvas(1440, 582);
      const ctx = frame.getContext('2d');
      const background = await canvas.loadImage('https://r2.fivemanage.com/e5kQRKN2PzcSphJCViYrL/nrp_approved.png');

     
       ctx.drawImage(background, 0, 0, frame.width, frame.height);
      
      // Name
      ctx.font = "35px SemiBold";
      ctx.fillStyle = `#21130d`;
ctx.fillText(`${mentionedUser.username.toUpperCase()}`, 550, 250);
      	
      // Date & Time
      	ctx.font = "29px SemiBold";
        ctx.fillStyle = `#21130d`;
       	ctx.fillText(`${currentDate}, ${currentTime}`, 30, 365);
      
      // Flight No
      	ctx.font = "33px SemiBold";
        ctx.fillStyle = `#21130d`;
       	ctx.fillText(`${randomCode}`, 30, 270);
      
         // Gate
      	ctx.font = "33px SemiBold";
        ctx.fillStyle = `#21130d`;
       	ctx.fillText(`${rowCode}`, 260, 270);
      
      
     // Flight No 2
      ctx.font = "33px SemiBold"
      ctx.fillStyle = `#21130d`
      ctx.fillText(`${randomCode}`, 1020, 280)
      
      // Gate 2 
      	ctx.font = "33px SemiBold";
        ctx.fillStyle = `#21130d`;
       	ctx.fillText(`${rowCode}`, 1320, 280);
      
      // Seat
      	ctx.font = "40px SkCustom";
        ctx.fillStyle = `#3691be`;
       	ctx.fillText(`${randomSeat}`, 440, 490);
      
      const attachment = new AttachmentBuilder(await frame.encode('png'), { name: 'accept.png' });
      
 
      const channel = client.channels.cache.get('1313134410282962996');
      
    
      

    
      
    await channel.send({ files: [attachment], content: `<@${mentionedUser.id}>` });
      
        
      
  },
};
 
