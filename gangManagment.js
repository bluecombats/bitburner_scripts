/** @param {NS} ns */
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
	var check=true, info,asc_info,members,member, tasks, task, taskstat={};
	tasks = ns.gang.getTaskNames();
	//["Unassigned","Ransomware","Phishing","Identity Theft","DDoS Attacks","Plant Virus"
	//,"Fraud & Counterfeiting","Money Laundering","Cyberterrorism","Ethical Hacking"
	//,"Vigilante Justice","Train Combat","Train Hacking","Train Charisma","Territory Warfare"]
	ns.print(tasks);
	var trainTasks =[];
	var reduceWanted=[];
	var earnRespectWanted=[];
	for(task in tasks){
		taskstat[tasks[task]] = ns.gang.getTaskStats(tasks[task]);
		/*for(var stat in taskstat[tasks[task]]){
			ns.print(tasks[task]," : ",stat," : ",taskstat[tasks[task]][stat]);
		}*/
		ns.print(tasks[task]," : ",taskstat[tasks[task]]);
		if(tasks[task] == "Territory Warfare" || tasks[task] =="Unassigned"){
			continue
		}
		if(taskstat[tasks[task]]["baseRespect"]==0 && taskstat[tasks[task]]["baseWanted"]==0){
				trainTasks.push(tasks[task]);
		}
		else if(taskstat[tasks[task]]["baseWanted"]<0){
			reduceWanted.push(tasks[task]);
		}
		else{
			earnRespectWanted.push(tasks[task]);
		}
	}
	ns.print("train tasks: ", trainTasks);
	ns.print("reduce wanted tasks: ", reduceWanted);
	ns.print("earn respect & wanted tasks: ", earnRespectWanted);
	//ns.print(taskstat);
	//"name":"Unassigned"
	//,"desc":"This gang member is currently idle"
	//,"isHacking":true,"isCombat":true
	//,"baseRespect":0,"baseWanted":0,"baseMoney":0
	//,"hackWeight":100,"strWeight":0,"defWeight":0,"dexWeight":0,"agiWeight":0,"chaWeight":0
	//,"difficulty":1,"territory":{"money":1,"respect":1,"wanted":1}}
	var equipments = ns.gang.getEquipmentNames();
	ns.print(equipments);
	var equipements_list=[],i;
	for (var eq in equipments){
		equipements_list[eq]={
			"name":equipments[eq]
			,"cost":ns.gang.getEquipmentCost(equipments[eq])
		}
	}
	ns.print(equipments);
	ns.print(equipements_list);
	while(check){
		if(ns.gang.canRecruitMember()){
			ns.gang.recruitMember("gang"+(ns.gang.getMemberNames().length));
		}
		members = ns.gang.getMemberNames();
		ns.print(members);
		//buy equipment
		for (eq in equipments){
			for(i in equipements_list){
				if(equipements_list[i]["name"]==equipments[eq]){
					equipements_list[i]["cost"] = ns.gang.getEquipmentCost(equipments[eq]);
				}
			}
		}
		equipements_list.sort(function(a, b){return a.cost - b.cost});
		//ns.print(equipements_list);
		for(i in equipements_list){
			for(member in members){
				var info = ns.gang.getMemberInformation(members[member]);
				if(info["upgrades"].indexOf(equipements_list[i]["name"])<0){
					if(ns.getServerMoneyAvailable("home")>equipements_list[i]["cost"]){
						ns.gang.purchaseEquipment(members[member], equipements_list[i]["name"]);
					}
				}
			}
		}
		//train
		for (var train in trainTasks){
			for(member in members){
				//ns.print(members[member]," doing ", trainTasks[train])
				ns.gang.setMemberTask(members[member], trainTasks[train]);
			}
			await delay(1000*60*5);
		}
		//not train
		for(task in earnRespectWanted){
			if(earnRespectWanted[task]=="Unassigned" || earnRespectWanted[task]["baseWanted"]>2){
				continue;
			}
			for(member in members){
				ns.gang.setMemberTask(members[member], earnRespectWanted[task]);
			}
			await delay(1000*10);
		}
		//reduce wanted
		while(ns.gang.getGangInformation()["wantedLevel"]>1.1){
			for(task in reduceWanted){
				for(member in members){
					ns.gang.setMemberTask(members[member], reduceWanted[task]);
				}
				await delay(1000*30);
				ns.print("Wanted level",ns.gang.getGangInformation()["wantedLevel"]);
			}
		}
		//ascension
		for(member in members){
			info = ns.gang.getMemberInformation(members[member]);
			asc_info = ns.gang.getAscensionResult(members[member]);
			//ns.print(members[member]," agi: ",info["agi_asc_mult"]," asc: ",asc_info["agi"]);
			//ns.print(members[member]," cha: ",info["cha_asc_mult"]," asc: ",asc_info["cha"]);
			//ns.print(members[member]," def: ",info["def_asc_mult"]," asc: ",asc_info["def"]);
			//ns.print(members[member]," dex: ",info["dex_asc_mult"]," asc: ",asc_info["dex"]);
			//ns.print(members[member]," hack: ",info["hack_asc_mult"]," asc: ",asc_info["hack"]);
			//ns.print(members[member]," str: ",info["str_asc_mult"]," asc: ",asc_info["str"]);
			if(asc_info["agi"]>(2) &&
			asc_info["cha"]>(2) &&
			asc_info["def"]>(2) &&
			asc_info["dex"]>(2) &&
			asc_info["hack"]>(2) &&
			asc_info["str"]>(2)){
				ns.gang.ascendMember(members[member])
			}
		}
	}
}
