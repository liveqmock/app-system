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
				LUI.DataUtils.execute('sys','stl','entityGenerate',[{shiTiLeiDM:shiTiLeiDM}],function(result){
					if(result.success){
						LUI.Message.info("信息","实体类定义文件生成成功！");
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
		rowEl.find('#delete').click(function(){
				//删除当前记录
				record.remove();
		})
		
		var guanLianSTLVal = record.getFieldValue('guanLianSTL');
		if(guanLianSTLVal!=null){
			rowEl.find('#edit').show();
		}else{
				rowEl.find('#edit').hide();
		}
		
		rowEl.find('#edit').click(function(){
				//编辑关联实体类
				var asa = 1;
				var rowEl = $(this).closest('li');
				var recordId = rowEl.attr('_record_id');
				var record = LUI.Record.getInstance(recordId);
				var shiTiLeiVal = record.getFieldValue('guanLianSTL');
				
				window.open("/nim.html?_pt_=system/shiTiLeiEdit/shiTiLeiEdit.html&_ps_={id:"+shiTiLeiVal.getFieldValue('shiTiLeiDM')+"}");
		})
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
            if(!evt.params.isInitial){
              	ziDuanCDField.setValue(newVal.ziDuanKD);
                guanLianSTLField.setValue(null);
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.disable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'int'){//整数
          	if(!evt.params.isInitial){
              ziDuanCDField.setValue(newVal.ziDuanKD);
              guanLianSTLField.setValue(null);
              guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.disable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'boolean'){//逻辑
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(newVal.ziDuanKD);
                guanLianSTLField.setValue(null);
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.disable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'double'){//小数
          	if(!evt.params.isInitial){
              ziDuanCDField.setValue(newVal.ziDuanKD);
              ziDuanJDField.setValue(newVal.ziDuanJD);
              guanLianSTLField.setValue(null);
              guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.enable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'date' || newVal.ziDuanLXDH == 'month'){//日期	月份
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(newVal.ziDuanKD);
                guanLianSTLField.setValue(null);
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.disable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'text'){//文本
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(newVal.ziDuanKD);
                guanLianSTLField.setValue(null);
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.enable();
			ziDuanJDField.disable();
			guanLianSTLField.disable();
			guanLianFLZDField.disable();
		}else if( newVal.ziDuanLXDH == 'object'){//对象	
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(null);
                ziDuanJDField.setValue(null);
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.disable();
			ziDuanJDField.disable();
			guanLianSTLField.enable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'file'){//文件
            if(!evt.params.isInitial){
                ziDuanCDField.setValue(null);
                ziDuanJDField.setValue(null);
                guanLianSTLField.setValue({
                    shiTiLeiDM:72,
                    shiTiLeiMC:'附件'
                });
                guanLianFLZDField.setValue(null);
            }
			lieMingField.enable();
			ziDuanCDField.disable();
			ziDuanJDField.disable();
			guanLianSTLField.enable();
			guanLianFLZDField.disable();
		}else if(newVal.ziDuanLXDH == 'set'){//集合
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(null);
                ziDuanJDField.setValue(null);
              
              	LUI.Message.confirm('请确认...','是否需要为当前集合字段创建关联实体类？',function(success){
                    if(success){
                        autoCreateSubSTL(guanLianSTLField);
                    }
                });
            }
			lieMingField.disable();
			ziDuanCDField.disable();
			ziDuanJDField.disable();
			guanLianSTLField.enable();
			guanLianFLZDField.enable();
					
			
		}else if(newVal.ziDuanLXDH == 'fileset'){//文件集合	
          	if(!evt.params.isInitial){
                ziDuanCDField.setValue(null);
                ziDuanJDField.setValue(null);
				guanLianSTLField.setValue(null);
				guanLianFLZDField.setValue(null);
              
              	LUI.Message.confirm('请确认...','是否需要为当前集合字段创建关联实体类？',function(success){
                    if(success){
                        autoCreateSubSTL(guanLianSTLField,{
                            shiTiLeiDM:72,
                            shiTiLeiMC:'附件'
                        });
                    }
                });
            }
			lieMingField.disable();
			ziDuanCDField.disable();
			ziDuanJDField.disable();
			guanLianSTLField.enable();
			guanLianFLZDField.enable();
					
		}
	}
}

//改变了关联实体类字段 切换编辑按钮的显示
//并重新加载可能存在的关联父类字段的选项
function onGuanLianSTLChanged(field,obv,evt){
	var newVal = evt.params.newValue;
  	var rowEl = field.cell.row.el;
	if(newVal!=null){
		field.cell.row.el.find('#edit').show();
	}else{
		field.cell.row.el.find('#edit').hide();
	}
  	
    //设定下拉选项过滤条件
  	var ziDuanLXField = field.cell.row.getCell('ziDuanLX').field;
  	var ziDuanLXVal = ziDuanLXField.getValue();
    if(ziDuanLXVal!=null && (ziDuanLXVal.ziDuanLXDH == 'set' || ziDuanLXVal.ziDuanLXDH == 'fileset')){
		var guanLianFLZDField = field.cell.row.getCell('guanLianFLZD').field;
        if(newVal != null){
          	guanLianFLZDField.datasource.setFilter('shiTiLei.id','=',newVal.shiTiLeiDM);
        }else{
            guanLianFLZDField.datasource.setFilter('shiTiLei.id','=',-1);
        }
      	guanLianFLZDField.datasource.load({},function(){
            guanLianFLZDField.createOptions();
        },true,false);
    }
}


//自动创建子表
var currentGuanLianSTLField = null;
function autoCreateSubSTL(guanLianSTLField,relaShiTiLeiData){
	currentGuanLianSTLField = guanLianSTLField;
	//弹出文件选择窗口
	LUI.PageUtils.popup({
		page:'system/subShiTiLeiAppend/subShiTiLeiAppend.html',
		buttons: {
			"确定": function() {
				LUI.Form.getInstance('subShiTiLeiAppendForm').save(function(result){
					//保存成功 设置当前字段的关联实体类为本次新加的实体类
					if(result.success){
						var newStlRecord = this.datasource.getRecord(0);
						var newStlData = newStlRecord.getData();
						guanLianSTLField.addOption(newStlData);
						guanLianSTLField.setValue(newStlData);
					}
                  	$( this ).dialog( "close" );
				});
			},
			"取消": function() {
				$( this ).dialog( "close" );
			}
		}
	});
}