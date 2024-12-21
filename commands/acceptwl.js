module.exports = {
  data: new SlashCommandBuilder()
    .setName("visa-accept")
    .setDescription("To Make A Whitelist Accept")
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user you want to make accept')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true }); // Acknowledge the interaction early

    const mentionedUser = interaction.options.getUser('user');
    const currentDate = new Date().toLocaleDateString();
    const randomCode = generateRandomCode();
    const rowCode = RowCode();
    const randomSeat = getRandomCode();

    function getCurrentISTTime() {
      const ist = moment().tz('Asia/Kolkata').format('h:mm A');
      return ist;
    }

    const currentTime = getCurrentISTTime();
    counter++;
    const randomNumber = Math.floor(Math.random() * 8000) + 1000;

    GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'fonts', 'AQuietSleep.ttf'), 'SemiBold');
    GlobalFonts.registerFromPath(join(__dirname, '..', '..', 'fonts', 'A25-SQUANOVA.ttf'), 'SkCustom');
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
    ctx.font = "33px SemiBold";
    ctx.fillStyle = `#21130d`;
    ctx.fillText(`${randomCode}`, 1020, 280);

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

    // Send the generated image and message to the specified channel
    await channel.send({ files: [attachment], content: `<@${mentionedUser.id}>` });

    // Add the role to the mentioned user
    const roleId = '1046786167644880946'; // Replace with your desired role ID
    const guild = interaction.guild; // Get the guild where the interaction was triggered
    const member = guild.members.cache.get(mentionedUser.id);

    if (member) {
      try {
        await member.roles.add(roleId);
        await interaction.followUp({ content: `Successfully assigned the role to <@${mentionedUser.id}>.`, ephemeral: true });
      } catch (error) {
        console.error(`Failed to add role: ${error}`);
        await interaction.followUp({ content: `Failed to assign the role to <@${mentionedUser.id}>.`, ephemeral: true });
      }
    } else {
      await interaction.followUp({ content: `Could not find the user in this server.`, ephemeral: true });
    }
  },
};
