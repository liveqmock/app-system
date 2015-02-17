var myCodeMirror = null;
function onExamplesPageLoaded(){
 	$('#sourceCodeDisplayHandler').click(function(){
		$('pre#source-code').toggle( 'blind', {}, 500 );
		myCodeMirror.refresh();
	});
	$('#sourceDesignDisplayHandler').click(function(){
		$('div#source-design').toggle( 'blind', {}, 500 );
	});
	
	myCodeMirror = CodeMirror($('pre#source-code')[0], {
    	value:'',
		mode:  "javascript",
		readOnly : true  // 是否只读，默认false
	});
}

function showDemoPage(url){
	document.getElementById("demo-frame").src = url;//
	//隐藏查看源码和查看设计过程的按钮
	$('#sourceCodeDisplayHandler').hide();
	$('#sourceDesignDisplayHandler').hide();
}

//子页面调用此方法 设置source 并显示‘查看源码’按钮
function setExampleSource(docString){
	myCodeMirror.setValue(docString);
	$('#sourceCodeDisplayHandler').show();
}

//子页面调用此方法 设置设计图片 并显示‘查看设计过程’按钮
function setDesignImg(imgOptions){
	var designContainer = $('div#source-design');
	$(imgOptions).appendTo(designContainer.find('ul').eq(0));
	designContainer.flexslider();
	$('#sourceDesignDisplayHandler').show();
}
