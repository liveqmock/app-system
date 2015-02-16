function onTabpageChoosed(newIndex,oldIndex){
	var linShiGrid = LUI.Grid.getInstance('cmp_displayGrid_lsgf');
	var quanBuGrid = LUI.Grid.getInstance('cmp_displayGrid_qbgf');

	if(newIndex==1 && !linShiGrid.datasource.loaded){
		linShiGrid.datasource.load();
	}else if(newIndex==2 && !quanBuGrid.datasource.loaded){
		quanBuGrid.datasource.load();
	}

}


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
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "供方名称或供货范围"){
			LUI.Grid.getInstance('cmp_displayGrid_zsgf').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('cmp_displayGrid_zsgf').datasource.load({
				filters : [{
					property : "gongYingSJBZL.danWei",
					operator : 'like',
                  	assist:"['gongHuoFW']",
					value : gongYSMCValue
				}]
			});
		}
	});
	//查询临时 -- 按供应商名称
	$('#GFZRPS_linShi').find('#gongYSMC:eq(0)').keydown(function(event) {
		if (event.keyCode == 13) {
			$("#GFZRPS_linShi #GFZRPS_searchbtn").click();
		}
	});
	
	$("#GFZRPS_linShi #GFZRPS_searchbtn").click(function(){
		var gongYSMCValue = $('#GFZRPS_linShi').find('#gongYSMC:eq(0)').val();
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "供方名称或供货范围"){
			LUI.Grid.getInstance('cmp_displayGrid_lsgf').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('cmp_displayGrid_lsgf').datasource.load({
				filters : [{
					property : "gongYingSJBZL.danWei",
					operator : 'like',
                  	assist:"['gongHuoFW']",
					value : gongYSMCValue
				}]
			});
		}
	});
	
	//查询全部 -- 按供应商名称（仅评审通过的）
	$('#GFZRPS_quanBu').find('#gongYSMC:eq(0)').keydown(function(event) {
		if (event.keyCode == 13) {
			$("#GFZRPS_quanBu #GFZRPS_searchbtn").click();
		}
	});
	
	$("#GFZRPS_quanBu #GFZRPS_searchbtn").click(function(){
		var gongYSMCValue = $('#GFZRPS_quanBu').find('#gongYSMC:eq(0)').val();
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "供方名称或供货范围"){
			LUI.Grid.getInstance('cmp_displayGrid_qbgf').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('cmp_displayGrid_qbgf').datasource.load({
				filters : [{
					property : "gongYingSJBZL.danWei",
					operator : 'like',
                  	assist:"['gongHuoFW']",
					value : gongYSMCValue
				}]
			});
		}
	});
	
}
function onGridRowRender(grid,ob,event){
	var rowEl = event.params.rowEl;
	var rowData = event.params.rowData;
	
	rowEl.find('#show').click(function(){
		window.open("/nim.html?_pt_=gys/gfsq/hggfShow/hggfShow.html&_ps_={zrgfsp:{id:"+rowData.gongFangSP.gongFangSPDM+",shuJuID:"+rowData.gongFangSP.gongFangZGSQ.daiMa+"}}");
	});
}