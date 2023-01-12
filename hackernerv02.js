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
	var count = 0;
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
	var numNodes = ns.hacknet.numNodes();
	var ramUpgrade, coreUpgrade, levelUpgrade, levelMoneyGain, ramMoneyGain, coreMoneyGain;
	var ramMin, coreMin, levelMin, hacknetNewNode;
	while(count<100000){
		count+=1;
		await delay(1000);
		if(numNodes == 0){
			ns.hacknet.purchaseNode();
		}
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost();
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
			levelUpgrade = ns.formulas.hacknetNodes.levelUpgradeCost(
				ns.hacknet.getNodeStats(i)["level"]
				,1
				,levelMulti
			);
			levelMoneyGain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]+1
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			ramUpgrade = ns.formulas.hacknetNodes.ramUpgradeCost(
				ns.hacknet.getNodeStats(i)["ram"]
				,1
				,ramMulti
			);
			ramMoneyGain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]+1
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			coreUpgrade = ns.formulas.hacknetNodes.coreUpgradeCost(
				ns.hacknet.getNodeStats(i)["cores"]
				,1
				,coreMulti
			);
			coreMoneyGain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]+1
				,purchaseMulti
			);
			ns.print(i," level:",ns.hacknet.getNodeStats(i)["level"]
			," upgrade: ",Moneyformat(levelUpgrade)
			," gain: ",Moneyformat(levelMoneyGain - ns.hacknet.getNodeStats(i)["production"])
			," %: ",levelUpgrade/(levelMoneyGain - ns.hacknet.getNodeStats(i)["production"]));
			ns.print(i," ram:",ns.hacknet.getNodeStats(i)["ram"]
			," upgrade: ",Moneyformat(ramUpgrade)
			," gain: ",Moneyformat(ramMoneyGain - ns.hacknet.getNodeStats(i)["production"])
			," %: ", ramUpgrade/(ramMoneyGain - ns.hacknet.getNodeStats(i)["production"]));
			ns.print(i," cores:",ns.hacknet.getNodeStats(i)["cores"]
			," upgrade ",Moneyformat(coreUpgrade)
			," gain ",Moneyformat(coreMoneyGain - ns.hacknet.getNodeStats(i)["production"])
			," %: ",coreUpgrade/(coreMoneyGain - ns.hacknet.getNodeStats(i)["production"]));
			if(i==0){
				ramMin = ramUpgrade;
				coreMin = coreUpgrade;
				levelMin = levelUpgrade;
			}
			if(ramUpgrade < hacknetNewNode*10 && 
			ns.getServerMoneyAvailable("home")> ramUpgrade &&
			ramMin >= ramUpgrade){
				ns.hacknet.upgradeRam(i,1);
				ramUpgrade = ns.hacknet.getRamUpgradeCost(i,1);
				ns.print("node ",i," upgraded ram");
			}
			else if(coreUpgrade < hacknetNewNode*10 && 
			ns.getServerMoneyAvailable("home")>coreUpgrade &&
			coreMin >= coreUpgrade){
				ns.hacknet.upgradeCore(i,1);
				coreUpgrade = ns.hacknet.getCoreUpgradeCost(i,1);
				ns.print("node ",i," upgraded core");
			}
			else if(levelUpgrade < hacknetNewNode && 
			ns.getServerMoneyAvailable("home")> levelUpgrade &&
			levelMin >= levelUpgrade){
				ns.hacknet.upgradeLevel(i,1);
				levelUpgrade = ns.hacknet.getLevelUpgradeCost(i,1);
				ns.print("node ",i," upgraded level");
			}
			else if(i == (numNodes-1) 
			&& ns.getServerMoneyAvailable("home")> hacknetNewNode &&
			ramUpgrade > hacknetNewNode*10 &&
		 	coreUpgrade >hacknetNewNode*10 && 
		 	levelUpgrade > hacknetNewNode){
				ns.hacknet.purchaseNode();
				ns.print("new node purchased");
			}
		}
		numNodes = ns.hacknet.numNodes();
	}
}
