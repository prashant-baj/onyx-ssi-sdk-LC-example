# Testing and playing with OffersChain blockchain

## Important building blocks of the DAPP
- deployment script
- run file to invoke contract methods
- subscriber script to subscriv=be to contract events

### Configurations - 
- app-config.json - prepare peers data using the values created while network was deployed. Copy respective values from AKV.
- payloads.json - Test payloads for invoking contract methods 

### Contracts - 
- Use truffle to author and build the contracts
> truffle build

### Deployment - 
> node .\deployContract.js 
Output should be something like below - 
![image](https://user-images.githubusercontent.com/26347728/210831863-1c1d1034-9135-4534-bd78-12ad96df71c3.png)

Additionally two interface files are created for later use in the application. You can find the last deployed contract address in the files - 
- deployedMembersContracts.json
- deployedOffersContracts.json

### Add members - 
Typically members are expected to be added by network leader. Leader node configuration is already in app-config.json

When a new members is added to network, an event is emitted for other participants so that they can take note of it for future use.
Start couple of member subscribers in seperate terminals - 
> node .\subscribeMembers.js acquirer
> node .\subscribeMembers.js manufacturer

Above commands will connect to acquirer and manufacturer nodes using web-sockets and start listening to Member events


Add the network players - 

> node run addMember network-leader
> node run addMember merchant
> node run addMember upi-issuer
> node run addMember acquirer
> node run addMember manufacturer

If the transaction is successful, event subscriber will receive event like below - 
![image](https://user-images.githubusercontent.com/26347728/210834852-a42e7d95-c754-4311-a031-26186f1b3d98.png)

### Propose Offer - 
Now members are ready to send Offer proposals to members publicly or privately - 
#### Public Offers 
Let merchant propose an offer. Let UPI Issuer and Acquirer listen to Offers events - 
> node .\subscribeOffers.js upi-issuer
> node .\subscribeOffers.js acquirer
> node run proposeOffer merchant

If the transaction is successful, output lookd like below - 
![image](https://user-images.githubusercontent.com/26347728/210836375-bd1248b2-6ad5-4c0a-ad6e-27b0032b9c4d.png


observe the event received to Acquirer and UPI Issuer. A subvention scheme is also there so that it can be used in later settlement and reconciliation process.
![image](https://user-images.githubusercontent.com/26347728/210836445-47f30d35-f1e9-4b82-962b-92648def9151.png)

### Now members received information on merchants offer proposal. Issuer and Acquirer are willing to accept.
> node run acceptOffer acquirer
> node run acceptOffer upi-issuer

A successful acceptance - 
![image](https://user-images.githubusercontent.com/26347728/210837468-f9a71887-3811-4a02-abcb-b18f62a8fb04.png)

An event is also propogated when an Offer is accepted. Once accepted members are ready to take the business process forward for extending offers to customers.

### Transactions  - TBD - 
Once the offers are accepted, Members can make them available to customers primarily merchants. 
In some cases, transactions can be validated from block chain itself.
Settlement parties can use the Offer and subvention data for settlement and reconciliation process.



