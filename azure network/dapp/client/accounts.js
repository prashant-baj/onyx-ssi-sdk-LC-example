var web3 = require("web3");
const Web3Quorum = require("web3js-quorum");
let fs = require("fs");

let appConfigFile = fs.readFileSync("../app-config.json");
let appConfig = JSON.parse(appConfigFile);
console.log(appConfig.nodeAddress);
const web3http = new Web3Quorum(new web3('http://'+appConfig.nodeAddress+'/network-leader'));


console.log(web3http.eth.accounts.create());

//console.log(web3http.eth.getBlockNumber());
web3http.eth.getBlockNumber().then((num) => {
    console.log(num);
    
});

// web3http.eth.getAccounts((err, accounts) =>{
//     console.log(accounts);
// });

// web3http.eth.getBlockNumber().then((num) => {
//     console.log(num);
    
// });