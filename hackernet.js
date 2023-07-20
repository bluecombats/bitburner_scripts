/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
export async function main(ns) {
	var count = 0,i;
	var num_nodes = ns.hacknet.numNodes();
	var hacknetNewNode = ns.hacknet.getPurchaseNodeCost()
	var ram_upgrade, core_upgrade, level_upgrade;
	var ram_min, core_min, level_min;
	while(count<100000){
		count+=1;
		await delay(1000);
		num_nodes = ns.hacknet.numNodes();
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost()
		if(num_nodes == 0){
			ns.hacknet.purchaseNode();
		}
		for(i=0; i<num_nodes; i++){
			//ns.tprint(i);
			//ns.tprint(ns.hacknet.getNodeStats(i));
			/*{"name":"hacknet-node-0"
			,"level":1
			,"ram":1
			,"cores":1
			,"production":1.6082030281605149
			,"timeOnline":1993.8000000002573
			,"totalProduction":3206.4351975468476}*/
			ns.print(i," level:",ns.hacknet.getNodeStats(i)["level"]
			," ram:",ns.hacknet.getNodeStats(i)["ram"]
			," cores:",ns.hacknet.getNodeStats(i)["cores"]
			);
			ram_upgrade = ns.hacknet.getRamUpgradeCost(i,1);
			core_upgrade = ns.hacknet.getCoreUpgradeCost(i,1);
			level_upgrade = ns.hacknet.getLevelUpgradeCost(i,1);
			if(i==0){
				ram_min = ram_upgrade;
				core_min = core_upgrade;
				level_min = level_upgrade;
			}
			if(ram_upgrade < hacknetNewNode*10 && 
			ns.getServerMoneyAvailable("home")> ram_upgrade &&
			ram_min >= ram_upgrade){
				ns.hacknet.upgradeRam(i,1);
				ram_upgrade = ns.hacknet.getRamUpgradeCost(i,1);
				ns.print("node ",i," upgraded ram");
			}
			else if(core_upgrade < hacknetNewNode*10 && 
			ns.getServerMoneyAvailable("home")>core_upgrade &&
			core_min >= core_upgrade){
				ns.hacknet.upgradeCore(i,1);
				core_upgrade = ns.hacknet.getCoreUpgradeCost(i,1);
				ns.print("node ",i," upgraded core");
			}
			else if(level_upgrade < hacknetNewNode && 
			ns.getServerMoneyAvailable("home")> level_upgrade &&
			level_min >= level_upgrade){
				ns.hacknet.upgradeLevel(i,1);
				level_upgrade = ns.hacknet.getLevelUpgradeCost(i,1);
				ns.print("node ",i," upgraded level");
			}
			else if(i == (num_nodes-1) 
			&& ns.getServerMoneyAvailable("home")> hacknetNewNode &&
			ram_upgrade > hacknetNewNode*10 &&
		 	core_upgrade >hacknetNewNode*10 && 
		 	level_upgrade > hacknetNewNode){
				ns.hacknet.purchaseNode();
				ns.print("new node purchased");
			}
		}
	}
}
