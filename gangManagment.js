/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
class gangManagement{
	constructor(ns){
		this.ns = ns
	}
}
function difficulty(ns,task, member){
	var taskstat = ns.gang.getTaskStats(task);
	var info = ns.gang.getMemberInformation(member);
	//ns.print("task info: ", taskstat);
	//ns.print("member info: ", info);
	var difficult = info["hack"]*(taskstat["hackWeight"]/100)
				+info["str"]*(taskstat["strWeight"]/100)
				+info["def"]*(taskstat["defWeight"]/100)
				+info["dex"]*(taskstat["dexWeight"]/100)
				+info["agi"]*(taskstat["agiWeight"]/100)
				+info["cha"]*(taskstat["chaWeight"]/100);
	ns.print(task," difficulty: ",taskstat["difficulty"]);
	ns.print(member," to do task: ", difficult);
	return difficult > taskstat["difficulty"];
}
function ascention(ns,member){
	var info = ns.gang.getMemberInformation(member);
	var asc_info = ns.gang.getAscensionResult(member);
	if(!asc_info){
	}
	else if(asc_info["agi"]>(2) &&
	asc_info["cha"]>(2) &&
	asc_info["def"]>(2) &&
	asc_info["dex"]>(2) &&
	asc_info["hack"]>(2) &&
	asc_info["str"]>(2)){
		ns.gang.ascendMember(member);
	}
}
function buy_equipement(ns,member,equipements_list){
	var i
	for(i in equipements_list){
		equipements_list[i]["cost"] = ns.gang.getEquipmentCost(equipements_list[i]["name"]);
	}
	equipements_list.sort(function(a, b){return a.cost - b.cost});
	for(i in equipements_list){
		var info = ns.gang.getMemberInformation(member);
		if(info["upgrades"].indexOf(equipements_list[i]["name"])<0){
			if(ns.getServerMoneyAvailable("home")>equipements_list[i]["cost"]){
				ns.gang.purchaseEquipment(member, equipements_list[i]["name"]);
			}
		}
	}
}
function optimisedTask(ns, member, tasks, option){
	var level = 0, optimisedTask;
	var taskinfo,task;
	for(task of tasks){
		if(difficulty(ns,task,member)){
			taskinfo = ns.gang.getTaskStats(task);
			if(option=="wanted" && taskinfo["baseWanted"]<level){
				level = taskinfo["baseWanted"];
				optimisedTask = task;
			}
			if(option=="respect" && taskinfo["baseRespect"]>level){
				level = taskinfo["baseRespect"];
				optimisedTask = task;
			}
			if(option=="money" && taskinfo["baseMoney"]>level){
				level = taskinfo["baseMoney"];
				optimisedTask = task;
			}
		}
	}
	ns.gang.setMemberTask(member, optimisedTask);
}
function gangEngage(ns){
	var gang_info = ns.gang.getGangInformation();
	var other_gangs_info = ns.gang.getOtherGangInformation();
	var power=0,other_gang;
	//ns.print(gang_info["faction"]);
	for(other_gang in other_gangs_info){
		if(other_gang != gang_info["faction"] 
		&& other_gangs_info[other_gang]["power"] >power){
			power = other_gangs_info[other_gang]["power"];
		}
	}
	ns.print("gang pow", gang_info["power"], "max other:",power);
	if((power*2)<gang_info["power"]){
		ns.gang.setTerritoryWarfare(true);
	}
	else{
		ns.gang.setTerritoryWarfare(false);
	}
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
    }
    else{
        return "$"+String(money);
    }
}
export async function main(ns) {
	if(!ns.gang.inGang()){
		ns.tprint("Not in a gang");
		return "pick a gang"
	}
	var check=true, info, gang_info, other_gang_info, asc_info, members, member, tasks, task, taskstat={};
	tasks = ns.gang.getTaskNames();
	//["Unassigned","Ransomware","Phishing","Identity Theft","DDoS Attacks","Plant Virus"
	//,"Fraud & Counterfeiting","Money Laundering","Cyberterrorism","Ethical Hacking"
	//,"Vigilante Justice","Train Combat","Train Hacking","Train Charisma","Territory Warfare"]
	//ns.print(tasks);
	var equipments = ns.gang.getEquipmentNames();
	//ns.print(equipments);
	var equipements_list=[],i;
	for (var eq in equipments){
		equipements_list[eq]={
			"name":equipments[eq]
			,"cost":ns.gang.getEquipmentCost(equipments[eq])
		}
	}
	//ns.print(equipments);
	//ns.print(equipements_list);
	while(check){
		while(ns.gang.canRecruitMember()){
			ns.gang.recruitMember("gang"+(ns.gang.getMemberNames().length));
		}
		members = ns.gang.getMemberNames();
		ns.print(members);
		for(member of members){
			info = ns.gang.getMemberInformation(member);
			gang_info = ns.gang.getGangInformation();
			other_gang_info = ns.gang.getOtherGangInformation();
			//train
			if(info["hack"]<100){
				ns.gang.setMemberTask(member, "Train Hacking");
			}else if(info["cha"]<100){
				ns.gang.setMemberTask(member, "Train Charisma");
			}else if(info["str"]<100 ||
			 info["def"]<100 ||
			 info["dex"]<100 || 
			 info["agi"]<100){
				ns.gang.setMemberTask(member, "Train Combat");
			}
			//training over, gain money, reduce wanted, earn repect
			if(gang_info["wantedLevelGainRate"]>0){
				optimisedTask(ns,member, tasks,"wanted");
			}
			else if(members.length < 12){
				optimisedTask(ns,member, tasks,"respect");
			}
			else if(gang_info["territory"]<0.9 && 
			difficulty(ns,"Territory Warfare",member)){
				ns.gang.setMemberTask(member, "Territory Warfare");
			}
			else{
				optimisedTask(ns,member, tasks,"money");
			}
			ns.print("territory %: ",gang_info["territory"]);
			gangEngage(ns);
			//ns.print("other gangs info:",other_gang_info);
			//buy equipment
			buy_equipement(ns,member,equipements_list);
			//ascension
			ascention(ns,member);
			await delay(1000*10);
		}
	}
}
