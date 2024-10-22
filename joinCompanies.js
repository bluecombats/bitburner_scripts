/** @param {NS} ns */
function delay(milliseconds){
	return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
	});
}
export async function main(ns) {
	const company_dict=[
		{
			"sector":"Aevum",
			"company":"ECorp",
			"faction_name": "ECorp"
		},{
			"sector":"Aevum",
			"company":"Bachman & Associates",
			"faction_name": "Bachman & Associates"
		},{
			"sector":"Aevum",
			"company":"Clarke Incorporated",
			"faction_name": "Clarke Incorporated"
		},{
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
			"sector":"Volhaven",
			"company":"NWO",
			"faction_name": "NWO"
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
	let company_count=0,i,j,company,workTypes, player_skills, faction_rep, faction_favour;
	let max_rep_gain, work_field, workreq, work_stats, fraction_invites;

	while(company_count<company_dict.length){
		company_count=0;
		ns.print(ns.singularity.getCurrentWork());
		fraction_invites = ns.getPlayer()["factions"];
		for(i=0; i<company_dict.length; i++){
			company = company_dict[i]["company"];
			ns.print("Company: ",company);
			if(fraction_invites.indexOf(company_dict[i]["faction_name"])>=0){
				company_count+=1;
				ns.print(`Fraction invite already recieved`);
				ns.singularity.joinFaction(company_dict[i]["faction_name"]);
				if(ns.singularity.getCurrentWork() && "companyName" in ns.singularity.getCurrentWork() && (
					ns.singularity.getCurrentWork().companyName == company)){
					//stop working for that company
					ns.singularity.stopAction();
				}
				continue;
			}
			else if((!ns.singularity.isBusy() && !ns.singularity.isFocused()) || 
			((ns.singularity.isBusy() || ns.singularity.isFocused()) && (
				ns.singularity.getCurrentWork().companyName ?? 'blah'==company))){
				workTypes = ns.singularity.getCompanyPositions(company);
				player_skills = ns.getPlayer()["skills"];
				faction_rep = ns.singularity.getFactionRep(company_dict[i]["faction_name"]);
				faction_favour = ns.singularity.getCompanyFavor(company);

				max_rep_gain=0;
				work_field='';
				for(j=0; j<workTypes.length;j++){
					workreq = ns.singularity.getCompanyPositionInfo(company,workTypes[j]);
					if(faction_rep >= workreq["requiredReputation"] &&
					player_skills["hacking"]>= workreq["requiredSkills"]["hacking"]&&
					player_skills["strength"]>= workreq["requiredSkills"]["strength"]&&
					player_skills["defense"]>= workreq["requiredSkills"]["defense"]&&
					player_skills["dexterity"]>= workreq["requiredSkills"]["dexterity"]&&
					player_skills["agility"]>= workreq["requiredSkills"]["agility"]&&
					player_skills["charisma"]>= workreq["requiredSkills"]["charisma"]&&
					player_skills["intelligence"]>= workreq["requiredSkills"]["intelligence"]){
						// ns.print("passed")
						work_stats = ns.formulas.work.companyGains(
							ns.getPlayer(),
							company,
							workreq["name"],
							faction_favour
						);
						if(work_stats["reputation"]>max_rep_gain){
							max_rep_gain = work_stats["reputation"];
							work_field = workreq["field"]
						}
					}
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
