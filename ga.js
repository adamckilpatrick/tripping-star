function genome() {
	this.ruleSet=[["0","01[0[01]]00"],["1","11"]];
	this.numIter=3;
	
	this.angle=20;
	this.numSpokes=6;
	this.rotSpeed=.001;
	
	//Speed at which variations in angle in the branches happens, increase for faster "uncurling" of the arms
	this.spreadSpeed=.001;
	this.spreadRange=30;
	
	this.size=.5;
	this.sizeSpeed=.001;
	this.sizeRange=.3;
	
	//overall speed at which color changes, increase for more strobe like effect
	this.cColSpeed=.0008;
	this.cColRange=200;
	
	//the color variation as the colors change up the spokes, increase for a more "rainbow-y" effect in the structure
	this.lColSpeed=.00008;
	this.lColRange=80;
	
	//speed at which the particles spread out from the calculated lines of the system
	this.noiseSpeed=.001;
	//amount that the particles spread from the lines
	this.noiseMag=6;
	
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//some constants for mutation
var ruleMutProb=.3;
var defMutFactor=1.5;
var angles=[10,15,20,30,45,60,90,120,180];
var spokes=[];
for(var i=0; i<angles.length; i++)
{
	spokes.push([]);
	for(var j=2; j*angles[i]<=360; j++)
	{
		if(360%(j*angles[i])==0)
		{
			spokes[i].push(j);
		}
	}	
}
function mutate(inGenome) {
	var key = "ruleSet";
	if(Math.random()>ruleMutProb)
	{
		key=Object.keys(inGenome)[getRandomInt(0,Object.keys(inGenome).length)];
	}
	//console.log(key);
	
	switch(key){
		case "ruleSet":
			inGenome.ruleSet[0][1]=stringifyFract(mutRuleSet(arrayifyFract(inGenome.ruleSet[0][1])));
		break;
		
		case "numIter":
			if(Math.random()>.5)
			{
				inGenome.numIter+=1;
			}
			else
			{
				inGenome.numIter-=1;
			}
		break;
		
		case "angle":
			var tempAng=inGenome.angle;
			inGenome.angle=angles[getRandomInt(0,angles.length)];
			inGenome.spreadRange*=tempAng/inGenome.angle;
		break;
		
		//Numspokes used to be dependent on angle but it should be good to be on its own with new way of cloning a single l-system branch rather than doing axiom magic
		case "numSpokes":
			//inGenome.numSpokes=spokes[angles.indexOf(inGenome.angle)][getRandomInt(0,spokes[angles.indexOf(inGenome.angle)].length)];
			var newSpokes=getRandomInt(0,19);
			while(360%newSpokes!=0)
			{
				newSpokes=getRandomInt(0,19);
			}
			inGenome.numSpokes=newSpokes;
		break;

		default:
			if(Math.random()>.5)
			{
				inGenome[key]*=defMutFactor;
			}
			else
			{
				inGenome[key]/=defMutFactor;
			}
	}
}

function cloneRules(inRules){
	var outRules=[];
	for(var i=0; i<inRules.length; i++)
	{
		if(typeof(inRules[i])=="string")
		{
			outRules.push(inRules[i]);
		}
		else
		{
			outRules.push(cloneRules(inRules[i]));
		}
	}
	return outRules;
}
var subMutProb=.5;
function mutRuleSet(inRules){
	var evoStruct = cloneRules(inRules);
	var mutIndex= getRandomInt(0,evoStruct.length);
	//0 is delete, 1 is insert, 2 is change
	var actionFlag=getRandomInt(0,3);
	//console.log(actionFlag+" - "+mutIndex);
	//console.log(evoStruct);
	//IF THE STRUCT IS EMPTY INSERT MUST BE DONE
	if(evoStruct.length==0)
	{
		evoStruct.push("0");
		return evoStruct;
	}
	//branch mutation
	if(typeof(evoStruct[mutIndex])!="string"&&Math.random()<subMutProb)
	{
		//console.log("BRANCH MUT");
		evoStruct[mutIndex]=mutRuleSet(cloneRules(evoStruct[mutIndex]));
		return evoStruct;
	}
	
	//DELETE MUTATION
	if(actionFlag==0)
	{
		evoStruct.splice(mutIndex,1);
	}
	
	//INSERT MUTATION
	if(actionFlag==1)
	{
		var insTypes=["0","1",[]];
		var insType=insTypes[getRandomInt(0,insTypes.length)];
		evoStruct.splice(mutIndex,0,insType);
	}
	
	//CHANGE MUTATION
	if(actionFlag==2)
	{
		var insTypes=["0","1",[]];
		var insType=insTypes[getRandomInt(0,insTypes.length)];
		
		evoStruct[mutIndex]=insType;
	}
	
	return evoStruct;
}

function arrayifyFract(stringStruct)
{
	//console.log(stringStruct);
	var outArray=[];
	var sem=0;
	var branchString="";
	for(var i=0; i<stringStruct.length; i++)
	{
		if(stringStruct[i]=="[")
		{
			sem++;
			if(sem!=1)
			{
				branchString+="[";
			}
		}
		else if(stringStruct[i]=="]")
		{
			sem--;
			if(sem==0)
			{
				outArray.push(arrayifyFract(branchString));
				branchString="";
			}
			else
			{
				branchString+="]";
			}
		}
		else if(sem==0)
		{
			outArray.push(stringStruct[i]);
		}
		else
		{
			branchString+=stringStruct[i];
		}
	}
	return outArray;
}

function stringifyFract(arrayStruct){
	var outString="";
	for(var i=0; i<arrayStruct.length; i++)
	{
		if(typeof(arrayStruct[i])=="string")
		{
			outString+=arrayStruct[i];
		}
		else
		{
			outString+="["+stringifyFract(arrayStruct[i])+"]";
		}
	}
	return outString;
}

var crossChance=.7;
var ruleCrossChance=.4;
function crossover(genome1,genome2){
	var children=[new genome(), new genome()];
	

	for(var i=0; i<Object.keys(genome1).length; i++)
	{
		var curKey = Object.keys(genome1)[i];
		if(Math.random()<crossChance)
		{
			children[0][curKey]=genome2[curKey];
			children[1][curKey]=genome1[curKey];
		}
		else
		{
			children[1][curKey]=genome2[curKey];
			children[0][curKey]=genome1[curKey];
		}
	}
	//If the angles and spokes get swapped there is possibility for geometric failure, fix it if case happens (ACTUALLY WAIT NO SPACING IS ONLY BASED ON NUMSPOKES NOW)
	
	//deepcopy the rules to be safe
	children[0]["ruleSet"]=cloneRules(children[0]["ruleSet"]);
	children[1]["ruleSet"]=cloneRules(children[1]["ruleSet"]);
	
	//seperate crossover for specifically the rules, the more I think about this the less sense it makes, probably should leave this domain to mutations maybe?
	if(Math.random()<ruleCrossChance)
	{
		var ruleCross=crossoverRules(arrayifyFract(cloneRules(genome1.ruleSet[0][1])),arrayifyFract(cloneRules(genome2.ruleSet[0][1])));
		children[0]["ruleSet"][0][1]=stringifyFract(ruleCross[0]);
		children[1]["ruleSet"][0][1]=stringifyFract(ruleCross[1]);
	}
	return children;
}

function crossoverRules(rule1,rule2){
	var minLen=Math.min(rule1.length,rule2.length);
	var maxLen=Math.max(rule1.length,rule2.length);
	var outArrays=[[],[]];
	for(var i=0; i<minLen; i++)
	{
		//check for aligning sub branches
		if(typeof(rule1[i])!="string"&&typeof(rule2[i])!="string")
		{
			var subCross=crossoverRules(rule1[i],rule2[i]);
			outArrays[0].push(subCross[0]);
			outArrays[1].push(subCross[1]);
		}
		else if(Math.random<crossChance)
		{
			outArrays[0].push(rule1[i]);
			outArrays[1].push(rule2[i]);
		}
		else
		{
			outArrays[1].push(rule1[i]);
			outArrays[0].push(rule2[i]);
		}
	}
	var tailOut=getRandomInt(0,2);
	for(var i=minLen; i<maxLen; i++)
	{
		if(rule1[minLen]==undefined)
		{
			outArrays[tailOut].push(rule2[i]);
		}
		else
		{
			outArrays[tailOut].push(rule1[i]);
		}
	}
	
	return outArrays;
}

var mutProb=.2;
function breed(inPop,scores){
	var outPop=[];
	
	var totScore=0;
	for(var i=0; i<scores.length; i++)
	{
		totScore+=scores[i];
	}
	//Partition the wheel
	var roulette=[];
	for(var i=0; i<scores.length; i++)
	{
		if(i==0)
		{
			roulette.push(scores[i]/totScore);
		}
		else
		{
			roulette.push(scores[i]/totScore+roulette[i-1]);
		}
	}
	
	//Main breeding loop
	for(var k=0; k<inPop.length/2; k++)
	{
		//Select first mate
		var mate1=-1;
		var roll=Math.random();
		for(var i=0; i<roulette.length; i++)
		{
			if(roll<roulette[i])
			{
				mate1=i;
				break;
			}
		}
		
		//choose second mate
		var mate2=mate1;
		while(mate2==mate1)
		{
			roll=Math.random();
			for(var i=0; i<roulette.length; i++)
			{
				if(roll<roulette[i])
				{
					mate2=i;
					break;
				}
			}
		}
		
		console.log("MATES: "+mate1+" - "+mate2);
		//crossover the mates and push children into output
		var children = crossover(inPop[mate1],inPop[mate2]);
		//DO MUTATUION
		if(Math.random()<mutProb)
		{
			mutate(children[0]);
		}
		if(Math.random()<mutProb)
		{
			mutate(children[1]);
		}
		outPop.push(children[0]);
		outPop.push(children[1]);
	}
	
	return outPop;
}