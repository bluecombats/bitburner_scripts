/** @param {NS} ns */
function delay(milliseconds) {
	return new Promise(resolve => {
		setTimeout(resolve, milliseconds);
	});
}
function moneyFormat(money) {
	let moneySplit;
	if (Math.abs(money / Math.pow(10, 12)) > 1) {
		moneySplit = money / Math.pow(10, 12);
		return "$" + String(moneySplit).substring(0, 6) + "tr";
	}
	else if (Math.abs(money / Math.pow(10, 9)) > 1) {
		moneySplit = money / Math.pow(10, 9);
		return "$" + String(moneySplit).substring(0, 6) + "bn";
	} else if (Math.abs(money / Math.pow(10, 6)) > 1) {
		moneySplit = money / Math.pow(10, 6);
		return "$" + String(moneySplit).substring(0, 7) + "m";
	} else if (Math.abs(money / Math.pow(10, 3)) > 1) {
		moneySplit = money / Math.pow(10, 3);
		return "$" + String(moneySplit).substring(0, 7) + "k";
	}
	else {
		return "$" + String(money);
	}
}
function diff_calc(ns, member, task) {
	let difficulty, info = ns.gang.getMemberInformation(member), task_info = ns.gang.getTaskStats(task);
	difficulty = (task_info["hackWeight"] / 100) * info["hack_mult"] * info["hack_asc_mult"];
	difficulty += (task_info["strWeight"] / 100) * info["str_mult"] * info["str_asc_mult"];
	difficulty += (task_info["defWeight"] / 100) * info["def_mult"] * info["def_asc_mult"];
	difficulty += (task_info["dexWeight"] / 100) * info["dex_mult"] * info["dex_asc_mult"];
	difficulty += (task_info["agiWeight"] / 100) * info["agi_mult"] * info["agi_asc_mult"];
	difficulty += (task_info["chaWeight"] / 100) * info["cha_mult"] * info["cha_asc_mult"];
	ns.print(task, " task diff: ", task_info["difficulty"], " member ", member, " diff: ", difficulty.toFixed(2));
	return difficulty;
}
function buy_eq(ns, member) {
	let i, equipments = ns.gang.getEquipmentNames();
	let info = ns.gang.getMemberInformation(member), equipements_list = [];
	ns.print(equipments);
	for (i = 0; i < equipments.length; i++) {
		equipements_list[i] = {
			"name": equipments[i]
			, "cost": ns.gang.getEquipmentCost(equipments[i])
			//,"type":ns.gang.getEquipmentType(equipments[i])
		}
		ns.print(moneyFormat(equipements_list[i]["cost"]),
			", ", equipements_list[i]["type"],
			", ", equipements_list[i]["name"]);
	}
	equipements_list.sort(function (a, b) { return a.cost - b.cost });
	for (i = 0; i < equipements_list.length; i++) {
		if (info["upgrades"].indexOf(equipements_list[i]["name"]) < 0) {
			ns.print(moneyFormat(equipements_list[i]["cost"]), ", ", equipements_list[i]["type"], ", ", equipements_list[i]["name"]);
			if (ns.getServerMoneyAvailable("home") > equipements_list[i]["cost"]) {
				ns.gang.purchaseEquipment(member, equipements_list[i]["name"]);
			}
		}
	}
	return "ok";
}
function asc_member(ns, member) {
	var info = ns.gang.getMemberInformation(member), asc_info = ns.gang.getAscensionResult(member);
	ns.print(member, " info: ", info);
	ns.print(member, " asc_info: ", asc_info);
	//ns.print(members[member]," agi: ",info["agi_asc_mult"]," asc: ",asc_info["agi"]);
	//ns.print(members[member]," cha: ",info["cha_asc_mult"]," asc: ",asc_info["cha"]);
	//ns.print(members[member]," def: ",info["def_asc_mult"]," asc: ",asc_info["def"]);
	//ns.print(members[member]," dex: ",info["dex_asc_mult"]," asc: ",asc_info["dex"]);
	//ns.print(members[member]," hack: ",info["hack_asc_mult"]," asc: ",asc_info["hack"]);
	//ns.print(members[member]," str: ",info["str_asc_mult"]," asc: ",asc_info["str"]);
	if (!asc_info) {
		ns.print("skip, can't be ascended");
	}
	else if (asc_info["agi"] > (2) &&
		asc_info["cha"] > (2) &&
		asc_info["def"] > (2) &&
		asc_info["dex"] > (2) &&
		asc_info["hack"] > (2) &&
		asc_info["str"] > (2)) {
		ns.gang.ascendMember(member);
	}
	return "ok";
}
export async function main(ns) {
	if (!ns.gang.inGang()) {
		ns.tprint("Not in a gang");
		ns.tprint(ns.heart.break());
		//gangs: [Slum Snakes, Tetrads, The Syndicate, The Dark Army, Speakers for the Dead, NiteSec, The Black Hand]
		ns.tprint("create gang:",ns.gang.createGang("NiteSec"));
		return "pick a gang"
	}
	let check = true, members, member, tasks, task, taskstat = {}, difficulty, lastMemberNumber;
	let trainTasks = [], reduceWanted = [], earnRespectWanted = [], otherGangs, i, maxPower = 0;
	tasks = ns.gang.getTaskNames();
	ns.print(tasks);
	for (task in tasks) {
		taskstat[tasks[task]] = ns.gang.getTaskStats(tasks[task]);
		/*for(var stat in taskstat[tasks[task]]){
			ns.print(tasks[task]," : ",stat," : ",taskstat[tasks[task]][stat]);
		}*/
		ns.print(tasks[task], " : ", taskstat[tasks[task]]);
		if (tasks[task] == "Territory Warfare" || tasks[task] == "Unassigned") {
			continue
		}
		if (taskstat[tasks[task]]["baseRespect"] == 0 && taskstat[tasks[task]]["baseWanted"] == 0) {
			trainTasks.push(tasks[task]);
		}
		else if (taskstat[tasks[task]]["baseWanted"] < 0) {
			reduceWanted.push(tasks[task]);
		}
		else {
			earnRespectWanted.push(tasks[task]);
		}
	}
	ns.print("train tasks: ", trainTasks);
	ns.print("reduce wanted tasks: ", reduceWanted);
	ns.print("earn respect & wanted tasks: ", earnRespectWanted);

	//disable log for ns function
	// ns.disableLog(gang.setMemberTask)

	while (check) {
		members = ns.gang.getMemberNames();
		if (members.length ==0){
			ns.gang.recruitMember("gang1");
			members = ns.gang.getMemberNames();
		}
		while (ns.gang.canRecruitMember()) {
			ns.print("can recruit member");
			members = ns.gang.getMemberNames();
			//find if a gang member has been killed			
			lastMemberNumber = members[members.length - 1].substring(4, 10);
			ns.gang.recruitMember("gang" + (parseInt(lastMemberNumber) + 1));
			await delay(1000 * 30);
		}
		members = ns.gang.getMemberNames();
		ns.print(members);
		//train
		for (task in trainTasks) {
			for (member in members) {
				difficulty = diff_calc(ns, members[member], trainTasks[task]);
				//ns.print(members[member]," doing ", trainTasks[train])
				ns.gang.setMemberTask(members[member], trainTasks[task]);
			}
			await delay(1000 * 30);
		}
		//not train
		for (task in earnRespectWanted) {
			if (earnRespectWanted[task] == "Unassigned" || earnRespectWanted[task]["baseWanted"] > 2) {
				continue;
			}
			for (member in members) {
				//calc difficulty
				difficulty = diff_calc(ns, members[member], earnRespectWanted[task]);
				if (difficulty > taskstat[earnRespectWanted[task]]["difficulty"]) {
					ns.gang.setMemberTask(members[member], earnRespectWanted[task]);
				}
			}
			await delay(1000 * 10);
		}
		//buy equipment
		for (member in members) {
			buy_eq(ns, members[member]);
		}
		//reduce wanted
		while (ns.gang.getGangInformation()["wantedLevel"] > 1.1) {
			for (task in reduceWanted) {
				for (member in members) {
					difficulty = diff_calc(ns, members[member], reduceWanted[task]);
					ns.gang.setMemberTask(members[member], reduceWanted[task]);
				}
				await delay(1000 * 5);
				ns.print("Wanted level", ns.gang.getGangInformation()["wantedLevel"]);
			}
		}
		//territory warfare
		ns.print("Territory warefare territory %: ", ns.gang.getGangInformation()["territory"])
		if (ns.gang.getGangInformation()["territory"] < 1) {
			for (member in members) {
				difficulty = diff_calc(ns, members[member], "Territory Warfare");
				if (difficulty > taskstat["Territory Warfare"]["difficulty"]) {
					ns.gang.setMemberTask(members[member], "Territory Warfare");
				}
			}
			otherGangs = ns.gang.getOtherGangInformation();
			maxPower = 0;
			//ns.tprint(typeof(otherGangs)," ",otherGangs);
			//ns.tprint(Object.keys(otherGangs));
			for (i of Object.keys(otherGangs)) {
				//ns.tprint(i," ",otherGangs[i]);
				if (i == ns.gang.getGangInformation()["faction"]) {
					continue;
				}
				if (otherGangs[i]["power"] > maxPower) {
					maxPower = otherGangs[i]["power"];
					//ns.tprint(maxPower," ",otherGangs[i]);
				}
			}
			if (ns.gang.getGangInformation()["power"] > (maxPower * 2)) {
				ns.gang.setTerritoryWarfare(true);
			}
		} else {
			ns.gang.setTerritoryWarfare(false);
		}
		await ns.gang.nextUpdate();
		//ascension
		for (member in members) {
			asc_member(ns, members[member]);
		}
	}
}
