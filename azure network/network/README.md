
# How to deploy identitychain in Azure cloud
- Steps to deploy a "near production grade" Besu private permissioned network in Azure cloud.

## Steps to deploy bring up network
### Deploy infrastrcture using arm
#### Run below commands
> az group create --name identitychain --location "centralindia"
- In azure portal, Using ** Build your own template in the editor**, create infra resources. Copy the template from ./network/azure/arm/azuredeploy.json.
Example after resources are created - 
![image](https://user-images.githubusercontent.com/26347728/210839043-dfd2f2f3-b291-46ec-b248-f065a45b73b3.png)

- Use "besu" as Bc Client name
- Create all the resources. This will priamrily deploy a vnet, kubernetes cluster, AKV, ACR and Managed Identity
- Copy - besu-dev-hq6q2mog-cluster, Managed Identity Name, Client Id of managed Identity, AKV name, subscription

- Replace AKS cluster name and managed identity name in below example before running
> ./azure/scripts/bootstrap.sh "identitychain" "besu-dev-7isuqgge-cluster" "besu-dev-7isuqgge-ops-identity" "quorum"
This step will configure AKS to use managed identities and deploy CSI drivers. This may take up to 10 minutes

Verify CSI drivers and providers installed
> kubectl get pods --namespace kube-system

#### Next, replace some of credentials in Helm values files.
- Under Azure replace the values above copied as in below example
- Files to be changed 
- Under helm/values bootnode.yml, genesis-besu.yml, validator.yml and txnode.yml
- helm/charts/besu-node/Values.yaml
- helm/charts/besu-genesis/Values.yaml

Example values to be changed in above files

  identityClientId: a920a853-2190-4598-99ee-2ec053eb928a
  
  keyvaultName: besu-dev-7isuqgge-vault
  
  tenantId: f9e879fc-5f3d-4ff3-8db7-262ef73edab4
  
  subscriptionId: ccf62437-546d-4fdc-12zc4-8c1cbf1a4d2b
  
### Next deploy Prometheus for kubernetes observability. Run below commands cone by one.
> cd helm
> helm repo add stable https://charts.helm.sh/stable
> helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
> helm repo update
> helm dependency update ./charts/blockscout

> helm install monitoring prometheus-community/kube-prometheus-stack --version 34.10.0 --namespace=quorum --values ./values/monitoring.yml --wait
> kubectl --namespace quorum apply -f  ./values/monitoring/

> helm install quorum-monitoring-ingress ingress-nginx/ingress-nginx --namespace quorum --set controller.ingressClassResource.name="monitoring-nginx" --set controller.ingressClassResource.controllerValue="k8s.io/monitoring-ingress-nginx" --set controller.replicaCount=1 --set controller.nodeSelector."kubernetes\.io/os"=linux --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux --set controller.service.externalTrafficPolicy=Local 

>kubectl apply -f ../ingress/ingress-rules-monitoring.yml

Get the external IP of monitoring ingress
>kubectl get service quorum-monitoring-ingress-ingress-nginx-controller --namespace quorum

##### Varify prometheus is running 
http://<INGRESS_IP>
admin, password

### Next deploy Besu quorum blockchain network. Run below commands one by one 
> helm install genesis ./charts/besu-genesis --namespace quorum --create-namespace --values ./values/genesis-besu.yml

> helm install bootnode-1 ./charts/besu-node --namespace quorum --values ./values/bootnode.yml

> helm install validator-1 ./charts/besu-node --namespace quorum --values ./values/validator.yml
> 
> helm install validator-2 ./charts/besu-node --namespace quorum --values ./values/validator.yml
> 
> helm install validator-3 ./charts/besu-node --namespace quorum --values ./values/validator.yml
> 
> helm install validator-4 ./charts/besu-node --namespace quorum --values ./values/validator.yml


> helm install network-leader ./charts/besu-node --namespace quorum --values ./values/txnode.yml
 
> helm install manufacturer ./charts/besu-node --namespace quorum --values ./values/txnode.yml
 
> helm install upi-issuer ./charts/besu-node --namespace quorum --values ./values/txnode.yml
 
> helm install merchant ./charts/besu-node --namespace quorum --values ./values/txnode.yml
 
> helm install acquirer ./charts/besu-node --namespace quorum --values ./values/txnode.yml


> helm install quorum-network-ingress ingress-nginx/ingress-nginx --namespace quorum --set controller.ingressClassResource.name="network-nginx" --set controller.ingressClassResource.controllerValue="k8s.io/network-ingress-nginx" --set controller.replicaCount=1 --set controller.nodeSelector."kubernetes\.io/os"=linux --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux --set controller.admissionWebhooks.patch.nodeSelector."kubernetes\.io/os"=linux --set controller.service.externalTrafficPolicy=Local --set controller.config.proxy_socket_keepalive="on"

> kubectl apply -f ../ingress/ingress-rules-besu.yml

> kubectl get service quorum-network-ingress-ingress-nginx-controller --namespace quorum

### Next, install Quorum Explorer to observe the node activities
> helm install blockscout ./charts/blockscout --namespace quorum --values ./values/blockscout-besu.yml

> helm install quorum-explorer ./charts/explorer --namespace quorum --values ./values/explorer-besu.yaml



### Use below cammnd to observe pods are running
> kubectl get pods --namespace quorum

Also see in portal -

![image](https://user-images.githubusercontent.com/26347728/210839417-2431cb64-a0c7-4c96-863a-84a937ba82e0.png)



### Browse the network http://<INGRESS_IP>/explorer
You should be able to see something like below - 


![image](https://user-images.githubusercontent.com/26347728/210840155-34fd948a-4bd2-4111-a14d-a6db0e9419bc.png)



#### Note: For more detailed information, please check https://besu.hyperledger.org/en/stable/private-networks/tutorials/kubernetes/

There sre some changes done in the examples for this PoC
