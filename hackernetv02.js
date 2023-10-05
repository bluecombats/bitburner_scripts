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
	ns.print("GOAL for node: "+node+" is: ",goal.toUpperCase()," value: ",goal_value.toFixed(3));
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
	var count = 0,i=0;
	var hackNetConstants = ns.formulas.hacknetNodes.constants();
	var mults = ns.getPlayer()['mults'];
	var purchaseMulti = mults['hacknet_node_money'];
	var ramMulti = mults['hacknet_node_ram_cost'];
	var coreMulti = mults["hacknet_node_core_cost"];
	var levelMulti = mults["hacknet_node_level_cost"];
	var num_nodes = ns.hacknet.numNodes();
	var ram_upgrade, core_upgrade, level_upgrade, level_money_gain, ram_money_gain, core_money_gain;
	var ram_min, core_min, level_min, hacknetNewNode, hacknetProduction;
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
			new_node_data = Object.create(node_data,{node:{value: i}});
			new_node_data.level = ns.hacknet.getNodeStats(i)["level"];
			new_node_data.ram = ns.hacknet.getNodeStats(i)["ram"];
			new_node_data.cores = ns.hacknet.getNodeStats(i)["cores"];
			new_node_data.level_upgrade= ns.formulas.hacknetNodes.levelUpgradeCost(
				ns.hacknet.getNodeStats(i)["level"]
				,1
				,levelMulti
			);
			new_node_data.level_money_gain = ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]+1
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			);
			new_node_data.ram_upgrade= ns.formulas.hacknetNodes.ramUpgradeCost(
				ns.hacknet.getNodeStats(i)["ram"]
				,1
				,ramMulti
			);
			new_node_data.ram_money_gain=  ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]*2
				,ns.hacknet.getNodeStats(i)["cores"]
				,purchaseMulti
			)
			new_node_data.core_upgrade= ns.formulas.hacknetNodes.coreUpgradeCost(
				ns.hacknet.getNodeStats(i)["cores"]
				,1
				,coreMulti
			);
			new_node_data.core_money_gain= ns.formulas.hacknetNodes.moneyGainRate(
				ns.hacknet.getNodeStats(i)["level"]
				,ns.hacknet.getNodeStats(i)["ram"]
				,ns.hacknet.getNodeStats(i)["cores"]+1
				,purchaseMulti
			);
			new_node_data.level_per = new_node_data.level_upgrade/
				(new_node_data.level_money_gain - ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.ram_per = new_node_data.ram_upgrade/
				(new_node_data.ram_money_gain - ns.hacknet.getNodeStats(i)["production"]);
			new_node_data.core_per = new_node_data.core_upgrade/
				(new_node_data.core_money_gain - ns.hacknet.getNodeStats(i)["production"]);
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
			//ns.print(i," production: ",Moneyformat(ns.hacknet.getNodeStats(i)["production"]));
			/*ns.print(i," level:",ns.hacknet.getNodeStats(i)["level"]
			," upgrade: ",Moneyformat(new_node_data.level_upgrade)
			," gain: ",Moneyformat(new_node_data.level_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ", new_node_data.level_per);*/
			/*ns.print(i," ram:",ns.hacknet.getNodeStats(i)["ram"]
			," upgrade: ",Moneyformat(new_node_data.ram_upgrade)
			," gain: ",Moneyformat(new_node_data.ram_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ", new_node_data.ram_per);*/
			/*ns.print(i," cores:",ns.hacknet.getNodeStats(i)["cores"]
			," upgrade ",Moneyformat(new_node_data.core_upgrade)
			," gain ",Moneyformat(new_node_data.core_money_gain - ns.hacknet.getNodeStats(i)["production"])
			," %: ", new_node_data.core_per);*/
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
		ns.print("Total production per second ", Moneyformat(hacknetProduction));
		await delay(1000*0.25);
	}
}
