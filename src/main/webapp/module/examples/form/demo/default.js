//数据源加载事件
function onLoad(dataset,ob,evt){
  	//将加载的数据 以json源码的方式显示出来
	var result = evt.params.result;
	var resultJsonString = LUI.Util.stringify(result).replace(/^s+/, '');
	var myCodeMirror = CodeMirror($('pre#example-code')[0], {
    	value:js_beautify(resultJsonString, 4, ' '),
		mode:  "javascript",
		readOnly : true  // 是否只读，默认false
	});
  	//将解析生成的javascript 传递给父页面
	var sourceString = $('pre#source').html();
  	if(parent.setExampleSource!=null){
  		$('pre#source').hide();
      	parent.setExampleSource(js_beautify(sourceString, 4, ' '));
  	}else{
  		$('pre#source').html('').show();
  		var sourceMirror = CodeMirror($('pre#source')[0], {
	    	value:js_beautify(sourceString, 4, ' '),
			mode:  "javascript",
			readOnly : true  // 是否只读，默认false
		});
  	}
  	
  	//将设计过程 图片 传递给父页面
  	if(parent.setDesignImg!=null){
  		$('#flexslider').hide();
  		var designImgString = $('#flexslider ul').html();
      	parent.setDesignImg(designImgString);
  	}else{
  		$('.flexslider').flexslider();
  		$('#flexslider').show();
 	}
}