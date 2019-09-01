module.exports = {
  clearMocks: true,
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/@hacknlove'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
}
