//页面加载完成事件
function onPageLoad(){
  	LUI.Page.include('examples/page/demo/demoChild.html',null,'#childContent',false);
  	//将javascript源码 传递给父页面
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
  	
  	
}



function openPageInWindow(){
	//弹出文件选择窗口
    LUI.PageUtils.popup({
      page:'examples/page/demo/demoChild.html',
      buttons: {
        "确定": function() {
          $( this ).dialog( "close" );
        },
        "取消": function() {
          $( this ).dialog( "close" );
        }
      }
    });
}