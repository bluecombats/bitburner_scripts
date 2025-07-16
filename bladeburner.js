/** @param {NS} ns */
function delay(milliseconds){
	return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
	});
}
function timeFormat(time){
	//time is in milliseconds
	let seconds, mins, hours, days;
	let rem_miliseconds=0, rem_seconds=0, rem_mins=0, remi_hours=0, rem_days=0;
	let time_string='';

	rem_miliseconds = Math.floor(time % 1000);

	seconds = Math.floor(time/1000);
	rem_seconds = Math.floor(seconds % 60);

	mins = seconds/60;
	rem_mins = Math.floor(mins % 60);

	hours = mins/60;
	remi_hours = Math.floor(hours % 24);

	days = hours/24;
	rem_days = Math.floor(days);
	if(rem_miliseconds>0){
		time_string = `${rem_miliseconds}ms`
	}if(rem_seconds>0){
		time_string = `${rem_seconds}sec `+time_string;
	}if(rem_mins>0){
		time_string = `${rem_mins}mins `+time_string;
	}if(remi_hours>0){
		time_string = `${remi_hours}hrs `+time_string;
	}if(rem_days>0){
		time_string = `${rem_days}days `+time_string;
	}
	return time_string;
}
export async function main(ns) {	
	if(!ns.bladeburner.inBladeburner()){
		return "not in bladeburner"
	}
	const contracts = ns.bladeburner.getContractNames();
	const actions = ns.bladeburner.getGeneralActionNames();
	let black_ops;
	const operations = ns.bladeburner.getOperationNames();
	const skills = ns.bladeburner.getSkillNames();
	let min_lvl, est_chance, max_lvl, curr_lvl;
	let min_cost,min_skill;
	let city;
	let est_pop, city_com,city_chaos;
	let delay_time,i;
	const skill_per = {
		"Blade's Intuition":1.03,
		"Cloak":1.055,
		"Cyber's Edge":1.02,
		"Datamancer":1.05,
		"Digital Observer":1.04,
		"Evasive System":1.04,
		"Hands of Midas":1.1,
		"Hyperdrive":1.1,
		"Overclock":0.99,
		"Reaper":1.02,
		"Short-Circuit":1.055,
		"Tracer":1.04
	}
	while(true){
		ns.printf("current action: %j",ns.bladeburner.getCurrentAction());
		//check hp of player
		if(ns.getPlayer()["hp"]["current"]<(ns.getPlayer()["hp"]["max"]*0.5)){
			delay_time = ns.bladeburner.getActionTime("General","Hyperbolic Regeneration Chamber");
			ns.bladeburner.startAction("General","Hyperbolic Regeneration Chamber")
			await delay(delay_time);
			continue;
		}
		city = ns.bladeburner.getCity();
		city_com = ns.bladeburner.getCityCommunities(city);
		//field action
		while(ns.bladeburner.getCityEstimatedPopulation(city) <1000){
			delay_time = ns.bladeburner.getActionTime("General","Field Analysis");
			ns.bladeburner.startAction("General","Field Analysis")
			await delay(delay_time);
			continue;
		}
		//diplomancy
		while(ns.bladeburner.getCityChaos(city) >100){
			delay_time = ns.bladeburner.getActionTime("General","Diplomacy");
			ns.bladeburner.startAction("General","Diplomacy")
			await delay(delay_time);
			continue;
		}
		//can do black ops?
		black_ops = ns.bladeburner.getNextBlackOp();
		ns.print(black_ops);
		if(black_ops &&
			ns.bladeburner.getRank() >= black_ops["rank"] &&		
			ns.bladeburner.getActionEstimatedSuccessChance(
				"Black Operations",
				black_ops["name"]
			)[0]>0.8){
			delay_time = ns.bladeburner.getActionTime(
				"Black Operations",
				black_ops["name"]
			);
			ns.bladeburner.startAction(
				"Black Operations",
				black_ops["name"]
			)
			await delay(delay_time);
		}
		//contracts
		min_lvl =-1;
		ns.print(contracts);
		for(i=0;i<contracts.length;i++){
			ns.bladeburner.setActionAutolevel("Contracts",contracts[i],true);
			max_lvl = ns.bladeburner.getActionMaxLevel("Contracts",contracts[i]);
			curr_lvl = ns.bladeburner.getActionCurrentLevel("Contracts",contracts[i]);
			est_chance = ns.bladeburner.getActionEstimatedSuccessChance("Contracts",contracts[i]);
			delay_time = ns.bladeburner.getActionTime("Contracts",	contracts[i]);
			ns.printf(
				"max lvl: %d cur lvl: %d success min: %.3g max: %.3g time %s %s",
				max_lvl,
				curr_lvl,
				est_chance[0], est_chance[1],
				timeFormat(delay_time),
				contracts[i]
			);
			if(est_chance[0]>0.8){
				ns.bladeburner.startAction("Contracts",contracts[i])
				await delay(delay_time);
			}
		}
		//operations
		min_lvl =-1;
		for(i=0;i<operations.length;i++){
			ns.bladeburner.setActionAutolevel("Operations",operations[i],true);
			max_lvl = ns.bladeburner.getActionMaxLevel("Operations",operations[i]);
			curr_lvl = ns.bladeburner.getActionCurrentLevel("Operations",operations[i]);
			est_chance = ns.bladeburner.getActionEstimatedSuccessChance("Operations",operations[i]);
			delay_time = ns.bladeburner.getActionTime("Operations",operations[i]);
			ns.printf(
				"max lvl: %d cur lvl: %d success min: %.3g max: %.3g time %s %s",
				max_lvl,
				curr_lvl,
				est_chance[0],est_chance[1],
				timeFormat(delay_time),
				operations[i]
			);
			if(est_chance[0]>0.8){
				ns.bladeburner.startAction("Operations",operations[i]);
				await delay(delay_time);
			}
		}
		//upgrade skills
		ns.printf("current skill points: %d",ns.bladeburner.getSkillPoints())
		min_cost=Math.pow(2,100);
		min_skill=null;
		do{
			if(min_skill && ns.bladeburner.getSkillPoints()>=ns.bladeburner.getSkillUpgradeCost(min_skill, 1)){
				ns.bladeburner.upgradeSkill(min_skill, 1);
			}
			min_cost=Math.pow(2,100);
			min_skill=null;
			for(i=0;i<skills.length;i++){
				ns.printf(
					" lvl %d cost %d effect: %.4g %s",
					ns.bladeburner.getSkillLevel(skills[i]),
					ns.bladeburner.getSkillUpgradeCost(skills[i], 1),
					Math.pow(skill_per[skills[i]], ns.bladeburner.getSkillLevel(skills[i])+ 1),
					skills[i]
				);
				if(ns.bladeburner.getSkillUpgradeCost(skills[i], 1)<min_cost){
					min_cost = ns.bladeburner.getSkillUpgradeCost(skills[i], 1)
					min_skill = skills[i];
				}
			}
			ns.printf(
				"min skill %s cost %d",
				min_skill,
				min_cost
			)
		}while(ns.bladeburner.getSkillPoints()>=ns.bladeburner.getSkillUpgradeCost(min_skill, 1));
		await ns.bladeburner.nextUpdate();
	}
}
