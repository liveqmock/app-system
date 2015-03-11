function onPageRady(){
  $('#newCZBtn').click(function(){
  		//增加新的字段
  		var stlRecord = LUI.Datasource.getInstance('gongNengRecord').getRecord(0);
    	var zdsRecordset = stlRecord.getFieldValue('czs');
    	zdsRecordset.addRecord({});
  });
  	
}

function onGridRowRender(grid,ob,evt){
  	var isInitial = evt.params.isInitial;
    if(isInitial){
		var rowEl = evt.params.rowEl;
        var record = evt.params.record;
        var rBtn = rowEl.find('#removeCZ');
        rBtn.click(function(){
            //删除当前记录
            record.remove();
        })
    }
}
