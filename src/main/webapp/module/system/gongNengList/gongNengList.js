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
		if(gongYSMCValue==null || gongYSMCValue.length==0 || gongYSMCValue == "系统、功能(代号/名称)"){
			LUI.Grid.getInstance('cmp_displayGrid_zsgf').datasource.load({
				filters : []
			});
		}else{
			LUI.Grid.getInstance('cmp_displayGrid_zsgf').datasource.load({
				filters : [{
					property : "xiTong.xiTongMC",
					operator : 'like',
                  	assist:"['xiTong.xiTongMDH','gongNengDH','gongNengMC']",
					value : gongYSMCValue
				}]
			});
		}
	});
  
  	$('#appendBtn').click(function(){
      	window.open("/nim.html?_pt_=system/gongNengAppend/gongNengAppend.html");
    });
	
}
function onGridRowRender(grid,ob,event){
	var rowEl = event.params.rowEl;
	var rowData = event.params.rowData;
	
	rowEl.find('#show').click(function(){
		window.open("/nim.html?_pt_=system/gongNengShow/gongNengShow.html&_ps_={id:"+rowData.gongNengDM+"}");
	});
	rowEl.find('#edit').click(function(){
		window.open("/nim.html?_pt_=system/gongNengEdit/gongNengEdit.html&_ps_={id:"+rowData.gongNengDM+"}");
	});
}