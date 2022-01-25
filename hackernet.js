/** @param {NS} ns **/
export async function main(ns) {
	var count = 0;
	while(count<1000){
	count+=1;
	var numNodes = ns.hacknet.numNodes();
	var hacknetNewNode = ns.hacknet.getPurchaseNodeCost()
	var RamUpgrade, CoreUpgrade, LevelUpgrade;
	var RamMin, CoreMin, LevelMin;
	for(var i=0; i<numNodes; i++){
		//ns.tprint(i);
		//ns.tprint(ns.hacknet.getNodeStats(i));
		/*{"name":"hacknet-node-0"
		,"level":1
		,"ram":1
		,"cores":1
		,"production":1.6082030281605149
		,"timeOnline":1993.8000000002573
		,"totalProduction":3206.4351975468476}*/
		RamUpgrade = ns.hacknet.getRamUpgradeCost(i,1);
		CoreUpgrade = ns.hacknet.getCoreUpgradeCost(i,1);
		LevelUpgrade = ns.hacknet.getLevelUpgradeCost(i,1);
		if(i==0){
			RamMin = RamUpgrade;
			CoreMin = CoreUpgrade;
			LevelMin = LevelUpgrade;
		}
		if(RamUpgrade < hacknetNewNode*10 && 
		ns.getServerMoneyAvailable("home")> RamUpgrade &&
		RamMin >= RamUpgrade){
			ns.hacknet.upgradeRam(i,1);
			RamUpgrade = ns.hacknet.getRamUpgradeCost(i,1);
		}
		if(CoreUpgrade < hacknetNewNode*10 && 
		ns.getServerMoneyAvailable("home")>CoreUpgrade &&
		CoreMin >= CoreUpgrade){
			ns.hacknet.upgradeCore(i,1);
			CoreUpgrade = ns.hacknet.getCoreUpgradeCost(i,1);
		}
		if(LevelUpgrade < hacknetNewNode && 
		ns.getServerMoneyAvailable("home")> LevelUpgrade &&
		LevelMin >= LevelUpgrade){
			ns.hacknet.upgradeLevel(i,1);
			LevelUpgrade = ns.hacknet.getLevelUpgradeCost(i,1);
		}
		if(i == (numNodes-1) 
		&& ns.getServerMoneyAvailable("home")> hacknetNewNode &&
		RamUpgrade > hacknetNewNode*10 &&
		 CoreUpgrade >hacknetNewNode*10 && 
		 LevelUpgrade > hacknetNewNode){
			ns.hacknet.purchaseNode();
		}
	}
	}
}
