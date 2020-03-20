const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    let char = chars[Math.floor((Math.random() * 26))];
    randomString += char;
  }
  return randomString;
};

const checkForUserExists = (email, database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user].id;
    }
  }
  return false;
};

const urlsForUser = (userID, database) => {
  let myUrls = {};
  for (const url in database) {
    if (database[url].userID === userID) {
      myUrls[url] = database[url];
    }
  }
  return myUrls;
};

module.exports = { generateRandomString, checkForUserExists, urlsForUser };
