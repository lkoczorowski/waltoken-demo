const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("WaltokenModule", (m) => {
    const initialSupply = m.getParameter("initialSupply", 1_000_000); // 1 Million Tokens
    const waltoken = m.contract("Waltoken", [initialSupply]); // Deploy with constructor argument

    return { waltoken };
});