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

function beforeZiDuanOptionLoad(field,ob,evt){
	var guanLianSTLField = field.cell.row.getCell('guanLianSTL').field;
  	var guanLianSTLObj = guanLianSTLField.getValue();
	if(guanLianSTLObj != null){
	  	//重新设定下拉选项
	  	field.datasource.addFilter('shiTiLei.id','=',guanLianSTLObj.shiTiLeiDM);
	}else{
		field.datasource.addFilter('shiTiLei.id','=',-1);
	}
}

function ziDuanLXChanged(field,ob,evt){
  	var newVal = evt.params.newValue;
	console.info('ziDuanLXChanged');
	var lieMingField = field.cell.row.getCell('lieMing').field;
	var ziDuanCDField = field.cell.row.getCell('ziDuanCD').field;
	var ziDuanJDField = field.cell.row.getCell('ziDuanJD').field;
	var guanLianSTLField = field.cell.row.getCell('guanLianSTL').field;
	var guanLianFLZDField = field.cell.row.getCell('guanLianFLZD').field;
  
    if(newVal==null){
     	lieMingField.enable();
     	ziDuanCDField.enable();
     	ziDuanJDField.enable();
     	guanLianSTLField.enable();
     	guanLianFLZDField.enable();
    }else{
    	if(newVal.ziDuanLXDH == 'string'){//字符
	    	if(ziDuanCDField.getValue()==null){
	      		ziDuanCDField.setValue(newVal.ziDuanKD);
	      	}
			guanLianSTLField.setValue(null);
	      	guanLianFLZDField.setValue(null);
	
	      	lieMingField.enable();
	     	ziDuanCDField.enable();
	     	ziDuanJDField.disable();
	     	guanLianSTLField.disable();
	     	guanLianFLZDField.disable();
	    }else if(newVal.ziDuanLXDH == 'int'){//整数
	      	if(ziDuanCDField.getValue()==null){
	      		ziDuanCDField.setValue(newVal.ziDuanKD);
	      	}
			guanLianSTLField.setValue(null);
	      	guanLianFLZDField.setValue(null);
	
	      	lieMingField.enable();
	     	ziDuanCDField.enable();
	     	ziDuanJDField.disable();
	     	guanLianSTLField.disable();
	     	guanLianFLZDField.disable();
	    }else if(newVal.ziDuanLXDH == 'double'){//小数
	      	if(ziDuanCDField.getValue()==null){
	      		ziDuanCDField.setValue(newVal.ziDuanKD);
	      	}
	      	if(ziDuanJDField.getValue()==null){
	      		ziDuanJDField.setValue(newVal.ziDuanJD);
	      	}
			guanLianSTLField.setValue(null);
	      	guanLianFLZDField.setValue(null);
	
	      	lieMingField.enable();
	     	ziDuanCDField.enable();
	     	ziDuanJDField.enable();
	     	guanLianSTLField.disable();
	     	guanLianFLZDField.disable();
	    }else if(newVal.ziDuanLXDH == 'date' || newVal.ziDuanLXDH == 'month'){//日期	 月份
	      	ziDuanCDField.setValue(newVal.ziDuanKD);
			guanLianSTLField.setValue(null);
	      	guanLianFLZDField.setValue(null);
	
	      	lieMingField.enable();
	     	ziDuanCDField.enable();
	     	ziDuanJDField.disable();
	     	guanLianSTLField.disable();
	     	guanLianFLZDField.disable();
	    }else if(newVal.ziDuanLXDH == 'text'){//文本
	    	if(ziDuanCDField.getValue()==null){
	      		ziDuanCDField.setValue(newVal.ziDuanKD);
	      	}
			guanLianSTLField.setValue(null);
	      	guanLianFLZDField.setValue(null);
	      	
	      	lieMingField.enable();
	     	ziDuanCDField.enable();
	     	ziDuanJDField.disable();
	     	guanLianSTLField.disable();
	     	guanLianFLZDField.disable();
	    }else if(newVal.ziDuanLXDH == 'set' || newVal.ziDuanLXDH == 'object'){//集合 对象	
	      	ziDuanCDField.setValue(null);
	      	ziDuanJDField.setValue(null);
	
	      	lieMingField.enable();
	     	ziDuanCDField.disable();
	     	ziDuanJDField.disable();
	     	guanLianSTLField.enable();
	     	guanLianFLZDField.enable();
	    }
    }
}