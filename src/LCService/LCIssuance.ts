
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

// Function to generate JWT VC
async function generateVC() {
  const valid = validate(lcData);

  if (valid) {
    console.log('LC data is valid:');
    //console.log(lcData);
    //console.log(ethrProviders.lcIssuerEthrProvider);

    const applicantDid: DIDWithKeys = dids.applicantDid;
    const lcIssuerDid: DIDWithKeys = dids.lcIssuerDid;

    applicantDid.keyPair.algorithm = KEY_ALG.ES256K;
    lcIssuerDid.keyPair.algorithm = KEY_ALG.ES256K;


    const didEthr = new EthrDIDMethod(ethrProviders.lcIssuerEthrProvider);
    //const didKey = new KeyDIDMethod()
    const didResolver = getSupportedResolvers([didEthr]);

    didResolver.resolve(applicantDid.did, { accept: 'application/did+json' }).then(data => {
      console.log("Applicants DID resolved !! ");

      const lcDid = didEthr.create().then(res => {
        const additionalParams = {
          id: res.did,
          expirationDate: "2024-01-01T19:23:24Z",
        }

        const subjectData = lcData;

        const vc = createCredential(
          lcIssuerDid.did, applicantDid.did, subjectData, ["LetterOfCreditCredential"], additionalParams);

        //console.log("******************** Verifiable Credential of LC *********************");
        //console.log(JSON.stringify(vc, null, 2))

        const jwtService = new JWTService()
        const jwtVC = jwtService.signVC(lcIssuerDid, vc).then(jwt => {
          //console.log("******************** JWT Verifiable Credential of LC *********************");
          //console.log(jwt);
          const filePath ='./src/LCService/config/jwt-credentials/'+additionalParams.id.replace(/:/g, '_');
          const currentPath = process.cwd();          
          fs.writeFileSync(filePath, jwt);
          console.log("JWT VC saved to file -> ",filePath);
          console.log("Now you can present this VC to manufacturer and confirm your order !!");
        });
        
      });
    }).catch(err => {
      console.error("Applicants DID could not be resolved");
    });

    // const tx = didEthr.setAttribute(lcIssuerDid,"name","Prashant").then(res => {
    //   console.log(res);      
    // });

    // const tx = didEthr.revokeAttribute(applicantDid,"name","Prashant").then(res => {
    //   console.log(res);
    // });

    

  } else {
    console.error('LC data is invalid. Please check the errors:');
    console.error(validate.errors);
  }

 
  
}

generateVC();
