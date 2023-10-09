// Exporters Bank - Acquirer / Advising Bank -> Verifier of LC
const inquirer = require('inquirer');
const Ajv = require('ajv');
const schema = require('./schema/LC.json'); // Replace with the path to your schema file
const lcData = require('./config/data.json');
const ethrProviders = require('./config/providers.json');
const dids = require('./config/did.json');
import { JwtPayload } from './config/config';
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
    KEY_ALG,
    getCredentialsFromVP,
    verifyDID,
    DIDMethod

} from "../";

import {
    VerifiableCredential,
    VerifiablePresentation,
    verifyCredential,
    VerifyCredentialOptions,
    verifyPresentation,
    VerifyPresentationOptions,
    VerifiedPresentation,
    verifyPresentationPayloadOptions,
    JwtPresentationPayload,
} from "did-jwt-vc"
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
        const didEthr = new EthrDIDMethod(ethrProviders.advisingBankEthrProvider);
        const didResolver = getSupportedResolvers([didEthr]);

        decodeVP(jwtVP, didEthr);
        
        //const resultVp = await verifyPresentation(jwtVP, didResolver)
        //console.log(resultVp)

    } catch (error) {
        console.log(error);
    }

}

const decodeVP = async (signedVpJwt: string, didEthr: DIDMethod) => {

    const didResolver = getSupportedResolvers([didEthr]);

    try {
        const vcJwt = getCredentialsFromVP(signedVpJwt)[0].toString();
        const verificationCredentialPolicies = {
            issuanceDate: true,
            expirationDate: true,
            format: true,
        };
        const isVcJwtValid = await verifyCredentialJWT(
            vcJwt,
            didResolver,
            verificationCredentialPolicies
        );

        if (isVcJwtValid) {
            const jwtService = new JWTService()
            const vc = jwtService.decodeJWT(vcJwt)?.payload as JwtPayload;
            console.log(vc);
            try {
                console.log("\nVerifying VC\n");

                const isVcVerified = await verifyDID(vc.jti!, didResolver);
                console.log(`\nVerification status: ${isVcVerified}\n`);
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log("Invalid VC JWT");
        }

    } catch (err) {

        console.log(
            "\nTo run this script you must have a valid VP and a valid signed VP JWT\n"
        );

    }

};


verifyLCPresentation();