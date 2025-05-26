/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};