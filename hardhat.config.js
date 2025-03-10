require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    docker: {
      name: "docker",
      url: "http://localhost:8545",
    },
  },
};
