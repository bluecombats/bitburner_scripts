/** @param {NS} ns */
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
export async function main(ns) {
	let graft_augs, graft_aug_price, graft_aug_time, aug_pre_req, own_augs;
	let i, aug, test;
	let delay_time = 3;
	let l, aug_price, pre_count
	graft_augs = ns.grafting.getGraftableAugmentations();
	while(graft_augs.length > 0){
		await delay(1000*delay_time);
		graft_augs = ns.grafting.getGraftableAugmentations();
		test = new Date(Date.now());
		ns.print(test.toLocaleString(
			'en-GB',{
				dateStyle: 'full',
				timeStyle: 'long',
				timezone: 'Europe/London'
			}
		));
		ns.print("current work: ",ns.singularity.getCurrentWork());
		ns.print("busy? ",ns.singularity.isBusy());
		if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]!="GRAFTING"){
			ns.print("working but not grafting");
			await delay(1000*delay_time);
			continue;
		}
		else if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]=="GRAFTING"){
			ns.print("grafting and waiting...");
			await delay(1000*delay_time);
			// await ns.grafting.waitForOngoingGrafting();
		}
		else if(!ns.singularity.isBusy()){
			for(i=0; i<graft_augs.length; i++){
				aug = graft_augs[i];
				graft_aug_price = ns.grafting.getAugmentationGraftPrice(aug);
				graft_aug_time = ns.grafting.getAugmentationGraftTime(aug);
				aug_pre_req = ns.singularity.getAugmentationPrereq(aug);
				own_augs = ns.singularity.getOwnedAugmentations();
				ns.print(aug,
				" $",numberFormat(graft_aug_price),
				" time:",graft_aug_time,
				" reg:",aug_pre_req);
				pre_count=0;
				for(l=0; l<aug_pre_req.length; l++){
					if(own_augs.includes(aug_pre_req[l])){
						pre_count+=1;
					}
				}
				ns.print(aug,
				" pre req: ",aug_pre_req.length,
				" owned count: ",pre_count);
				// ns.print("re check: ", (aug_pre_req.length - pre_count) <0.1);
				// ns.print("money check: ",graft_aug_price < ns.getServerMoneyAvailable("home"));
				if(((aug_pre_req.length - pre_count) <0.1) && 
				(graft_aug_price < ns.getServerMoneyAvailable("home"))){
					ns.print("grafting "+ aug);
					ns.grafting.graftAugmentation(aug, false);
					// await delay(1000*delay_time);
					await ns.grafting.waitForOngoingGrafting();
				}else{
					ns.print("didn't own other augs or can't afford");
					await delay(1000*delay_time);
					continue;
				}
			}
		}
		await delay(1000*delay_time);
	}
}
