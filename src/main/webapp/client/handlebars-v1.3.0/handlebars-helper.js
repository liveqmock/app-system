Handlebars.registerHelper('substr', function(passedString, start, length ){
	var resultString = "";
	if(passedString!=null){
		var theString = passedString.substr(start, length);
		resultString = new Handlebars.SafeString(theString);
	}
	return resultString;
});


Handlebars.registerHelper('ellipsis', function(passedString, length ){
	if(passedString!=null){
		var mlength = length,tailS='';
		if(passedString.length> length){
		    tailS = '...';
		    mlength = mlength -3;
		};
		var theString = passedString.substr(0, mlength) + tailS;
		return new Handlebars.SafeString(theString);
	}
	return "";
});

//对模板中的数值 进行加法运算
Handlebars.registerHelper("add",function(index,plus){
	return parseInt(index)+parseInt(plus);
});

//判断两个变量 是否相等
Handlebars.registerHelper("equals",function(val1,val2){
	return val1 == val2;
});