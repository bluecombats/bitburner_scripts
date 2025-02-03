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
	let graft_augs, graft_aug_price, graft_aug_time;
	let i,aug;
	let delay_time = 3;
	while(true){
		graft_augs = ns.grafting.getGraftableAugmentations();
		if(graft_augs.length==0){
			break;
		}
		for(i=0;i<graft_augs.length;i++){
			aug = graft_augs[i];
			graft_aug_price = ns.grafting.getAugmentationGraftPrice(aug);
			graft_aug_time = ns.grafting.getAugmentationGraftTime(aug);
			let aug_pre_req = ns.singularity.getAugmentationPrereq(aug_pur[k]["name"]);
			let own_augs = ns.singularity.getOwnedAugmentations();
			let l, aug_price, pre_count=0;
			for(l=0;l<aug_pre_aug.length;i++){
				if(own_augs.includes(aug_pre_req[l])){
					pre_count+=1;
				}
			}
			if(pre_count!=aug_pre_aug.length){
				continue;
			}
			ns.print(ns.singularity.getCurrentWork());
			if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]!="GRAFTING"){
				continue
			}
			else if(ns.singularity.isBusy() && ns.singularity.getCurrentWork()["type"]=="GRAFTING"){
				await ns.grafting.waitForOngoingGrafting();
			}
			else if(!ns.singularity.isBusy()){
				ns.grafting.graftAugmentation(aug, false);
			}
		}
		await delay(1000*delay_time);
	}
}
