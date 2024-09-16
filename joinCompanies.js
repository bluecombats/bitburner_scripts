/** @param {NS} ns */
function delay(milliseconds){
	return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
	});
}
export async function main(ns) {
	const company_dict=[
		{
			"sector":"Sector-12",
			"company":"Blade Industries",
			"faction_name": "Blade Industries"
		},{
			"sector":"Sector-12",
			"company":"MegaCorp",
			"faction_name": "MegaCorp"
		},{
			"sector":"Sector-12",
			"company":"Four Sigma",
			"faction_name": "Four Sigma"
		},{
			"sector":"Aevum",
			"company":"ECorp",
			"faction_name": "ECorp"
		},{
			"sector":"Aevum",
			"company":"Bachman & Associates",
			"faction_name": "Bachman & Associates"
		},{
			"sector":"Volhaven",
			"company":"NWO",
			"faction_name": "NWO"
		},{
			"sector":"Aevum",
			"company":"Clarke Incorporated",
			"faction_name": "Clarke Incorporated"
		},{
			"sector":"Volhaven",
			"company":"OmniTek Incorporated",
			"faction_name": "OmniTek Incorporated"
		},{
			"sector":"Chongqing",
			"company":"KuaiGong International",
			"faction_name": "KuaiGong International"
		},{
			"sector":"Aevum",
			"company":"Fulcrum Technologies",
			"faction_name": "Fulcrum Secret Technologies"
		}
	]
	var company_count=0;
	while(company_count<company_dict.length){
		company_count=0;
		for(var i=0; i<company_dict.length; i++){
			var company = company_dict[i]["company"];
			ns.print(company);
			var fraction_invites = ns.getPlayer()["factions"];
			//var fraction_invites = ns.singularity.checkFactionInvitations();
			// ns.print(fraction_invites);
			if(fraction_invites.indexOf(company_dict[i]["faction_name"])>=0){
				company_count+=1;
				ns.print(`Fraction invite already recieved`);
				// ns.print(ns.getPlayer()["location"]);
				if(ns.getPlayer()["location"] == company){
					//stop working for that company
					ns.singularity.stopAction();
				}
				continue;
			}
			if((!ns.singularity.isBusy() && !ns.singularity.isFocused()) || 
			((ns.singularity.isBusy() || ns.singularity.isFocused()) && ns.getPlayer()["location"]==company)){
				var workTypes = ns.singularity.getCompanyPositions(company);
				var player_skills = ns.getPlayer()["skills"];
				var player_city = ns.getPlayer()["city"];
				var faction_rep = ns.singularity.getFactionRep(company_dict[i]["faction_name"]);
				var faction_favour = ns.singularity.getCompanyFavor(company);

				var max_rep_gain=0,work_field='';
				for(var j=0; j<workTypes.length;j++){
					var workreq = ns.singularity.getCompanyPositionInfo(company,workTypes[j]);
					// ns.print(workreq);
					// ns.print(`reputation: ${faction_rep} ${workreq["requiredReputation"]}`);
					// ns.print(`hacking: ${player_skills["hacking"]}, ${workreq["requiredSkills"]["hacking"]}`);
					if(faction_rep >= workreq["requiredReputation"] &&
					player_skills["hacking"]>= workreq["requiredSkills"]["hacking"]&&
					player_skills["strength"]>= workreq["requiredSkills"]["strength"]&&
					player_skills["defense"]>= workreq["requiredSkills"]["defense"]&&
					player_skills["dexterity"]>= workreq["requiredSkills"]["dexterity"]&&
					player_skills["agility"]>= workreq["requiredSkills"]["agility"]&&
					player_skills["charisma"]>= workreq["requiredSkills"]["charisma"]&&
					player_skills["intelligence"]>= workreq["requiredSkills"]["intelligence"]){
						// ns.print("passed")
						var work_stats = ns.formulas.work.companyGains(
							ns.getPlayer(),
							company,
							workreq["name"],
							faction_favour
						);
						// ns.print(company, workreq["name"], work_stats);
						if(work_stats["reputation"]>max_rep_gain){
							max_rep_gain = work_stats["reputation"];
							work_field = workreq["field"]
						}
					}
					//ns.print(`${company} ${workTypes[j]}: `,workreq);
					/*{"name":"Network Administrator",
					"field":"Network Engineer",
					"nextPosition":"Head of Engineering",
					"salary":820,
					"requiredReputation":175000,
					"requiredSkills":{"hacking":475,"strength":0,"defense":0,"dexterity":0,
					"agility":0,"charisma":300,"intelligence":0}}*/
				}
				ns.singularity.applyToCompany(company,work_field);
				ns.singularity.workForCompany(company, false);
				ns.singularity.joinFaction(company_dict[i]["faction_name"]);
			}
			break;
		}
		await delay(1000*1);
	}
}
