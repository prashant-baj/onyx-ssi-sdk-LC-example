
const inquirer = require('inquirer');
const Ajv = require('ajv');
const schema = require('./schema/LC.json'); // Replace with the path to your schema file
const lcData = require('./config/data.json');
const ethrProviders = require('./config/providers.json');
const dids = require('./config/did.json');
import fs from "fs";
import {
  EthrDIDMethod,
  KeyDIDMethod,
  createAndSignPresentationJWT,
  getSubjectFromVP,
  SchemaManager,
  createCredential,
  JWTService,
  createPresentation,
  getSupportedResolvers,
  verifyCredentialJWT,
  verifyPresentationJWT,
  DIDWithKeys,
  KeyPair,
  KEY_ALG
} from "..";

async function addDelegate() {

    const confirmingBankDid: DIDWithKeys = dids.confirmingBankDid;
    const lcIssuerDid: DIDWithKeys = dids.lcIssuerDid;

    const didEthr = new EthrDIDMethod(ethrProviders.lcIssuerEthrProvider);    
    const didResolver = getSupportedResolvers([didEthr]);

    didResolver.resolve(confirmingBankDid.did, { accept: 'application/did+json' }).then(data => {
      console.log("Confirming DID resolved !! ");
      // Ideally delegate address should be an input. Hard coded for testing purpose only.
      const tx = didEthr.addDelegate(lcIssuerDid,"ConfirmingBank","0xfe3b557e8fb62b89f4916b721be55ceb828dbd73").then(res => {
           console.log(res);
           console.log("DID Delegation successful");      
         });      
    }).catch(err => {
      console.error("Applicants DID could not be resolved");
    });  
}

addDelegate();
