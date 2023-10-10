// Exporter - Manufactuere -> Holder of LC and Presenter
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


async function generatePresentation() {

    try {
        const vcFilePath = await inquirer.prompt({
            type: 'input',
            name: 'vcFileName',
            message: 'Enter JWT VC File name:'
        });
        console.log(vcFilePath);
        const jwtVC = fs.readFileSync('./src/LCService/config/jwt-credentials/' + vcFilePath.vcFileName, 'utf-8');
        //console.log('File content (synchronous):', jwtVC);

        // //Create Presentation from VC JWT
        const applicantDid: DIDWithKeys = dids.applicantDid;
        
        const didEthr = new EthrDIDMethod(ethrProviders.applicantEthrProvider);
        const didResolver = getSupportedResolvers([didEthr, didEthr]);
        didResolver.resolve(applicantDid.did, { accept: 'application/did+json' }).then(data => {
            console.log("Applicants DID resolved !! ");
            const vp = createPresentation(applicantDid.did, [jwtVC]);
            const jwtService = new JWTService();
            const jwtVP = jwtService.signVP(applicantDid, vp).then(data => {
                //console.log(data);
                const filePath = './src/LCService/config/jwt-credentials/VP_' + vcFilePath.vcFileName;

                fs.writeFileSync(filePath, data);
                console.log("JWT VP saved to file -> ", filePath);
                console.log("Now you can send this VP to Exporter (Manufacturer) and Advising bank for verification !!");
            });




        }).catch(err => {
            console.error("Applicants DID could not be resolved");
        });







    } catch (error) {
        console.log("Error generating VP: ", error);
    }




}
generatePresentation();