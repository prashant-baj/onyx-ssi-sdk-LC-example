### This hackathon examplifies the usage of Onyx SSI SDK in Trade Finance use case especially issuance, presentation and verification of Letter of Credits (LC)

* This demo uses a private permissioned hyberledger besu network deployed in Azure. Find the deployment process and script under Azure Network folder
* Additionally there are scripts to compile and deploy DIDRegistry Contract under Dapp
* Use case code can be found under src/LCService
* [Presentation for use case](https://github.com/prashant-baj/onyx-ssi-sdk-LC-example/blob/main/Verifiable%20Credentials%20for%20Trade%20Finance.pptx)
* [Demo video](https://drive.google.com/file/d/1pc0B1SBG4JdhM95kzIAuSLgZMz6AO-cm/view?usp=sharing)

#### Based on Onyx SSI SDK (Forked from [Onyx SSI SDK](https://github.com/jpmorganchase/onyx-ssi-sdk)

Create SSI Ecosystems following W3C Standards for [Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) and [DIDs](https://www.w3.org/TR/did-core/)

* Create and verify Verifiable Credentials and Verifiable Presentations
* Support for [did:ethr](https://github.com/decentralized-identity/ethr-did-resolver/blob/master/doc/did-method-spec.md) and [did:key](https://w3c-ccg.github.io/did-method-key/)
* Support for JWT as digital proof
* Support for Verifiable Credential Schemas
