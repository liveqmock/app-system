function onPageRady(){
  $('#newZiDuanBtn').click(function(){
  		//增加新的字段
  		var stlRecord = LUI.Datasource.getInstance('shiTiLeiRecord').getRecord(0);
    	var zdsRecordset = stlRecord.getFieldValue('zds');
    	zdsRecordset.addRecord({});
  });
  	
}

function onShiTiLeiSubmit(ds,ob,evt){
    if(evt.params.success){
      	//提示是否生成实体类定义文件
      	var r = ds.getRecord(0);
      	var shiTiLeiMC = r.getFieldValue('shiTiLeiMC'); 
      	var shiTiLeiDM = r.getFieldValue('shiTiLeiDM');
      
      LUI.Message.confirm('保存成功...','是否生成新版本的实体类定义文件！',function(success){
        	if(success){
        		$.ajax({
                  url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
                  type: "POST", 
                  data:{
                      component:'nim-data',
                      service:'data',
                      method:'execute',
                      arguments:"{" +
                          "xiTongDH:'system'," +
                          "gongNengDH:'stl'," +
                          "caoZuoDH:'entityGenerate'," +
                    	  "submitData:[{shiTiLeiDM:"+shiTiLeiDM+"}]" +
                      "}"
                  },
                  dataType:"json",
                  success: function(result){
                      if(result.success){
                          LUI.Message.info("信息","实体类定义文件生成成功！");
                      }else{
                          LUI.Message.info("信息",result.errorMsg);
                      }
                  },
                  error:function(){
                      LUI.Message.info("信息","访问服务器失败!");
                  }
              });
        	}
      });
    }
}

function onGridRowRender(grid,ob,evt){
  	var isInitial = evt.params.isInitial;
    if(isInitial){
		var rowEl = evt.params.rowEl;
        var record = evt.params.record;
        var rBtn = rowEl.find('#removeZiDuan');
        rBtn.click(function(){
            //删除当前记录
            record.remove();
        })
    }
}