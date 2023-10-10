var web3 = require("web3");
const Web3Quorum = require("web3js-quorum");
let fs = require("fs");

let appConfigFile = fs.readFileSync("../app-config.json");
let appConfig = JSON.parse(appConfigFile);
const web3http = new web3('http://'+appConfig.nodeAddress+"/network-leader");
const web3Quorum = new Web3Quorum(web3http);
const address = appConfig.ownerAddress;
const deployedRegistryContractsPath = appConfig.deployedRegistryContractsPath+"";
const registryContractABIPath = appConfig.registryContractABIPath+"";

const deployRegistryContract = async () => {

    web3http.eth.getAccounts((err, accounts) =>{
      
      console.log(accounts);
    });
  

    /*** registry contract */    
    let rawRegistryContract = JSON.parse(fs.readFileSync(registryContractABIPath));
    //console.log(rawRegistryContract);    
    //var accountNonce =  await web3Quorum.eth.getTransactionCount(address,'pending');//'0x' + (await web3Quorum.eth.getTransactionCount(address) + 1).toString(16)
    //console.log("accountNonce>> "+accountNonce);
    //console.log("Estimated gas price "+ await web3Quorum.eth.getGasPrice());
    //console.log("Pending Tr - "+ web3Quorum.eth.getPendingTransactions());
    //nonse = accountNonce+3
    //console.log(web3.utils.numberToHex(nonse));
    const rawTxOptionsRegistry = {
        from: address,
        to: null, //public tx
        value: "0x00",
        data: rawRegistryContract.bytecode,//'0x'+contractBin+contractInit, // contract binary appended with initialization value
        gasPrice: "0x0", //ETH per unit of gas
        gas: "3000000", //max number of gas units the tx is allowed to use,
		//privateFor: ['S6M2F+FWERzlPxjjZ7jrcdvBYdATwa0mkfioAzYmNBI=', '3febRQjz+NyDVEJ3BdQMpLEzNHPulSLlrwmhdQUwvQ4=', 'fqc1uKtsr0/bnTC+Fjgem1Vd3LU8ZpYvt/efXc4eR2o=', 'n5c29pG8WuvfKOp9IVFweMWIY9lwg6tqGzyYB2tyVSY=' ]
      };
    console.log(appConfig.privateKey);
    const signedTxRegistry = await web3Quorum.eth.accounts.signTransaction(rawTxOptionsRegistry, appConfig.privateKey);
    console.log("Connected");
    const registrarContractDeployed = await web3Quorum.eth.sendSignedTransaction(signedTxRegistry.rawTransaction);
    console.log("Registrar transactionHash: " + registrarContractDeployed.transactionHash);
    console.log("Registrar contractAddress: " + registrarContractDeployed.contractAddress);
    const registrarContract = await new web3http.eth.Contract(rawRegistryContract.abi);
    

    /*** generate deployedContracts.json */
    
    let deployedContractsJson = {
        
        registryContract: registrarContractDeployed.contractAddress,
       
        transactionReceipt: registrarContractDeployed

    };
    
    let data = JSON.stringify(deployedContractsJson, null, "\t");
    
    fs.writeFileSync(deployedRegistryContractsPath, data);
    console.log("Saved Contract interface to - "+deployedRegistryContractsPath);
    
   
}

const deployContract = async () => {
    await deployRegistryContract();    
}

deployContract();
const txCount = async () => {
    var accountNonce =  await web3Quorum.eth.getTransactionCount(address,'pending');//'0x' + (await web3Quorum.eth.getTransactionCount(address) + 1).toString(16)
    console.log("accountNonce>> "+accountNonce);
}
