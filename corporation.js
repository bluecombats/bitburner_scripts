/** @param {NS} ns */
function delay(milliseconds){
	return new Promise(resolve => {
			setTimeout(resolve, milliseconds);
	});
}
function moneyFormat(money){
    var moneySplit;
    if(Math.abs(money/Math.pow(10,12)) >1){
        moneySplit = money/Math.pow(10,12);
        return "$"+String(moneySplit).substring(0,6)+"tr";
    }
    else if(Math.abs(money/Math.pow(10,9)) >1){
        moneySplit = money/Math.pow(10,9);
        return "$"+String(moneySplit).substring(0,6)+"bn";
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
	if(!ns.corporation.hasCorporation()){
		ns.print("haven't built a corporation yet");
		if(ns.getServerMoneyAvailable("home") > 150*Math.pow(10,9)){
			ns.corporation.createCorporation("corp1");
		}else{
			return "try again";
		}
	}
	let while_loop=true,corp_data, divisions, divisionData, industryData, sectors,i,j,officeData;
	let warehouseData, produceMaterials,materialData,k,materialPrice, exports;
	const corp_consts= ns.corporation.getConstants();
		// ns.print(corp_consts);
	while(while_loop){
		await ns.corporation.nextUpdate();
		//get corp data
		corp_data = ns.corporation.getCorporation();
		ns.print(`nextState: ${corp_data.nextState}, prevState: ${corp_data.prevState}`);
		if(corp_data.prevState!="START"){
			continue
		}
		divisions = corp_data.divisions;
		//create a new industry
		if(divisions.length==0){
			//create a division
			ns.corporation.expandIndustry("Agriculture","agg1");
		}
		//unlock corp upgrades
		for(i=0; i<corp_consts.unlockNames.length; i++){
			if(!ns.corporation.hasUnlock(corp_consts.unlockNames[i]) && (
				corp_data.funds > ns.corporation.getUnlockCost(corp_consts.unlockNames[i]))){
					ns.corporation.purchaseUnlock(corp_consts.unlockNames[i]);
			}
		}
		//loop every division
		for(i=0; i<divisions.length; i++){
			divisionData = ns.corporation.getDivision(divisions[i]);
			ns.print(`${divisionData.type}: ${divisionData.name}`);
			industryData = ns.corporation.getIndustryData(divisionData["type"]);
			// ns.print("industry data:",industryData);
			sectors = divisionData.cities;
			for(j=0; j<sectors.length; j++){
				ns.print(sectors[j]);
				//check warehouse exist in city, if not skip city
				if(!ns.corporation.hasWarehouse(divisions[i],sectors[j])){
					ns.corporation.purchaseWarehouse(
						divisions[i],
						sectors[j]);
				}
				if(!ns.corporation.hasWarehouse(divisions[i],sectors[j])){
					continue;
				}
				warehouseData = ns.corporation.getWarehouse(divisions[i],sectors[j]);
				// ns.print("warehouse data:",warehouseData);
				//set smart supply to on
				ns.corporation.setSmartSupply(divisions[i],sectors[j],true);
				officeData = ns.corporation.getOffice(divisions[i],sectors[j]);
				// ns.print("office data",officeData);
				//check employees
				if(officeData.numEmployees <= officeData.size){
					//hire employee and assign position
					// ns.OfficeAPI.hireEmployee(divisions[i],sectors[j],)
				}
				//manage sell price  of industry
				if(industryData.makesMaterials){
					for(k=0; k<industryData.producedMaterials.length; k++){
						materialData = ns.corporation.getMaterial(
							divisions[i],
							sectors[j],
							industryData.producedMaterials[k]
						);
						ns.print(industryData.producedMaterials[k], materialData);
						//deal with exports
						exports =0;
						for(var l; l<materialData.exports.length;l++){
							exports+= materialData.exports[l].amount;
						}
						materialPrice = materialData.desiredSellPrice;
						if(typeof(materialPrice)!="number"){
							materialPrice = Math.floor(materialData.marketPrice);
						}
						ns.print("Material price: ",materialPrice);
						if(materialData.actualSellAmount < materialData.productionAmount || materialData.stored >0){
							materialPrice = Number(materialPrice)-1;
						}else{
							materialPrice = Number(materialPrice)+1;
						}
						if(Number(materialPrice)<0){
							materialPrice = 0;
						}
						ns.print("Material price: ",materialPrice);
						ns.corporation.sellMaterial(
							divisions[i],
							sectors[j],
							industryData.producedMaterials[k],
							"MAX",
							Math.floor(materialPrice)
						)
					}
				}else if(industryData.makesProducts){
					for(k=0; k<divisionData.products.length; k++){
						//ns.print(industryData.product);
						materialData = ns.corporation.getProduct(
							divisions[i],
							sectors[j],
							divisionData.products[k]
						);
						ns.print(divisionData.products[k], materialData);
						materialPrice = materialData.desiredSellPrice;
						if(typeof(materialPrice)!="number"){
							materialPrice = Math.floor(materialData.productionCost);
						}
						ns.print("product price: ",materialPrice);
						if(materialData.actualSellAmount < materialData.productionAmount || materialData.stored >0){
							materialPrice = Number(materialPrice)-1;
						}else{
							materialPrice = Number(materialPrice)+1;
						}
						ns.print("product price: ",materialPrice);
						ns.corporation.sellProduct(
							divisions[i],
							sectors[j],
							divisionData.products[k],
							"MAX",
							Math.floor(materialPrice)
						)
					}
				}
			}
		}
	}
}
