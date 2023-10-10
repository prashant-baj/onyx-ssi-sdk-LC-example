
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
} from "../";


// Initialize Ajv validator
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);
var lcDID: DIDWithKeys;


// Function to validate LC data
async function validateLCData() {
  const valid = validate(lcData);
  console.log(lcData);
  if (valid) {
    console.log('LC data is valid');
    //console.log(lcData);    
  } else {
    console.error('LC data is invalid. Please check the errors:');
    console.error(validate.errors);
  }
}

/**
 * Below operation is intended to add custome attributes to the LC DID for example confirming bank.
 * Usefulness of this apprach is still to be proven as custom attributes are not yet retreived.
 */
function setConfirmingBank() {

  //confirming bank setAttribute
  const didEthr = new EthrDIDMethod(ethrProviders.lcIssuerEthrProvider);
  const didResolver = getSupportedResolvers([didEthr]); 
  
  const confirmingBankDid: DIDWithKeys = dids.confirmingBankDid;
  console.log("Setting custom attribute of Confirming Bank");
  const tx = didEthr.setAttribute(lcDID, "ConfirmingBank", "asdf").then(res => {
    console.log(res);
    didResolver.resolve(lcDID.did, { accept: 'application/did+json' }).then(data => {
      console.log("LC DID resolved !! ");
      console.dir(data, { depth: null }); 
    }).catch(err => {
      console.error("LC DID could not be resolved");
    });
  });
}

// Function to generate JWT VC
function generateVC() {
  const valid = validate(lcData);

  if (valid) {
    console.log('LC data is valid:');
    //console.log(lcData);
    //console.log(ethrProviders.lcIssuerEthrProvider);

    const applicantDid: DIDWithKeys = dids.applicantDid;
    const lcIssuerDid: DIDWithKeys = dids.lcIssuerDid;


    const didEthr = new EthrDIDMethod(ethrProviders.lcIssuerEthrProvider);
    const didResolver = getSupportedResolvers([didEthr]);

    didResolver.resolve(applicantDid.did, { accept: 'application/did+json' }).then(data => {
      console.log("Applicants DID resolved !! ");


      const lcDid = didEthr.create().then(res => {
        lcDID = res;
        console.dir(lcDID, { depth: null }); 
        const additionalParams = {
          id: res.did,
          expirationDate: "2024-01-01T19:23:24Z",
        }

        const subjectData = lcData;

        const vc = createCredential(
          lcIssuerDid.did, applicantDid.did, subjectData, ["LetterOfCreditCredential"], additionalParams);

        //console.log("******************** Verifiable Credential of LC *********************");
        console.dir(vc, { depth: null });

        const jwtService = new JWTService()
        const jwtVC = jwtService.signVC(lcIssuerDid, vc).then(jwt => {
          //console.log("******************** JWT Verifiable Credential of LC *********************");
          //console.log(jwt);
          const filePath = './src/LCService/config/jwt-credentials/' + additionalParams.id.replace(/:/g, '_');
          const currentPath = process.cwd();
          fs.writeFileSync(filePath, jwt);
          console.log("JWT VC saved to file -> ", filePath);
          console.log("Now you can present this VC to manufacturer and confirm your order !!");
          //setConfirmingBank();
        });

      });


    }).catch(err => {
      console.error("Applicants DID could not be resolved");
    });
    
  } else {
    console.error('LC data is invalid. Please check the errors:');
    console.error(validate.errors);
  }



}




generateVC();


