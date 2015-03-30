function onPageRady(){
	
	$('#appendBtn').click(function(){
		window.open("/nim.html?_pt_=nw/dm/xinWenLBAppend/xinWenLBAppend.html");
	});
}


function onGridRowRender(grid,ob,event){
	var rowEl = event.params.rowEl;
	var rowData = event.params.rowData;
	
	rowEl.find('#show').click(function(){
        LUI.DataUtils.execute('nw','xwlb','trans',[{xinWenLBDM:rowData.xinWenLBDM}],function(result){
          if(result.success){
            LUI.Message.info("信息","传输成功！");
          }
        });
	});
	rowEl.find('#edit').click(function(){
		window.open("/nim.html?_pt_=nw/dm/xinWenLBEdit/xinWenLBEdit.html&_ps_={id:"+rowData.xinWenLBDM+"}");
	});
	rowEl.find('#delete').click(function(){
		LUI.Message.confirm('请确认...','是否删除当前新闻类别？',function(success){
			if(success){
				LUI.DataUtils.execute('nw','xwlb','delete',[{xinWenLBDM:rowData.xinWenLBDM}],function(result){
					if(result.success){
						LUI.Message.info("信息","删除成功！");
					}
				});
				grid.datasource.load();
			}
		});
	});
}