var myCodeMirror = null;
//初始化 
function onExamplesPageLoaded(){
  	//点击“查看源码”和“查看设计”按钮 显示/隐藏相关区域
 	$('#sourceCodeDisplayHandler').click(function(){
		$('pre#source-code').toggle();
		myCodeMirror.refresh();
	});
	$('#sourceDesignDisplayHandler').click(function(){
		$('div#source-design').toggle();
	});
	//初始化源码显示效果
	myCodeMirror = CodeMirror($('pre#source-code')[0], {
    	value:'',
		mode:  "javascript",
		readOnly : true  // 是否只读，默认false
	});
  	//点击子菜单项 在frame中加载对应页面
    $('.examples-list li a').click(function(){
      	document.getElementById("demo-frame").src =$(this).attr('url')+'&workMode=true';//不显示设计器
      	$('#sourceCodeDisplayHandler').hide();//隐藏“查看源码”按钮
		$('#sourceDesignDisplayHandler').hide();//隐藏“查看设计”按钮
    });
  	//点击第一个子菜单项 
  	$('.examples-list li:eq(0) a').click();
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
