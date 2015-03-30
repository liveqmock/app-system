function onPageRady(){
	//查询正式 -- 按供应商名称
	$('#GFZRPS_zhengShi').find('#gongYSMC:eq(0)').keydown(function(event) {
		if (event.keyCode == 13) {
			$("#GFZRPS_zhengShi #GFZRPS_searchbtn").click();
		}
	});

	$("#GFZRPS_zhengShi #GFZRPS_searchbtn").click(function(){
		//
		var gongYSMCValue = $('#GFZRPS_zhengShi').find('#gongYSMC:eq(0)').val();
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "新闻代号/名称/表名"){
			LUI.Grid.getInstance('xinWenGrid').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('xinWenGrid').datasource.load({
				filters : [{
					property : "xinWenDH",
					operator : 'like',
					assist:"['xinWenMC','biaoMing']",
					value : gongYSMCValue
				}]
			});
		}
	});

	$('#appendBtn').click(function(){
		window.open("/nim.html?_pt_=nw/dm/xinWenAppend/xinWenAppend.html");
	});

	$('#generateBtn').click(function(){
		var submitData = [];
		var xwDataset = LUI.Datasource.getInstance('xwDataset');
		for(var i=0;i<xwDataset.size();i++){
			var xwRecord =	xwDataset.getRecord(i);
			submitData[submitData.length] = {
				xinWenDM:xwRecord.primaryFieldValue
			};
		}	
		LUI.Message.confirm('请确认...','是否对当前'+xwDataset.size()+'条新闻记录进行生成定义文件操作？',function(success){
			if(success){
				LUI.DataUtils.execute('nw','xw','entityGenerate',submitData,function(result){
					if(result.success){
						LUI.Message.info("信息","新闻定义文件生成成功！");
					}
				});
			}
		});
	});
}


function onGridRowRender(grid,ob,event){
	var rowEl = event.params.rowEl;
	var rowData = event.params.rowData;
	
	rowEl.find('#show').click(function(){
        LUI.DataUtils.execute('nw','xw','trans',[{xinWenDM:rowData.xinWenDM}],function(result){
          if(result.success){
            LUI.Message.info("信息","传输成功！");
          }
        });
	});
	rowEl.find('#edit').click(function(){
		window.open("/nim.html?_pt_=nw/dm/xinWenEdit/xinWenEdit.html&_ps_={id:"+rowData.xinWenDM+"}");
	});
	rowEl.find('#delete').click(function(){
		LUI.Message.confirm('请确认...','是否删除当前新闻记录？',function(success){
			if(success){
				LUI.DataUtils.execute('nw','xw','delete',[{xinWenDM:rowData.xinWenDM}],function(result){
					if(result.success){
						LUI.Message.info("信息","删除成功！");
					}
				});
				grid.datasource.load();
			}
		});
	});
}