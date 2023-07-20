/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function Moneyformat(money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return "$"+String(moneySplit).substr(0,7)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substr(0,7)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return "$"+String(moneySplit).substr(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return "$"+String(moneySplit).substr(0,7)+"k";
    }else if(money<Math.pow(10,3)){
        return "$"+String(money).substr(0,7);
    }
    else{
        return "$"+String(money);
    }
}
export async function main(ns) {
	//requires formulas.exe
	var count = 0,i;
	var hackNetConstants = ns.formulas.hacknetNodes.constants();
	//ns.tprint(hackNetConstants);
	/*"MoneyGainPerLevel":1.5
	,"BaseCost":1000
	,"LevelBaseCost":1
	,"RamBaseCost":30000
	,"CoreBaseCost":500000
	,"PurchaseNextMult":1.85
	,"UpgradeLevelMult":1.04
	,"UpgradeRamMult":1.28
	,"UpgradeCoreMult":1.48
	,"MaxLevel":200
	,"MaxRam":64
	,"MaxCores":16*/
	var mults = ns.getPlayer()['mults'];
	/*"hacknet_node_money":5.0016962980391915
	,"hacknet_node_purchase_cost":0.35550671573103787
	,"hacknet_node_ram_cost":0.46471466108632403
	,"hacknet_node_core_cost":0.46471466108632403
	,"hacknet_node_level_cost":0.3950074619233756*/
	//var mults = ns.getHacknetMultipliers();
	/*"production":5.0016962980391915
	,"purchaseCost":0.35550671573103787
	,"ramCost":0.46471466108632403
	,"coreCost":0.46471466108632403
	,"levelCost":0.3950074619233756 */
	var purchaseMulti = mults['hacknet_node_money'];
	var ramMulti = mults['hacknet_node_ram_cost'];
	var coreMulti = mults["hacknet_node_core_cost"];
	var levelMulti = mults["hacknet_node_level_cost"];
	var num_nodes = ns.hacknet.numNodes();
	var ram_upgrade, core_upgrade, level_upgrade, level_money_gain, ram_money_gain, core_money_gain;
	var ram_min, core_min, level_min, hacknetNewNode;
	while(count<100000){
		count+=1;
		await delay(1000);
		if(num_nodes == 0){
			ns.hacknet.purchaseNode();
		}
		num_nodes = ns.hacknet.numNodes();
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost();
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
			level_upgrade = ns.formulas.hacknetNodes.levelUpgradeCost(
				ns.hacknet.getNodeStats(i)["level"]
				,1
				,levelMulti
			);
			level_money_gain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]+1
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			ram_upgrade = ns.formulas.hacknetNodes.ramUpgradeCost(
				ns.hacknet.getNodeStats(i)["ram"]
				,1
				,ramMulti
			);
			ram_money_gain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]+1
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			core_upgrade = ns.formulas.hacknetNodes.coreUpgradeCost(
				ns.hacknet.getNodeStats(i)["cores"]
				,1
				,coreMulti
			);
			core_money_gain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]+1
				,purchaseMulti
			);
			ns.print(i," level:",ns.hacknet.getNodeStats(i)["level"]
			," upgrade: ",Moneyformat(level_upgrade)
			," gain: ",Moneyformat(level_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ",level_upgrade/(level_money_gain - ns.hacknet.getNodeStats(i)["production"]));
			ns.print(i," ram:",ns.hacknet.getNodeStats(i)["ram"]
			," upgrade: ",Moneyformat(ram_upgrade)
			," gain: ",Moneyformat(ram_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ", ram_upgrade/(ram_money_gain - ns.hacknet.getNodeStats(i)["production"]));
			ns.print(i," cores:",ns.hacknet.getNodeStats(i)["cores"]
			," upgrade ",Moneyformat(core_upgrade)
			," gain ",Moneyformat(core_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ",core_upgrade/(core_money_gain - ns.hacknet.getNodeStats(i)["production"]));
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
