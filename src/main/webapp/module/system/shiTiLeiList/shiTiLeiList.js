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
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "实体类代号/名称/表名"){
			LUI.Grid.getInstance('shiTiLeiGrid').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('shiTiLeiGrid').datasource.load({
				filters : [{
					property : "shiTiLeiDH",
					operator : 'like',
					assist:"['shiTiLeiMC','biaoMing']",
					value : gongYSMCValue
				}]
			});
		}
	});

	$('#appendBtn').click(function(){
		window.open("/nim.html?_pt_=system/shiTiLeiAppend/shiTiLeiAppend.html");
	});

	$('#generateBtn').click(function(){
		var submitData = [];
		var stlDataset = LUI.Datasource.getInstance('stlDataset');
		for(var i=0;i<stlDataset.size();i++){
			var stlRecord =	stlDataset.getRecord(i);
			submitData[submitData.length] = {
				shiTiLeiDM:stlRecord.primaryFieldValue
			};
		}	
		LUI.Message.confirm('请确认...','是否对当前'+stlDataset.size()+'条实体类记录进行生成定义文件操作？',function(success){
			if(success){
				LUI.DataUtils.execute('sys','stl','entityGenerate',submitData,function(result){
					if(result.success){
						LUI.Message.info("信息","实体类定义文件生成成功！");
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
		window.open("/nim.html?_pt_=system/shiTiLeiShow/shiTiLeiShow.html&_ps_={id:"+rowData.shiTiLeiDM+"}");
	});
	rowEl.find('#edit').click(function(){
		window.open("/nim.html?_pt_=system/shiTiLeiEdit/shiTiLeiEdit.html&_ps_={id:"+rowData.shiTiLeiDM+"}");
	});
	rowEl.find('#delete').click(function(){
		LUI.Message.confirm('请确认...','是否删除当前实体类记录？',function(success){
			if(success){
				LUI.DataUtils.execute('sys','stl','delete',[{shiTiLeiDM:rowData.shiTiLeiDM}],function(result){
					if(result.success){
						LUI.Message.info("信息","删除成功！");
					}
				});
				grid.datasource.load();
			}
		});
	});
}