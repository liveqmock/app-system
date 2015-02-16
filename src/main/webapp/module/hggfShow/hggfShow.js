function onGfsqShowPageLoad(){
	//绑定
	$("#chuLi_btn").click(doTask);
	
	$("#_pageContent").scroll(function() {
		var top = 0;
		var element =  $(".fixed_topbox");
	  	var scrolls = $(this).scrollTop();
	  	element.css("top",scrolls+'px');
		if (scrolls > top) {
			element.addClass('tab-fixed');
			if (window.XMLHttpRequest) {
				element.addClass('tab-fixed');
			} else {
				element.removeClass('tab-fixed');	
			}
		}else {
			element.removeClass('tab-fixed');	
		}
	});
}


function onTabpageSelect(newIndex,oldIndex){
//	if(){
//		
//	}
//	var zrgfspRecord = LUI.Datasource.getInstance('zrgfspDatasource').getRecord(0);
//  	var gnObjid = zrgfspRecord.getFieldValue();
//	$('#div_ck_lcjs img').attr('src','bpmn/diagram/zrgfsp/'+gnObjid+'/').css('display','block');
}

function doTask(){
	//根据当前用户 查询第一个需要处理的任务
	var id = LUI.Page.instance.params.zrgfsp.id;
	LUI.TaskUtils.getTodoGNCZ('hdzg','zrgfsp',id,function(result){
		if(result.success){
			openTaskPage(result.caoZuoDH,id);
		}
	});
//	var caoZuoDH = 'gylglbcs';
}

//为当前用户打开任务处理页面
function openTaskPage(caoZuoDH,id){
	LUI.PageUtils.popup({
		page:'gys/gfsq/'+caoZuoDH+'/'+caoZuoDH+'.html',
		params:{
			id:id
		},
		open:function(){
			
		},
		buttons: {
			"提交": function() {
				var _this = this;
				//保存
				var formInst = LUI.Form.getInstance('zrgfspTaskForm');
				if(formInst.isValid()){
					var xiTongDH = null;
					if(formInst.xiTongDH!=null){
						xiTongDH = formInst.xiTongDH;
					}
					var gongNengDH = null;
					if(formInst.gongNengDH!=null){
						gongNengDH = formInst.gongNengDH;
					}
					var caoZuoDH = null;
					if(formInst.caoZuoDH!=null){
						caoZuoDH = formInst.caoZuoDH;
					}
					
					formInst.datasource.save(xiTongDH,gongNengDH,caoZuoDH,true,function(result){
						if(result.success){
							//刷新评审意见 和流程图
							LUI.Form.getInstance('liuChengJSForm').datasource.load();
							LUI.WorkflowImg.getInstance('workflowImg').load();
							//关闭
							$( _this ).dialog( "close" );
						}else{
							LUI.Message.error('保存失败','信息：'+result.errorMsg);
						}
					});
				}else{
					var invalidField = formInst.getFirstInvalidField();
					
					LUI.Message.error('表单验证不通过','字段('+invalidField.label+'):'+invalidField.validInfo,null,{
						callback:function(){
							invalidField.focus();
						}
					});
					return ;
				}
			},
//			"保存": function() {
//				//保存
//				saveYueBao(false,function(){
//					//关闭
//					$( this ).dialog( "close" );
//				},this)
//			},
			"取消": function() {
				$( this ).dialog( "close" );
			}
		}
	});
}


function onSqxxLoaded(){
	var psxxRecord = LUI.Datasource.getInstance('zrgfspDatasource').getRecord(0);
	var isSBCLL = psxxRecord.getFieldValue('shiFouSBCLL');
	var isJAL = psxxRecord.getFieldValue('shiFouJAL');
	var isZXFWL = psxxRecord.getFieldValue('shiFouZXFWL');
	var isSJL = psxxRecord.getFieldValue('shiFouSJL');
	var isYWWBL = psxxRecord.getFieldValue('shiFouYWWBL');
	
	$('#tab_grxx li#sheBeiCLL').hide();
	$('#tab_grxx li#jianAnL').hide();
	$('#tab_grxx li#ziXunFWL').hide();
	$('#tab_grxx li#sheJiL').hide();
	$('#tab_grxx li#yeWuWBL').hide();

	if(isSBCLL){
		$('#tab_grxx li#sheBeiCLL').show();
	}else if(isJAL){
		$('#tab_grxx li#jianAnL').show();
	}else if(isZXFWL){
		$('#tab_grxx li#ziXunFWL').show();
	}else if(isSJL){
		$('#tab_grxx li#sheJiL').show();
	}else if(isYWWBL){
		$('#tab_grxx li#yeWuWBL').show();
	}
}