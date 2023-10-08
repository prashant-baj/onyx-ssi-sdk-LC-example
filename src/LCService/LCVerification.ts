// Exporters Bank - Acquirer / Advising Bank -> Verifier of LC
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
import { VerifiableCredential, VerifiablePresentation, verifyCredential, VerifyCredentialOptions, verifyPresentation, VerifyPresentationOptions } from "did-jwt-vc"
import { Resolvable } from 'did-resolver';


export async function verifyLCPresentation() {

    try {
        const vpFilePath = await inquirer.prompt({
            type: 'input',
            name: 'vpFileName',
            message: 'Enter JWT VC File name:'
        });
        console.log(vpFilePath);
        const jwtVP = fs.readFileSync('./src/LCService/config/jwt-credentials/' + vpFilePath.vpFileName, 'utf-8');


        const applicantDid: DIDWithKeys = dids.applicantDid;
        applicantDid.keyPair.algorithm = KEY_ALG.ES256K;
        

        const didEthr = new EthrDIDMethod(ethrProviders.advisingBankEthrProvider);
        const didResolver = getSupportedResolvers([didEthr]);

        const resultVp = await verifyLCPresentationJWT(jwtVP, didResolver)
        console.log(resultVp)

    } catch (error) {
        console.log(error);
    }

}

export async function verifyLCPresentationJWT(
    vp: VerifiablePresentation,
    didResolver: Resolvable,
    options?: VerifyPresentationOptions
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): Promise<boolean> {
    if (typeof vp === 'string') {
        const verified = await verifyPresentation(vp, didResolver, options)
        console.log(verified.payload.aud);
        return verified.verified
    }
    throw TypeError('Ony JWT supported for Verifiable Presentations')

}

verifyLCPresentation();