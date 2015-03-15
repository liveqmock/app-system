
//页面加载完成 初始化源码按钮及显示区域
function onExamplesPageLoaded(){
  	//点击菜单项 在frame中加载对应页面 在源码区域加载源码
    $('div.examples-list > ul > li').each(function(index,element){
		$(element).css('cursor','pointer').click(function(){
			var htmlPageUrl = $(this).attr('href');
			//显示对应的demo页面
			document.getElementById('demo-frame').src = '/nim.html?_pt_='+htmlPageUrl+"&workMode=true";
			//记录当前页面地址、 隐藏源码区域
			$('div#source').attr('href',htmlPageUrl).hide();
			//隐藏“查看源码”按钮
			$('#sourceDisplayBtn').hide();
			//隐藏“查看设计过程”按钮
			$('#designDisplayBtn').hide();
			//设置设计图片url
			setDesignImg('module/'+htmlPageUrl.substr(0,htmlPageUrl.lastIndexOf('.'))+'.gif');
		})
	});
	//引入demoUtils
	LUI.Page.include('examples/demoUtils.html',null,'#demo-source',false,function(){
		//初始化demo源码显示 参数:frame_id  source_id
		demoSourceInit('#demo-frame','#demo-source');
		//点击第一个菜单项 显示demo页面
  		$('div.examples-list > ul > li:eq(0)').click();
	});
	
}


