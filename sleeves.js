/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function fraction_max_rep(ns,fraction_works, person, favor){
	let i,field,max_rep=0, gain;
	for(i=0;i<fraction_works.length;i++){
		gain = ns.formulas.work.factionGains(
				person,
				fraction_works[i],
				favor
			);
			// ns.print(fraction_works[i]," ",gain);
		if(gain["reputation"]>max_rep){
			max_rep = gain["reputation"];
			field = fraction_works[i];
		}
	}
	return field
}
function find_max_fraction_aug(ns, fraction_augs, owned_augs){
	let max_rep_req=0;
	let i, max_aug;
	// ns.print(fraction_augs);
	for(i=0;i<fraction_augs.length;i++){
		if(!owned_augs.includes(fraction_augs[i]) && 
		ns.singularity.getAugmentationRepReq(fraction_augs[i])>max_rep_req){
			max_rep_req = ns.singularity.getAugmentationRepReq(fraction_augs[i]);
			max_aug = fraction_augs[i];
		}
	}
	return max_aug;
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
export async function main(ns) {
	let delay_time=3 ,num_sleeves, i, sleeve_info;
	let aug_price, aug_rep, aug, aug_pur, j;
	let fractions,fraction_augs,k, fraction_work, fraction_rep, fraction_fav;
	let person;
	while(true){
		num_sleeves = ns.sleeve.getNumSleeves();
		person = ns.getPlayer();
		fractions = person["factions"];
		// ns.print("fraction invites: ",fractions);
		for(i=0;i<num_sleeves;i++){
			sleeve_info = ns.sleeve.getSleeve(i);
			ns.print(`sleeve ${i}`);
			//shock recovery
			if(sleeve_info["shock"]>1){
				ns.sleeve.setToShockRecovery(i);
				continue;
			}
			//sync
			if(sleeve_info["sync"]<(100/num_sleeves)){
				ns.sleeve.setToSynchronize(i);
				continue;
			}
			//augentation in fractions
			aug = ns.sleeve.getSleeveAugmentations(i);
			//ns.print(i," purchased auguments ",aug);
			aug_pur = ns.sleeve.getSleevePurchasableAugs(i);
			for(j=0;j<fractions.length;j++){
				fraction_augs = ns.singularity.getAugmentationsFromFaction(fractions[j]);
				fraction_rep = ns.singularity.getFactionRep(fractions[j]);
				fraction_fav = ns.singularity.getFactionFavor(fractions[j]);
				let max_fraction_aug = find_max_fraction_aug(ns, fraction_augs, aug)
				ns.print(`${i} faction: ${fractions[j]} aug not aquired: ${max_fraction_aug}`);
				if(max_fraction_aug && !aug.includes(max_fraction_aug)){
					//haven't purchased it yet
					if(fraction_rep < ns.sleeve.getSleeveAugmentationRepReq(max_fraction_aug)){
						//then work for it
						fraction_work = ns.singularity.getFactionWorkTypes(fractions[j]);
						ns.print("fraction work options", fraction_work);
						ns.sleeve.setToFactionWork(
							i,
							fractions[j],
							fraction_max_rep(ns,fraction_work, sleeve_info, fraction_fav));
							break;
					}else{
						//pay for it
						for(k=0;k<aug_pur.length;k++){
							//ns.print(aug_pur[k]);
							let aug_pre_req = ns.singularity.getAugmentationPrereq(aug_pur[k]["name"]);
							let l, aug_price, pre_count=0;
							for(l=0;l<aug_pre_req.length;l++){
								aug_price = ns.singularity.getAugmentationPrice(aug_pre_req[l]);
								if(!aug.includes(aug_pre_req[l]) && aug_pur.includes(aug_pre_req[l]) &&
								ns.getServerMoneyAvailable("home")>aug_price){
									ns.sleeve.purchaseSleeveAug(i,aug_pre_req[l]);
								}
								if(aug.includes(aug_pre_req[l])){
									pre_count+=1;
								}
							}
							if(pre_count == aug_pre_req.length && 
							ns.getServerMoneyAvailable("home")>ns.singularity.getAugmentationPrice(aug_pur[k]["name"])){
								ns.sleeve.purchaseSleeveAug(i,aug_pur[k]["name"]);
							}
						}
					}
				}
			}
			//earn money
		}
		await delay(1000*delay_time);
	}
}
