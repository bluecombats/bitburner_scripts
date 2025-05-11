/** @param {NS} ns */
function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
function numberFormat(x){
    var moneySplit;
    if(Math.abs(x/Math.pow(10,18)) >1){
        moneySplit = x/Math.pow(10,18);
        return String(moneySplit).substring(0,7)+"Q";
    }else if(Math.abs(x/Math.pow(10,15)) >1){
        moneySplit = x/Math.pow(10,15);
        return String(moneySplit).substring(0,7)+"q";
    }else if(Math.abs(x/Math.pow(10,12)) >1){
        moneySplit = x/Math.pow(10,12);
        return String(moneySplit).substring(0,6)+"tr";
    }else if(Math.abs(x/Math.pow(10,9)) >1){
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
function display_date(){
	let test = new Date(Date.now());
	return test.toLocaleString(
		'en-GB',{
			dateStyle: 'full',
			timeStyle: 'long',
			timezone: 'Europe/London'
		}
	);	
}
function mergeSort(ns,arr,method="cost"){
	let mid, leftHalf, rightHalf, sortedLeft, sortedRight;
	if(Array.isArray(arr) && arr.length<=1){
		return arr
	}
	mid = Math.floor(arr.length/2);
	leftHalf = arr.slice(0, mid);
	rightHalf = arr.slice(mid, arr.length);

	sortedLeft = mergeSort(ns,leftHalf,method);
	sortedRight = mergeSort(ns,rightHalf,method);

	return sort_augs(ns, sortedLeft, sortedRight, method);
}
function sort_augs(ns,left,right,method){
	let result=[];
	let i=0,j=0,k;
	while(Array.isArray(left) && i<left.length && Array.isArray(right) && j<right.length){
		// ns.print(left[i],right[j]);
		if(method=="cost"){
			if(ns.grafting.getAugmentationGraftPrice(left[i])<ns.grafting.getAugmentationGraftPrice(right[j])){
				result.push(left[i]);
				i+=1;
			}else{
				result.push(right[j]);
				j+=1;
			}
		}else if(method=="time"){
			if(ns.grafting.getAugmentationGraftTime(left[i])<ns.grafting.getAugmentationGraftTime(right[j])){
				result.push(left[i]);
				i+=1;
			}else{
				result.push(right[j]);
				j+=1;
			}
		}
	}
	for(k=i;k<left.length;k++){
		result.push(left[k])
	}
	for(k=j;k<right.length;k++){
		result.push(right[k])
	}
	return result;
}
function split_augs(ns,augs){
	let rep_augs=[], hack_augs=[],combat_augs=[],other_augs=[],hacknet_augs=[],crime_augs=[];
	let i=0, stats, all_augs=[];
	for(i=0;i<augs.length;i++){
		stats = ns.singularity.getAugmentationStats(augs[i]);
		// ns.print(augs[i],stats);
		if(stats["faction_rep"]>1 ||
		stats["company_rep"]>1){
			rep_augs.push(augs[i]);
		}else if(stats["hacking_chance"]>1 ||
		stats["hacking_exp"]>1||
		stats["hacking_grow"]>1||
		stats["hacking_money"]>1||
		stats["hacking_speed"]>1||
		stats["hacking"]>1){
			hack_augs.push(augs[i]);
		}else if(stats["hacknet_node_core_cost"]<1 ||
		stats["hacknet_node_level_cost"]<1||
		stats["hacknet_node_purchase_cost"]<1||
		stats["hacknet_node_ram_cost"]<1||
		stats["hacknet_node_money"]>1){
			hacknet_augs.push(augs[i]);
		}else if(stats["agility_exp"]>1 ||
		stats["agility"]>1||
		stats["charisma_exp"]>1||
		stats["charisma"]>1||
		stats["defense_exp"]>1||
		stats["defense"]>1||
		stats["dexterity_exp"]>1||
		stats["dexterity"]>1||
		stats["strength_exp"]>1||
		stats["strength"]>1){
			combat_augs.push(augs[i]);
		}else{
			other_augs.push(augs[i]);
		}
	}
	// ns.print("rep augs", rep_augs);
	// ns.print("hacknet_augs", hacknet_augs);
	// ns.print("hack_augs", hack_augs);
	// ns.print("combat_augs", combat_augs);
	// ns.print("other_augs", other_augs);
	all_augs = rep_augs.concat(hacknet_augs, hack_augs, combat_augs, other_augs);
	return all_augs;
}
export async function main(ns) {
	let graft_augs, graft_aug_price, graft_aug_time, aug_pre_req, own_augs;
	let i, aug, test;
	let delay_time = 3;
	let l, aug_price, pre_count
	graft_augs = ns.grafting.getGraftableAugmentations();
	while(graft_augs.length > 0){
		await delay(1000*delay_time);
		graft_augs = ns.grafting.getGraftableAugmentations();
		//sort augs
		graft_augs = mergeSort(ns,graft_augs);
		// ns.print("sorted list:",graft_augs);
		//filter augs
		graft_augs = split_augs(ns,graft_augs);
		// ns.print("priority list:",graft_augs);
		test = new Date(Date.now());
		ns.print(display_date());
		ns.print("current work: ",ns.singularity.getCurrentWork());
		ns.print("busy? ",ns.singularity.isBusy());
		if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]!="GRAFTING"){
			ns.print("working but not grafting");
			await delay(1000*delay_time);
			continue;
		}
		else if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]=="GRAFTING"){
			ns.print("grafting and waiting...");
			await ns.grafting.waitForOngoingGrafting();
		}
		else if(!ns.singularity.isBusy()){
			//sort augs
			graft_augs = mergeSort(ns,graft_augs);
			// ns.print("sorted list:",graft_augs);
			//filter augs
			graft_augs = split_augs(ns,graft_augs);
			// ns.print("priority list:",graft_augs);
			for(i=0; i<graft_augs.length; i++){
				aug = graft_augs[i];
				graft_aug_price = ns.grafting.getAugmentationGraftPrice(aug);
				graft_aug_time = ns.grafting.getAugmentationGraftTime(aug);
				aug_pre_req = ns.singularity.getAugmentationPrereq(aug);
				own_augs = ns.singularity.getOwnedAugmentations();
				ns.print(aug,
				" $",numberFormat(graft_aug_price),
				" time:",timeFormat(graft_aug_time),
				" reg:",aug_pre_req);
				pre_count=0;
				for(l=0; l<aug_pre_req.length; l++){
					if(own_augs.includes(aug_pre_req[l])){
						pre_count+=1;
					}
				}
				
				ns.print(display_date());
				ns.print(aug,
				" pre req: ",aug_pre_req.length,
				" owned count: ",pre_count);
				// ns.print("re check: ", (aug_pre_req.length - pre_count) <0.1);
				// ns.print("money check: ",graft_aug_price < ns.getServerMoneyAvailable("home"));
				if(((aug_pre_req.length - pre_count) <0.1) && 
				(graft_aug_price < ns.getServerMoneyAvailable("home"))){
					ns.print("grafting "+ aug);
					ns.grafting.graftAugmentation(aug, false);
					await ns.grafting.waitForOngoingGrafting();
				}else{
					ns.print("didn't own other augs or can't afford");
					continue;
				}
			}
		}
	}
}
