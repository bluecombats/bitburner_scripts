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
	let warehouseData, produceMaterials,materialData,k,materialPrice;
	const corp_consts= ns.corporation.getConstants();
		// ns.print(corp_consts);
		/*
			{"PurchaseMultipliers":{"x1":1,"x5":5,"x10":10,"x50":50,"x100":100,"MAX":"MAX"},
			"baseProductProfitMult":5,
			"bribeAmountPerReputation":1000000000,
			"bribeThreshold":100000000000000,
			"dividendMaxRate":1,
			"employeePositions":["Operations","Engineer","Business","Management","Research & Development","Intern","Unassigned"],
			"employeeRaiseAmount":50,
			"employeeSalaryMultiplier":3,
			"gameCyclesPerCorpStateCycle":10,
			"gameCyclesPerMarketCycle":50,
			"industryNames":["Water Utilities","Spring Water","Agriculture","Fishing","Mining","Refinery","Restaurant","Tobacco","Chemical","Pharmaceutical","Computer Hardware","Robotics","Software","Healthcare","Real Estate"],
			"initialShares":1000000000,
			"issueNewSharesCooldown":72000,
			"marketCyclesPerEmployeeRaise":400,
			"materialNames":["Water","Ore","Minerals","Food","Plants","Metal","Hardware","Chemicals","Drugs","Robots","AI Cores","Real Estate"],
			"maxProductsBase":3,
			"minEmployeeDecay":10,
			"officeInitialCost":4000000000,
			"officeInitialSize":3,
			"officeSizeUpgradeCostBase":1000000000,
			"researchNames":["Hi-Tech R&D Laboratory","AutoBrew","AutoPartyManager","Automatic Drug Administration","CPH4 Injections","Drones","Drones - Assembly","Drones - Transport","Go-Juice","HRBuddy-Recruitment","HRBuddy-Training","Market-TA.I","Market-TA.II","Overclock","Self-Correcting Assemblers","Sti.mu","uPgrade: Capacity.I","uPgrade: Capacity.II","uPgrade: Dashboard","uPgrade: Fulcrum"],
			"researchNamesBase":["Hi-Tech R&D Laboratory","AutoBrew","AutoPartyManager","Automatic Drug Administration","CPH4 Injections","Drones","Drones - Assembly","Drones - Transport","Go-Juice","HRBuddy-Recruitment","HRBuddy-Training","Market-TA.I","Market-TA.II","Overclock","Self-Correcting Assemblers","Sti.mu"],
			"researchNamesProductOnly":["uPgrade: Capacity.I","uPgrade: Capacity.II","uPgrade: Dashboard","uPgrade: Fulcrum"],
			"secondsPerMarketCycle":10,"sellSharesCooldown":18000,
			"sharesPerPriceUpdate":1000000,
			"smartSupplyOptions":["leftovers","imports","none"],
			"stateNames":["START","PURCHASE","PRODUCTION","EXPORT","SALE"],
			"teaCostPerEmployee":500000,
			"unlockNames":["Export","Smart Supply","Market Research - Demand","Market Data - Competition","VeChain","Shady Accounting","Government Partnership","Warehouse API","Office API"],
			"upgradeNames":["Smart Factories","Smart Storage","DreamSense","Wilson Analytics","Nuoptimal Nootropic Injector Implants","Speech Processor Implants","Neural Accelerators","FocusWires","ABC SalesBots","Project Insight"],
			"warehouseInitialCost":5000000000,
			"warehouseInitialSize":100,
			"warehouseSizeUpgradeCostBase":1000000000}
		*/
	while(while_loop){
		//get corp data
		corp_data = ns.corporation.getCorporation();
		// ns.print("corp data:",corp_data);
		/*
			{"name":"corp1",
			"funds":39641564199.636116,
			"revenue":6256.354197789911,
			"expenses":4600.210078609789,
			"public":false,
			"totalShares":1000000000,
			"numShares":1000000000,
			"shareSaleCooldown":0,
			"investorShares":0,
			"issuedShares":0,
			"issueNewSharesCooldown":0,
			"sharePrice":0.019276769059052932,
			"dividendRate":0,
			"dividendTax":0.4,
			"dividendEarnings":0,
			"nextState":"PURCHASE",
			"prevState":"START",
			"divisions":["agg"],
			"state":"PURCHASE"} //state will be going away
		*/
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
			/*
				{"name":"agg",
				"type":"Agriculture",
				"awareness":3.0149999999999997,
				"popularity":0.9086000000000112,
				"productionMult":1,
				"researchPoints":253.99976629321938,
				"lastCycleRevenue":6953.4355877101525,
				"lastCycleExpenses":4822.015749482463,
				"thisCycleRevenue":0,
				"thisCycleExpenses":5365.706999999979,
				"numAdVerts":1,
				"cities":["Sector-12"],
				"products":[],
				"makesProducts":false,
				"maxProducts":0}
			*/
			industryData = ns.corporation.getIndustryData(divisionData["type"]);
			// ns.print(industryData);
			/*
				{"startingCost":40000000000,
				"description":"Cultivate crops and breed livestock to produce food.",
				"recommendStarting":true,
				"realEstateFactor":0.72,
				"scienceFactor":0.5,
				"hardwareFactor":0.2,
				"robotFactor":0.3,
				"aiCoreFactor":0.3,
				"advertisingFactor":0.04,
				"requiredMaterials":{"Water":0.5,"Chemicals":0.2},
				"producedMaterials":["Plants","Food"],
				"makesMaterials":true,
				"makesProducts":false}
			*/
			sectors = divisionData.cities;
			for(j=0; j<sectors.length; j++){
				ns.print(sectors[j]);
				officeData = ns.corporation.getOffice(divisions[i],sectors[j]);
				// ns.print(officeData);
				//set smart supply to on
				ns.corporation.setSmartSupply(divisions[i],sectors[j],true);
				//check employees
				if(officeData.numEmployees <= officeData.size){
					//hire employee and assign position
					// ns.OfficeAPI.hireEmployee(divisions[i],sectors[j],)
				}
				//manage sell price  of industry
				for(k=0; k<industryData.producedMaterials.length; k++){
					materialData = ns.corporation.getMaterial(
						divisions[i],
						sectors[j],
						industryData.producedMaterials[k]
					);
					ns.print(industryData.producedMaterials[k], materialData);
					if(materialData.desiredSellPrice.indexOf("MP")>=0){
						materialPrice = materialData.desiredSellPrice.substring("MP+".length);
						ns.print("Material price: ",materialPrice);
						if(materialData.productionAmount<=materialData.actualSellAmount){
							materialPrice = Number(materialPrice)+1;
						}else{
							materialPrice = Number(materialPrice)-1;
						}
					}else{
						materialPrice = 0;
					}					
					ns.corporation.sellMaterial(
						divisions[i],
						sectors[j],
						industryData.producedMaterials[k],
						"MAX",
						`MP+${materialPrice}`
					)
				}
				warehouseData = ns.corporation.getWarehouse(divisions[i],sectors[j]);
			}
		}
		await delay(1000*2);
	}
}
