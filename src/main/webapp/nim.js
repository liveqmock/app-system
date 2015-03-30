	var _pageInfo = null;
	var _isLogin = null;
//	var _isOriginalChoose = false;//设计时是否在原始页面选择元素
	var loginPageUrl = '';
	var homePageUrl = '';
	
	var	_orginalContent = null;
	$(document).ready(function(){
		//这时还没有pageInstance 手动显示loading(限定页面高度 使其不出滚动条 避免超出mask覆盖的区域)
		var h = $(document).height();
		$("#_pageContent").css("height",h );
		$("#_pageContent").css("overflow",'hidden' );
		$('#_pageContent').mask('正在加载页面...');
		//获取页面相关文件
		var ftlPage = _urlInfo.params._pt_;
		_pageInfo = {
			htmlPage:ftlPage.substr(0,ftlPage.lastIndexOf('.'))+'.html',
			ftlPage:ftlPage,
			cssPage:ftlPage.substr(0,ftlPage.lastIndexOf('.'))+'.css',
			jsPage:ftlPage.substr(0,ftlPage.lastIndexOf('.'))+'.js',
			xmlPage:ftlPage.substr(0,ftlPage.lastIndexOf('.'))+'.xml'
		};
		//判断是否为设计模式
    	if(_isDesignMode && !_urlInfo.params.workMode){
			//加载原始页面
			$.ajax({
				url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
				type: "POST", 
				data:{
					component:'nim-plateform',
					service:'page',
					method:'orginal',
					arguments:"{pageUrl:\'" + _pageInfo.htmlPage + "\'}"
				},
				dataType:"json",
				success: function(data){
					_orginalContent = $($.parseHTML(data.content));
				}
			});
		}
		var xmlParams = {};
		if(_urlInfo.params._ps_!=null){
			xmlParams = eval("("+decodeURI(_urlInfo.params._ps_)+")");
		}
		LUI.Page.include(_pageInfo.htmlPage,xmlParams,'#_pageContent',true,function(currentPage){
			//创建designer
	    	if(_isDesignMode && !_urlInfo.params.workMode){
				showDesigner();
			}
		});

	});
	

	function showDesigner(){
		//--------------------------------------------------------------------
		//开启调试器
		//--------------------------------------------------------------------
		//加载“系统”信息
		var xiTongDataArray = null;
		var gongNengDataArray = null;
		var shiTiLeiDataArray = null;
		var ziDuanLXDataArray = null;
		
		LUI.DataUtils.requestXiTongData(function(result){
			xiTongDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“功能”信息
		LUI.DataUtils.requestGongNengData(function(result){
			gongNengDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“实体类”信息
		LUI.DataUtils.requestShiTiLeiData(function(result){
			shiTiLeiDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
		
		//加载“实体类”信息
		LUI.DataUtils.requestZiDuanLXData(function(result){
			ziDuanLXDataArray = result.rows;
			if(xiTongDataArray!=null && gongNengDataArray!=null && shiTiLeiDataArray!=null && ziDuanLXDataArray!=null ){
				LUI.PageDesigner.getInstance().createDesigner($('body').layout({
					center: {
						applyDemoStyles:true
					},
					east: {
						paneClass:'ui-layout-pane',
						size:370
					}
				}),'_designer',xiTongDataArray,gongNengDataArray,shiTiLeiDataArray,ziDuanLXDataArray);
			}
		});
	
	}
	

	
	
//////////////////////////////////////////////////////////
	/**
	* 日期格式化
	* @param format
	* yyyy-MM-dd HH:mm:ss:SSS 星期E 时区:Z
	*
	* @returns {string}
	*/
	Date.prototype.format = function (format) {
		// 数字时区
		var timezone = this.getTimezoneOffset() / 60;
		format = format.replace(/z/g, timezone);
		// 汉字时区
		var zone = {
			'12': '东西十二区',
			'11': '西十一区',
			'10': '西十区',
			'9': '西九区',
			'8': '西八区',
			'7': '西七区',
			'6': '西六区',
			'5': '西五区',
			'4': '西四区',
			'3': '西三区',
			'2': '西二区',
			'1': '西一区',
			'0': '中时区',
			'-1': '东一区',
			'-2': '东二区',
			'-3': '东三区',
			'-4': '东四区',
			'-5': '东五区',
			'-6': '东六区',
			'-7': '东七区',
			'-8': '东八区',
			'-9': '东九区',
			'-10': '东十区',
			'-11': '东十一区',
			'-12': '东西十二区'
		}
		
		format = format.replace(/Z/g, zone[timezone]);
		// 汉字星期
		format = format.replace(/E/g, ['日', '一', '二', '三', '四', '五', '六'][this.getDay()]);
		// 数字星期
		format = format.replace(/e/g, this.getDay());
		// 4位年份
		format = format.replace(/yyyy/g, this.getFullYear());
		// 2位年份 .兼容浏览器.getYear() IE返回4位.其它返回2位
		var year = this.getYear();
		year = year < 2000 ? year + 1900 : year;
		format = format.replace(/yy/g, year.toString().substr(2, 2));
		
		function f(value) {
			return value < 10 ? ('0' + value) : value;
		}
		// 不足补0 月份
		var month = this.getMonth() + 1;
		format = format.replace(/MM/g, f(month));
		// 不补0 月份
		format = format.replace(/M/g, month);
		// 不足补0 日期
		var date = this.getDate();
		format = format.replace(/dd/g, f(date));
		// 不补0 日期
		format = format.replace(/d/g, date);
		// 不足补0 小时
		var hours = this.getHours();
		format = format.replace(/HH/g, f(hours));
		// 不补0 小时
		format = format.replace(/H/g, hours);
		// 不足补0 分钟
		var minute = this.getMinutes();
		format = format.replace(/mm/g, f(minute));
		// 不补0 分钟
		format = format.replace(/m/g, minute);
		// 不足补0 秒钟
		var second = this.getSeconds();
		format = format.replace(/ss/g, f(second));
		// 不补0 分钟
		format = format.replace(/s/g, second);
		// 不足补0 毫秒
		var milliSecond = this.getMilliseconds();
		format = format.replace(/SSS/g, f(milliSecond));
		// 不补0 毫秒
		format = format.replace(/S/g, milliSecond);
		return format;
	}
