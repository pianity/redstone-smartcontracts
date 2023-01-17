module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'js'],

  testPathIgnorePatterns: [
    "/.yalc/",
    "/data/",
    "/_helpers",
  ],

  testEnvironment: 'node',

  "transformIgnorePatterns": [
    "<rootDir>/node_modules/(?!@assemblyscript/.*)"
  ],


  transform: {
    '^.+\\.(ts|js)$': 'ts-jest'
  },

  silent: true
};
