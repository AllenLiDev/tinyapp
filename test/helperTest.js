const { assert } = require('chai');

const { checkForUserExists } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('check if user already exists function', () => {
  it('should return a user with valid email', () => {
    const user = checkForUserExists("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert((user === expectedOutput), "user found with valid email");
  });
  it('unregistered email returns false', () => {
    const user = checkForUserExists("user999@example.com", testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert((user === expectedOutput), "unregistered user not found");
  });
});
