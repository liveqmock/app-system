var demoSource = null;
function demoSourceInit(demoFrameId,demoSourceId){
	demoSource = $(demoSourceId);
	//点击“查看源码” 显示/隐藏相关区域
 	demoSource.find('#sourceDisplayBtn').css('cursor','pointer').click(function(){
		if(demoSource.find('div#source').is(":hidden")){
			
			demoSource.find('div#source-html').hide();
			demoSource.find('div#source-js').hide();
			demoSource.find('div#source-xml').hide();
			demoSource.find('div#source-analyze').hide();
			
			demoSource.find('div#source').show();
			
			//显示源码信息
			var htmlPageUrl = demoSource.find('div#source').attr('href');
			LUI.Page.loadHTML(htmlPageUrl,null,function(htmlResult){//这里的htmlPage 是module目录下的文件
				var pageContent = htmlResult.content;
				//显示html源码
				setHtmlSource(pageContent);
				//有同名的js文件  显示js源码
				if(htmlResult.jsExists){
					setJsSource(htmlPageUrl.substr(0,htmlPageUrl.lastIndexOf('.'))+'.js');
				}
				//有同名的xml文件  显示xml源码
				if(htmlResult.xmlExists){
					setXmlSource(htmlPageUrl.substr(0,htmlPageUrl.lastIndexOf('.'))+'.xml',htmlResult.currentPage.name);
				}
			});
		}else{
			demoSource.find('div#source').hide();
		}
	});
  	//点击“查看设计过程” 显示/隐藏相关区域
 	demoSource.find('#designDisplayBtn').css('cursor','pointer').click(function(){
		demoSource.find('div#design').toggle();
	});
	
	//监听iframe加载完成事件 显示查看源码按钮
	var iframe = $(demoFrameId)[0];  
    if (iframe.attachEvent) {  
        iframe.attachEvent("onload", function() {
        	demoSource.find('#sourceDisplayBtn').show();
        });  
    } else {  
        iframe.onload = function() {  
         	demoSource.find('#sourceDisplayBtn').show();  
        };  
    }
}

//调用此方法 设置html源文件内容 
var htmlCodeMirrorArea = null;
function setHtmlSource(docString){
	if(htmlCodeMirrorArea==null){
		var htmlArea = demoSource.find('div#source div#source-html > textarea');
		htmlCodeMirrorArea = CodeMirror.fromTextArea(htmlArea[0], {
			lineNumbers: true,
			readOnly : true,
			mode:htmlArea.attr('class')
		});
	}
	htmlCodeMirrorArea.setValue(docString);
	demoSource.find('div#source-html').show();
	htmlCodeMirrorArea.setSize();
}

//调用此方法 设置js源文件内容 
var jsCodeMirrorArea = null;
function setJsSource(jsPageUrl){
	if(jsCodeMirrorArea==null){
		var jsArea = demoSource.find('div#source div#source-js > textarea');
		jsCodeMirrorArea = CodeMirror.fromTextArea(jsArea[0], {
			lineNumbers: true,
			readOnly : true,
			mode:jsArea.attr('class')
		});
	}
	
	//取得js文件内容
	$.ajax({
		url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
		type: "POST", 
		data:{
			component:'nim-plateform',
			service:'page',
			method:'js',
			arguments:"{pageUrl:'"+ jsPageUrl+"',params:{}}"
		},
		dataType:"text",
		success: function(pageResult){
			jsCodeMirrorArea.setValue(pageResult);
			demoSource.find('div#source-js').show();
			jsCodeMirrorArea.setSize();
		},
		error:function(){
			alert("获取js失败：服务器返回错误");
		}
	});
}

//调用此方法 设置xml源文件内容及解析结果
var xmlCodeMirrorArea = null;
var analyzeCodeMirrorArea = null;
function setXmlSource(xmlPageUrl,pageName){
	if(xmlCodeMirrorArea==null){
		var xmlArea = demoSource.find('div#source div#source-xml > textarea');
		xmlCodeMirrorArea = CodeMirror.fromTextArea(xmlArea[0], {
			lineNumbers: true,
			readOnly : true,
			mode:xmlArea.attr('class')
		});
	}
	if(analyzeCodeMirrorArea==null){
		var analyzeArea = demoSource.find('div#source div#source-analyze > textarea');
		analyzeCodeMirrorArea = CodeMirror.fromTextArea(analyzeArea[0], {
			lineNumbers: true,
			readOnly : true,
			mode:analyzeArea.attr('class')
		});
	}
	//取得xml文件内容
	$.ajax({
		url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
		type: "POST", 
		data:{
			component:'nim-plateform',
			service:'page',
			method:'xml',
			arguments:"{pageUrl:'"+ xmlPageUrl+"',params:{}}"
		},
		dataType:"text",
		success: function(pageResult){
			xmlCodeMirrorArea.setValue(pageResult);
			demoSource.find('div#source-xml').show();
			xmlCodeMirrorArea.setSize();
		},
		error:function(){
			alert("获取xml失败：服务器返回错误");
		}
	});
	
	//取得xml文件解析结果
	$.ajax({
		url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
		type: "POST", 
		data:{
			component:'nim-plateform',
			service:'page',
			method:'analyse',
			arguments:"{pageName:'"+ pageName+"',pageUrl:'"+ xmlPageUrl+"',isIndependent:true,params:{}}"
		},
		dataType:"text",
		success: function(pageResult){
			analyzeCodeMirrorArea.setValue(pageResult);
			demoSource.find('div#source-analyze').show();
			analyzeCodeMirrorArea.setSize();
		},
		error:function(){
			alert("解析xml失败：服务器返回错误");
		}
	});
}

//调用此方法 设置设计图片 并隐藏‘查看设计过程’按钮
function setDesignImg(imgUrl){
	//隐藏设计图片
	demoSource.find('div#design').hide();
	demoSource.find('#design-img').attr('src',imgUrl);
}
//图片不存在 隐藏图片及‘查看设计过程’按钮
function hideDesignImg(){
	demoSource.find('#designDisplayBtn').hide();
}

function showDesignImg(){
	demoSource.find('#designDisplayBtn').show();
}