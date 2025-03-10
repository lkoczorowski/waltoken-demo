# Issue your first Crypto Token!

The target audience for this tutorial is the absolute beginner. We go through the basics from setting up your environment to deploying your token. 

By the end of this tutorial, you will have:
1. Setup a test and development environment on your machine
2. Setup a local testnet running in a Docker container
3. Mint your own token on your testnet
4. Learn the basics of writing your own smart contracts on Ethereum compatible blockchains 
5. Have everything necessary to deploy on Ethereum and Moonbeam networks

> Note: Deploying on Ethereum requires ETH, and Moonbeam requires GLMR

## Speed Run
If you just wanna see it work quickly, do the following:
> git clone https://github.com/lkoczorowski/waltoken-demo.git

> cd waltoken-demo

> npm install

> npx hardhat compile

> npx hardhat ignition deploy ./ignition/modules/Waltoken.js

## Dependencies to Download
1. [NodeJS](https://nodejs.org/en/download)
    - JavaScript engine that will run the code necessary to issue your token
2. [Docker](https://www.docker.com/products/docker-desktop/) 
    - Manager containers on your computer. Containers are purpose build virtual computers
3. [Git](https://git-scm.com/downloads)
    - Helps you manage your source code
4. [Visual Studio Code](https://code.visualstudio.com/download)
    - File editor to edit your code
4. [Rabby](https://rabby.io)
    - Ethereum Compatible Crypto Wallet
> Note: Some sign-ups are required but the downloads are free

## Setup Your Environment

# testnet and Docker
In a terminal (CMD or PowerShell for windows, bash/sh for Mac/Linux)  execute:
> docker run -it -p 8545:8545 lkoczorowski/hardhat-node
if successful, you will see something like:
```shell
PS C:\Users\User\Documents\test> docker run -it -p 8545:8545 lkoczorowski/hardhat-node
Started HTTP and WebSocket JSON-RPC server at http://0.0.0.0:8545/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
....

Account #19: 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199 (10000 ETH)
Private Key: 0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.
```

## Setup NodeJS Project
Open Visual Studio and open a workspace/folder where you want to keep this project. Once open, click View -> Open Terminal and to initialize your project execute:
> npm init -y
 
### Download necessary packages
> npm install npm install dotenv hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts

### Initialize Hardhat
Hardhat is a popular Ethereum development environment. It simplifies developing, testing, and deploying smart contracts on EVM compatiable networks, like Moonbeam. 
> npx hardhat init

    - Select a JavaScript Project
    - Answer yes to all questions

Hardhat includes a sample smart contract which you'll find at `./contracts/Lock.sol`. This is a simple contract that allows you to withdrawl tokens after a certain date. We can go ahead compile, test, and deploy this sample project to ensure that everything is working.

1. Compile: `npx hardhat compile`
2. Test: `npx hardhat test`
3. Deploy: `npx hardhat ignition deploy ./ignition/modules/Lock.js`

> Note: For windows, you'll use .\forward\slashes when referencing files

If successful, you'll see the message:
```shell
You are running Hardhat Ignition against an in-process instance of Hardhat Network.
This will execute the deployment, but the results will be lost.
You can use --network <network-name> to deploy to a different network.

Hardhat Ignition 🚀

Deploying [ LockModule ]

Batch #1
  Executed LockModule#Lock

[ LockModule ] successfully deployed 🚀

Deployed Addresses

LockModule#Lock - 0x3E0B42b5fbDC6Ad6988d45D6e8Dffccba14B1eb2
```

Congrats! You just deployed your first smart contract! 

Hardhat by default will deploy into a temporary network which is gone when the deploy is finished. This step was only to ensure everything works so far. We'll keep using this setup until near the end where we'll switch to our docker testnet. 

## Configuring our Token
We're going to call our token 'Waltoken'. Feel free to give your token a different name. In the `/contracts` folder create a new file called `Waltoken.sol`. Here's the smart contract to issue your ERC-20 token:
```sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Waltoken is ERC20, Ownable {
    // When this contract is deployed, it will mint the initial supply to the deployer
    constructor(uint256 initialSupply) ERC20("Waltoken", "WALT") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** decimals())); 
    }

    // This function allows the owner to mint tokens to a specific address
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // This function allows the owner to burn tokens from the contract
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
```

On line 9, you can set the name of token and symbol to use. In this example our token is called `Waltoken` and the symbol is `WALT`

We're using the [ERC-20](https://www.investopedia.com/news/what-erc20-and-what-does-it-mean-ethereum/) token standard which is the most common token type on the Ethereum network. It's the easiest and fastest way to get a fungible token online. 

## Writing Some Tests
in the `./test` folder, create `Waltoken.js` with the following tests:
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Waltoken Deployment", function () {
    let Waltoken, waltoken, owner, addr1, addr2;

    beforeEach(async function () {
        // Get signers (test accounts)
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy Waltoken contract with initial supply
        const initialSupply = 1_000_000; //ethers.parseEther("1000000"); // 1M tokens in Wei
        Waltoken = await ethers.getContractFactory("Waltoken");
        waltoken = await Waltoken.deploy(initialSupply);
        await waltoken.waitForDeployment();
    });

    it("Should assign the total supply to the owner", async function () {
        const ownerBalance = await waltoken.balanceOf(owner.address);
        const totalSupply = await waltoken.totalSupply();

        // Check if the owner's balance matches the total supply
        expect(ownerBalance).to.equal(totalSupply);
    });

    it("Should have the correct total supply", async function () {
        const totalSupply = await waltoken.totalSupply();

        // Expect total supply to be exactly 1,000,000 tokens (in Wei)
        expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    });

    it("Should transfer tokens correctly", async function () {
        // Transfer 1000 tokens from owner to addr1
        await waltoken.transfer(addr1.address, ethers.parseEther("1000"));

        // Check balances after transfer
        expect(await waltoken.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
        expect(await waltoken.balanceOf(owner.address)).to.equal(ethers.parseEther("999000"));
    });

    it("Should not allow transfers exceeding balance", async function () {
        await expect(
            waltoken.connect(addr1).transfer(owner.address, ethers.parseEther("2000"))
        ).to.be.revertedWithCustomError(waltoken, "ERC20InsufficientBalance");
    });
});
```

Let's run our tests to make sure everything works as expected:
```shell
npx hardhat test
```
You should see:
```shell
Compiled 7 Solidity files successfully (evm target: paris).
....
  Waltoken Deployment
    ✔ Should assign the total supply to the owner
    ✔ Should have the correct total supply
    ✔ Should transfer tokens correctly
    ✔ Should not allow transfers exceeding balance

  13 passing (605ms)
```

Finally, lets create a deployment script so hardhat knows how to deploy our token. In the example below we'll be minting 1 million tokens. In the `./ignition/modules/` folder, create a `Waltoken.js` file with the following code:
```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("WaltokenModule", (m) => {
    const initialSupply = m.getParameter("initialSupply", 1_000_000); // 1 Million Tokens
    const waltoken = m.contract("Waltoken", [initialSupply]); // Deploy with constructor argument

    return { waltoken };
});
```
Now lets recompile and redeploy what we've created so far to see that eveything works:
```shell
npx hardhat clean
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/Waltoken.js
```

If successful, you should see the following:
```shell
You are running Hardhat Ignition against an in-process instance of Hardhat Network.
This will execute the deployment, but the results will be lost.
You can use --network <network-name> to deploy to a different network.

Hardhat Ignition 🚀

Deploying [ WaltokenModule ]

Batch #1
  Executed WaltokenModule#Waltoken

[ WaltokenModule ] successfully deployed 🚀

Deployed Addresses

WaltokenModule#Waltoken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Congrats! You've just minted a million of your crypto tokens! Now lets deploy them to our container so that they persist and we can attach them to a wallet like [MetaMask](https://metamask.io/) or [Rabby](https://rabby.io/) 

To connect to our docker container that's running a hardhat test network, we need to update our hardhat configuration file to point to our container. to do that, open `hardhat.config.js` and add the our network. When done, the config file should look like this:

```javascript
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
```

Now to deploy to our docker network, execute the following:
```shell
npx hardhat ignition deploy ./ignition/modules/Waltoken.js --network docker
```
If successful, you'll see:
```shell
Hardhat Ignition 🚀

Deploying [ WaltokenModule ]

Batch #1
  Executed WaltokenModule#Waltoken

[ WaltokenModule ] successfully deployed 🚀

Deployed Addresses

WaltokenModule#Waltoken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Write down this address! `0x5FbDB2315678afecb367f032d93F642f64180aa3` is the location of your contract that you'll be adding to your wallet to see your tokens. Your contract address will most likely be different.

## Connecting to Rabby 
We'll go through connecting to a Rabby wallet. If you're using MetaMask the steps will be similar. First lets get all the information we need. We need:
1. Chain ID: `31337`
2. Network Name: `Docker`
3. RPC URL: `http://localhost:8545`
4. Currency Symbol: `ETH`
5. Contract Address: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (yours may be different)
6. Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
> Note: This key is *NOT* private! Do not put any real tokens or money in this account, it will get drained!

This private key is from the first account that hardhat node produces. Everyone that uses hardhat has this private key, so it's not really private. 

Let's first connect your wallet to this test account. After install the Rabby browser extension, you'll get the option to create a new address or connect to an existing one:
1. Click "I already have an address"
2. Click "Private Key"
3. Paste the private key above 
4. Click "Confirm"
5. Set a password
6. Click "Confirm"
7. Click "Get Started"
8. Pin the Rabby extension to your extension toolbar so it's easier to access
9. Click "More" from the main screen of the extension
10. Scroll to "Settings" and click "Add Custom Network"
11. Click "Add Custom Network"
11. Enter Chain ID, Network Name, RPC URL, and Currency Symbol
12. Click "Confirm"
13. Click "X" to close the current window 

Now your wallet is connect to your docker node. The final step is to tell Rabby where your WALT tokens are by providing the smart contract address from the prevoius deployment step. 

1. Click the right arrow `>` 
2. Click "Custom Network"
3. Click "+ Token"
4. In token address, enter the address of your smart contract from the previous step. eg: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
5. Under "Found Token" choose "WALT"
6. Click "Confirm"

Congrats! Now you have 1,000,00 WALTs and ~9999 ETH on your test node!

## Next Steps

There are a few different things you can do from here

1. Deploy your coin to the Ethereum or Moonbeam network by adding these networks to your `hardhat.config.js` file.
2. Add more complexity to your coin
3. Explore other possibilities

My recommendation is to check our Moonbeam, it has much lower gas fees, access to other chains within the Polkadot network, and full support for the Ethereum tool chain -- like this example demonstrtes. 

Happy Minting!