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
        return "$"+String(moneySplit).substring(0,7)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substring(0,7)+"bn";
    }else if(Math.abs(money/Math.pow(10,6)) >1){
        moneySplit = money/Math.pow(10,6);
        return "$"+String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(money/Math.pow(10,3)) >1){
        moneySplit = money/Math.pow(10,3);
        return "$"+String(moneySplit).substring(0,7)+"k";
    }else if(money<Math.pow(10,3)){
        return "$"+String(money).substr(0,7);
    }
    else{
        return "$"+String(money);
    }
}
function goal_value_for_node(ns, level_per, ram_per, core_per, cache_per, node){
	var goal_value = Math.min(level_per, ram_per, core_per), goal;
	if(goal_value == level_per){
		goal="level";
	}else if(goal_value == ram_per){
		goal="ram";
	}else if(goal_value == core_per){
		goal="core"
	}else if(goal_value == cache_per){
		goal="cache"
	}else{
		goal= "ERROR"
	}
	ns.print("GOAL for node: "+node+" is: ",goal.toUpperCase()," value: ",goal_value.toFixed(3));
	return goal_value
}
function goal_for_node(ns, level_per, ram_per, core_per, cache_per, node){
	var goal_value = Math.min(level_per, ram_per, core_per), goal;
	if(goal_value == level_per){
		goal="level";
	}else if(goal_value == ram_per){
		goal="ram";
	}else if(goal_value == core_per){
		goal="core"
	}else if(goal_value == cache_per){
		goal="cache"
	}else{
		goal= "ERROR"
	}
	//ns.print("GOAL for node: "+node+" is: ",goal.toUpperCase());
	return goal
}
export async function main(ns) {
	//requires formulas.exe
	var count = 0,i=0;
	var hackServerConstants = ns.formulas.hacknetServers.constants();
	/*"HashesPerLevel":0.001,
	"BaseCost":50000,
	"RamBaseCost":200000,
	"CoreBaseCost":1000000,
	"CacheBaseCost":10000000,
	"PurchaseMult":3.2,
	"UpgradeLevelMult":1.1,
	"UpgradeRamMult":1.4,
	"UpgradeCoreMult":1.55,
	"UpgradeCacheMult":1.85,
	"MaxServers":20,
	"MaxLevel":300,
	"MaxRam":8192,
	"MaxCores":128,
	"MaxCache":158*/
	//ns.tprint("constants",hackServerConstants)
	var mults = ns.getPlayer()['mults'];
	//ns.tprint("mults:",mults)
	var purchaseMulti = mults['hacknet_node_money'];
	var ramMulti = mults['hacknet_node_ram_cost'];
	var coreMulti = mults["hacknet_node_core_cost"];
	var levelMulti = mults["hacknet_node_level_cost"];
	var num_nodes = ns.hacknet.numNodes()
	var usedRam, hacknetNewNode, hacknetProduction;
	var level_per,core_per,ram_per, goal_value;

	var nodes_data=[];
	var node_data={
		node:0
	};
	var new_node_data;
	while(count<100000){
		count+=1;
		hacknetProduction = 0;
		if(num_nodes == 0){
			ns.hacknet.purchaseNode();
		}
		nodes_data=[];
		num_nodes = ns.hacknet.numNodes();
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost();
		for(i=0; i<num_nodes; i++){
			//ns.print(i);
			usedRam = ns.getServerUsedRam(`hacknet-server-${i}`);
			new_node_data = Object.create(node_data,{node:{value: i}});
			//ns.print(ns.hacknet.getNodeStats(i))
			new_node_data.level = ns.hacknet.getNodeStats(i)["level"];
			new_node_data.ram = ns.hacknet.getNodeStats(i)["ram"];
			new_node_data.cores = ns.hacknet.getNodeStats(i)["cores"];
			new_node_data.cache = ns.hacknet.getNodeStats(i)["cache"];
			new_node_data.level_upgrade= ns.formulas.hacknetServers.levelUpgradeCost(
				ns.hacknet.getNodeStats(i)["level"]
				,1
				,levelMulti
			);
			new_node_data.level_hash_gain = ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]+1
				,usedRam
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			new_node_data.ram_upgrade= ns.formulas.hacknetServers.ramUpgradeCost(
				ns.hacknet.getNodeStats(i)["ram"]
				,1
				,ramMulti
			);
			new_node_data.ram_hash_gain=  ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,usedRam
				,ns.hacknet.getNodeStats(i)["ram"]*2
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			)
			new_node_data.core_upgrade= ns.formulas.hacknetServers.coreUpgradeCost(
				ns.hacknet.getNodeStats(i)["cores"]
				,1
				,coreMulti
			);
			new_node_data.core_hash_gain= ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,usedRam
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]+1
				,purchaseMulti
			);
			new_node_data.cache_upgrade= ns.formulas.hacknetServers.cacheUpgradeCost(
				ns.hacknet.getNodeStats(i)["cache"]
				,1
			);
			new_node_data.cache_hash_gain= ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,usedRam
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			new_node_data.level_per = new_node_data.level_upgrade/
				new_node_data.level_hash_gain //- ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.ram_per = new_node_data.ram_upgrade/
				new_node_data.ram_hash_gain //- ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.core_per = new_node_data.core_upgrade/
				new_node_data.core_hash_gain //- ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.cache_per = new_node_data.cache_upgrade/
				new_node_data.cache_hash_gain //- ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.goal_value = goal_value_for_node(ns
				, new_node_data.level_per
				, new_node_data.ram_per
				, new_node_data.core_per
				, new_node_data.cache_per
				, i);
			new_node_data.goal = goal_for_node(ns
				, new_node_data.level_per
				, new_node_data.ram_per
				, new_node_data.core_per
				, new_node_data.cache_per
				, i);
			//ns.print(new_node_data);
			nodes_data.push(new_node_data);
			hacknetProduction += ns.hacknet.getNodeStats(i)["production"]; 
		}
		//sort nodes_data to get the best to upgrade
		nodes_data.sort(function (a, b) { return a.goal_value - b.goal_value });
		//print logs
		ns.print(nodes_data[0]["node"]+" "+nodes_data[0]["goal"]);
		ns.print("level "+
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["level"]+" upgrade: "+
			Moneyformat(nodes_data[0]["level_upgrade"]));
		ns.print("ram "+
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["ram"]+" upgrade: "+
			Moneyformat(nodes_data[0]["ram_upgrade"]));
		ns.print("core "+
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["cores"]+" upgrade: "+
			Moneyformat(nodes_data[0]["core_upgrade"]));
		ns.print("cache "+
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["cache"]+" upgrade: "+
			Moneyformat(nodes_data[0]["cache_upgrade"]));
		//decision
		if(nodes_data[0]["goal"]=="level" &&
			ns.getServerMoneyAvailable("home") > nodes_data[0]["level_upgrade"]){
				ns.hacknet.upgradeLevel(nodes_data[0]["node"],1)
		}else if(nodes_data[0]["goal"]=="ram" &&
			ns.getServerMoneyAvailable("home") > nodes_data[0]["ram_upgrade"]){
				ns.hacknet.upgradeRam(nodes_data[0]["node"],1)
		}else if(nodes_data[0]["goal"]=="core" &&
			ns.getServerMoneyAvailable("home") > nodes_data[0]["core_upgrade"]){
				ns.hacknet.upgradeCore(nodes_data[0]["node"],1)
		}else if(nodes_data[0]["goal"]=="cache" &&
			ns.getServerMoneyAvailable("home") > nodes_data[0]["cache_upgrade"]){
				ns.hacknet.upgradeCache(nodes_data[0]["node"],1)
		}
		//decision to buy new node
		//sort by levels
		nodes_data.sort(function (a, b) { return a.level - b.level });
		/*for(i=0; i<nodes_data.length; i++){
			ns.print(nodes_data[i].node," lvl: ",nodes_data[i].level);
		}*/
		if(nodes_data[0].level < 200){
			ns.print("purchase? level upgrade: "+
			Moneyformat(nodes_data[0]["level_upgrade"])+
			" new node: "+ Moneyformat(hacknetNewNode));
			if(nodes_data[0]["level_upgrade"]> hacknetNewNode){
				ns.hacknet.purchaseNode();
			}
		}else if((ns.hacknet.getNodeStats(0)["cores"]) < 
		ns.formulas.hacknetNodes.constants()["MaxCores"]){
			nodes_data.sort(function (a, b) { return a.cores - b.cores });
			ns.print("purchase? core upgrade: "+
			Moneyformat(nodes_data[0]["core_upgrade"])+
			" new node: "+ Moneyformat(hacknetNewNode));
			nodes_data.sort(function (a, b) { return a.cores - b.cores });
			//ns.print("core sort ",nodes_data[0])
			if((nodes_data[0].core_upgrade/10)>hacknetNewNode){
				ns.hacknet.purchaseNode();
			}
		}
		ns.print("Total production per second ", hacknetProduction);
		//sell hashes
		//ns.tprint("hash upgrades",ns.hacknet.getHashUpgrades());
		/*"Sell for Money",
		"Sell for Corporation Funds",
		"Reduce Minimum Security",
		"Increase Maximum Money",
		"Improve Studying",
		"Improve Gym Training",
		"Exchange for Corporation Research",
		"Exchange for Bladeburner Rank",
		"Exchange for Bladeburner SP",
		"Generate Coding Contract",
		"Company Favor"*/
		if(ns.hacknet.numHashes() == ns.hacknet.hashCapacity()){
			ns.hacknet.spendHashes("Sell for Money")
		}
		await delay(1000*0.25);
	}
}
