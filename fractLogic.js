function fractSystem(ruleSet, axiom, colors)
{
	this.colors=colors;
	this.ruleSet=ruleSet;
	this.axiom=axiom;
	this.curStruct=this.axiom;
	
	this.grow=function()
	{
		this.curStruct=growFract(this.curStruct,this.ruleSet);
	}
}

function growFract(curStruct, ruleSet)
{
	var newStruct="";
	for(var i=0; i<curStruct.length; i++)
	{
		var varFlag=false;
		for(var k=0; k<ruleSet.length; k++)
		{
			if(curStruct[i]==ruleSet[k][0])
			{
				newStruct+=ruleSet[k][1];
				varFlag=true;
			}
		}
		
		if(varFlag==false)
		{
			newStruct+=curStruct[i];
		}
	}
	
	return newStruct;
}