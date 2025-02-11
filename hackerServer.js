/** @param {NS} ns **/
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function numberFormat(x){
    var moneySplit;
    if(Math.abs(x/Math.pow(10,12)) >1){
        moneySplit = x/Math.pow(10,12);
        return String(moneySplit).substring(0,6)+"tr";
    }
    else if(Math.abs(x/Math.pow(10,9)) >1){
        moneySplit = x/Math.pow(10,9);
        return String(moneySplit).substring(0,6)+"bn";
    }else if(Math.abs(x/Math.pow(10,6)) >1){
        moneySplit = x/Math.pow(10,6);
        return String(moneySplit).substring(0,7)+"m";
    }else if(Math.abs(x/Math.pow(10,3)) >1){
        moneySplit = x/Math.pow(10,3);
        return String(moneySplit).substring(0,7)+"k";
    }else if(x<Math.pow(10,3)){
        return String(x).substring(0,8);
    }
    else{
        return String(x).substring(0,8);
    }
}
function goal_value_for_node(ns, level_per, ram_per, core_per, node){
	var goal_value = Math.min(level_per, ram_per, core_per), goal;
	if(goal_value == level_per){
		goal="level";
	}else if(goal_value == ram_per){
		goal="ram";
	}else if(goal_value == core_per){
		goal="core"
	}else{
		goal= "ERROR"
	}
	// ns.print("GOAL for node: "+node+" is: ",goal.toUpperCase()," value: ",goal_value.toFixed(3));
	return goal_value
}
function goal_for_node(ns, level_per, ram_per, core_per, node){
	var goal_value = Math.min(level_per, ram_per, core_per), goal;
	if(goal_value == level_per){
		goal="level";
	}else if(goal_value == ram_per){
		goal="ram";
	}else if(goal_value == core_per){
		goal="core"
	}else{
		goal= "ERROR"
	}
	//ns.print("GOAL for node: "+node+" is: ",goal.toUpperCase());
	return goal
}
export async function main(ns) {
	//requires formulas.exe
	var count = 0,i=0,delay_time=0.25;
	let total_cost, total_produced;
	var hackServerConstants = ns.formulas.hacknetServers.constants();
	var hacknetNodeConstants = ns.formulas.hacknetNodes.constants();
	var mults = ns.getPlayer()['mults'];
	var purchaseMulti = mults['hacknet_node_money'];
	var ramMulti = mults['hacknet_node_ram_cost'];
	var coreMulti = mults["hacknet_node_core_cost"];
	var levelMulti = mults["hacknet_node_level_cost"];
	var nodeMulti = mults["hacknet_node_purchase_cost"];
	var num_nodes = ns.hacknet.numNodes()
	var hacknetNewNode, hacknetProduction;
	var level_per,core_per,ram_per, goal_value;

	var nodes_data=[];
	var node_data={
		node:0
	};
	var new_node_data;
	// while(count<100000){
		// count+=1;
	while(true){
		total_produced=0;
		total_cost=0;
		hacknetProduction = 0;
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost();
		if(num_nodes == 0){
			ns.hacknet.purchaseNode();
		}
		if(ns.hacknet.numNodes() == 0){
			ns.print(`no nodes, can't afford $${numberFormat(hacknetNewNode)} yet`)
			await delay(1000*0.25);
			continue;
		}
		nodes_data=[];
		num_nodes = ns.hacknet.numNodes();
		hacknetNewNode = ns.hacknet.getPurchaseNodeCost();
		
		ns.print(
			`MaxCache: ${numberFormat(hackServerConstants["MaxCache"])}`+
			` MaxCores: ${numberFormat(hackServerConstants["MaxCores"])}`+
			` MaxLevel: ${numberFormat(hackServerConstants["MaxLevel"])}`+
			` MaxRam: ${numberFormat(hackServerConstants["MaxRam"])}`+
			` MaxServers: ${numberFormat(hackServerConstants["MaxServers"])}`
		);
		ns.print(`BaseCost: $${numberFormat(hackServerConstants["BaseCost"])}`+
			` CacheBaseCost: $${numberFormat(hackServerConstants["CacheBaseCost"])}`+
			` CoreBaseCost: $${numberFormat(hackServerConstants["CoreBaseCost"])}`+
			` RamBaseCost: $${numberFormat(hackServerConstants["RamBaseCost"])}`);
		ns.print(
			`PurchaseMult: ${numberFormat(hackServerConstants["PurchaseMult"])}`+
			` UpgradeCacheMult: ${numberFormat(hackServerConstants["UpgradeCacheMult"])}`+
			` UpgradeCoreMult: ${numberFormat(hackServerConstants["UpgradeCoreMult"])}`+
			` UpgradeLevelMult: ${numberFormat(hackServerConstants["UpgradeLevelMult"])}`+
			` UpgradeRamMult: ${numberFormat(hackServerConstants["CacheBaseCost"])}`
		);
		ns.print(`mults: {hacknet_node_money: ${purchaseMulti}, `+
			`ram: ${ramMulti}, `+
			`core: ${coreMulti}, `+
			`level: ${levelMulti}, `+
			`purchase_server: ${nodeMulti}}`
		);
		for(i=0; i<num_nodes; i++){
			// ns.print(i,ns.hacknet.getNodeStats(i));
			ns.print(`${i} tProd: ${numberFormat(ns.hacknet.getNodeStats(i)["totalProduction"])}`+
				` prod: ${numberFormat(ns.hacknet.getNodeStats(i)["production"])}`+
				` cap: ${numberFormat(ns.hacknet.getNodeStats(i)["hashCapacity"])}`+
				` lvl: ${ns.hacknet.getNodeStats(i)["level"]}`+
				` ram: ${numberFormat(ns.hacknet.getNodeStats(i)["ram"])}`+
				` cor: ${ns.hacknet.getNodeStats(i)["cores"]}`+
				` cac: ${ns.hacknet.getNodeStats(i)["cache"]}`
			);
			total_produced+=ns.hacknet.getNodeStats(i)["totalProduction"];
			let form_hacknetServerCost = ns.formulas.hacknetServers.hacknetServerCost(
				i+1, nodeMulti);
			let form_hacknetLevelUpgradeCost = ns.formulas.hacknetServers.levelUpgradeCost(
				1,ns.hacknet.getNodeStats(i)["level"]-1,levelMulti
			);
			let form_hacknetRamUpgradeCost = ns.formulas.hacknetServers.ramUpgradeCost(
				1,Math.log2(ns.hacknet.getNodeStats(i)["ram"])-1,ramMulti
			);
			let form_hacknetCoreUpgradeCost = ns.formulas.hacknetServers.coreUpgradeCost(
				1,ns.hacknet.getNodeStats(i)["cores"]-1,coreMulti
			);
			let form_hacknetCacheUpgradeCost = ns.formulas.hacknetServers.cacheUpgradeCost(
				1,ns.hacknet.getNodeStats(i)["cache"]-1
			);
			// ns.print(`${i} `+ 
			// `${numberFormat(form_hacknetServerCost)} `+
			// `lvl: $${numberFormat(form_hacknetLevelUpgradeCost)} `+
			// `ram: $${numberFormat(form_hacknetRamUpgradeCost)} `+
			// `core: $${numberFormat(form_hacknetCoreUpgradeCost)} `+
			// `cache: $${numberFormat(form_hacknetCacheUpgradeCost)} `);			
			total_cost+= form_hacknetServerCost +form_hacknetLevelUpgradeCost + form_hacknetRamUpgradeCost +
				form_hacknetCoreUpgradeCost + form_hacknetCacheUpgradeCost;
			//calc version
			let calc_hacknetServerCost = hackServerConstants["BaseCost"]*nodeMulti*
				(Math.pow(hackServerConstants["PurchaseMult"],i));
			let calc_hacknetLevelUpgradeCost = hackServerConstants["BaseCost"]*levelMulti*
				(Math.pow(hackServerConstants["UpgradeLevelMult"], ns.hacknet.getNodeStats(i)["level"]+1)-1);
			let calc_hacknetRamUpgradeCost= hackServerConstants["RamBaseCost"]*ramMulti*
				// (Math.pow(hackServerConstants["UpgradeRamMult"], Math.log2(ns.hacknet.getNodeStats(i)["ram"])+1)-1);
				(Math.pow(hackServerConstants["UpgradeRamMult"], Math.log2(ns.hacknet.getNodeStats(i)["ram"])+1)-1);
			let calc_hacknetCoreUpgradeCost= hackServerConstants["CoreBaseCost"]*coreMulti*
				(Math.pow(hackServerConstants["UpgradeCoreMult"], ns.hacknet.getNodeStats(i)["cores"]+1)-1);
			let calc_hacknetCacheUpgradeCost= hackServerConstants["CacheBaseCost"]*1*
				(Math.pow(hackServerConstants["UpgradeCacheMult"], ns.hacknet.getNodeStats(i)["cache"]+1)-1);
			// ns.print(`${i} `+ 
			// `${numberFormat(calc_hacknetServerCost)} `+
			// `lvl: $${numberFormat(calc_hacknetLevelUpgradeCost)} `+
			// `ram: $${numberFormat(calc_hacknetRamUpgradeCost)} `+
			// `core: $${numberFormat(calc_hacknetCoreUpgradeCost)} `+
			// `cache: $${numberFormat(calc_hacknetCacheUpgradeCost)} `);
			// total_cost+= calc_hacknetServerCost + calc_hacknetLevelUpgradeCost + calc_hacknetRamUpgradeCost + 
			// 	calc_hacknetCoreUpgradeCost + calc_hacknetCacheUpgradeCost;
			new_node_data = Object.create(node_data,{node:{value: i}});
			new_node_data.level = ns.hacknet.getNodeStats(i)["level"];
			new_node_data.ram = ns.hacknet.getNodeStats(i)["ram"];
			new_node_data.cores = ns.hacknet.getNodeStats(i)["cores"];
			new_node_data.cache = ns.hacknet.getNodeStats(i)["cache"];
			new_node_data.level_upgrade = ns.hacknet.getLevelUpgradeCost(i,1);
			new_node_data.level_hash_gain = ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]+1
				,ns.hacknet.getNodeStats(i)["ramUsed"]
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			new_node_data.ram_upgrade = ns.hacknet.getRamUpgradeCost(i,1);
			new_node_data.ram_hash_gain=  ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ramUsed"]
				,ns.hacknet.getNodeStats(i)["ram"]*2
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			)
			new_node_data.core_upgrade = ns.hacknet.getCoreUpgradeCost(i,1);
			new_node_data.core_hash_gain= ns.formulas.hacknetServers.hashGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ramUsed"]
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]+1
				,purchaseMulti
			);
			new_node_data.cache_upgrade= ns.hacknet.getCacheUpgradeCost(i,1);
			//gain percentage
			new_node_data.level_per = new_node_data.level_upgrade/
				(new_node_data.level_hash_gain - ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.ram_per = new_node_data.ram_upgrade/
				(new_node_data.ram_hash_gain - ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.core_per = new_node_data.core_upgrade/
				(new_node_data.core_hash_gain - ns.hacknet.getNodeStats(i)["production"]);
			//goal
			new_node_data.goal_value = goal_value_for_node(ns
				, new_node_data.level_per
				, new_node_data.ram_per
				, new_node_data.core_per
				, i);
			new_node_data.goal = goal_for_node(ns
				, new_node_data.level_per
				, new_node_data.ram_per
				, new_node_data.core_per
				, i);
			nodes_data.push(new_node_data);
			hacknetProduction += ns.hacknet.getNodeStats(i)["production"];
			//buy cache
			if(new_node_data.level_upgrade > new_node_data.cache_upgrade &&
			ns.getServerMoneyAvailable("home") > new_node_data.cache_upgrade){
				ns.hacknet.upgradeCache(i,1);
			}
		}
		//sort nodes_data to get the best to upgrade
		nodes_data.sort(function (a, b) { return a.goal_value - b.goal_value });
		//print logs
		ns.print("NODE "+numberFormat(nodes_data[0]["node"])+" "+nodes_data[0]["goal"]);
		ns.print("level "+numberFormat(
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["level"])+" upgrade: $"+
			numberFormat(nodes_data[0]["level_upgrade"]));
		ns.print("ram   "+numberFormat(
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["ram"])+" upgrade: $"+
			numberFormat(nodes_data[0]["ram_upgrade"]));
		ns.print("core  "+numberFormat(
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["cores"])+" upgrade: $"+
			numberFormat(nodes_data[0]["core_upgrade"]));
		ns.print("cache "+numberFormat(
			ns.hacknet.getNodeStats(nodes_data[0]["node"])["cache"])+" upgrade: $"+
			numberFormat(nodes_data[0]["cache_upgrade"]));
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
		}
		//sort by levels
		nodes_data.sort(function (a, b) { return a.level - b.level });
		//decision to buy new node
		if(nodes_data[0].level < 200){
			let form_hacknetNewNode = ns.formulas.hacknetServers.hacknetServerCost(
				num_nodes+1, nodeMulti);
			ns.print("Purchase new node?: $"+ numberFormat(hacknetNewNode)+
				" $"+numberFormat(form_hacknetNewNode));
			if(nodes_data[0]["level_upgrade"]> hacknetNewNode){
				ns.hacknet.purchaseNode();
			}
		}else if((ns.hacknet.getNodeStats(0)["cores"]) < 
		ns.formulas.hacknetNodes.constants()["MaxCores"]){
			nodes_data.sort(function (a, b) { return a.cores - b.cores });
			ns.print("Purchase new node?: $"+ numberFormat(hacknetNewNode));
			nodes_data.sort(function (a, b) { return a.cores - b.cores });
			//ns.print("core sort ",nodes_data[0])
			if((nodes_data[0].core_upgrade/10)>hacknetNewNode){
				ns.hacknet.purchaseNode();
			}
		}
		ns.print("Total Spent $",numberFormat(total_cost));
		ns.print("Total Produced $",numberFormat(total_produced)," $",numberFormat(ns.hacknet.getHashUpgradeLevel("Sell for Money")*
			Math.pow(10,9)));
		ns.print("Hashs: ", numberFormat(ns.hacknet.hashCapacity()),"/"+
			numberFormat(ns.hacknet.numHashes()));
		ns.print("Hash Rate ", hacknetProduction);
		//sell hashes
		//ns.tprint("hash upgrades",ns.hacknet.getHashUpgrades());
		/*"Sell for Money",
		"Sell for Corporation Funds",
		"Reduce Minimum Security",
		"Increase Maximum Money",
		"Improve Studying",9
		"Improve Gym Training",
		"Exchange for Corporation Research",
		"Exchange for Bladeburner Rank",
		"Exchange for Bladeburner SP",
		"Generate Coding Contract",
		"Company Favor"*/
		await delay(1000*delay_time);
	}
}
