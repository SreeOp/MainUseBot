async function setUserRoles(member, addRoles = [], removeRoles = []) {
  try {
    await member.roles.add(addRoles);
    await member.roles.remove(removeRoles);
  } catch (error) {
    console.error('Error managing roles:', error);
  }
}

module.exports = { setUserRoles };
