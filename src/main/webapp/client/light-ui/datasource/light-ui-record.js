

LUI.Record = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	//创建新记录(字段集合 以及主键列)
　　createNew: function(fieldsDefArray,primaryFieldName){
		var fields = []; 
		if(fieldsDefArray != null && fieldsDefArray.length >0){
			fields = fieldsDefArray;
		}else if(primaryFieldName!=null){
			fields = [{
				name:primaryFieldName
			}];
		}
　　　　 var r = $.extend(LUI.Observable.createNew(),{
			id:'_record_'+(++LUI.Record.uniqueId),
			isNew:true,
			isDeleted:false,
			fields:fields,
			primaryFieldName:primaryFieldName,
			primaryFieldValue:null,
			fieldName:null,//record作为另外一个record中的一个字段时 字段名
			data:{},
			oldData:{},
			modified:{},
			events:{
				initial:'record_initial',//值初始化
				change:'record_change',//值改变
				reset:'record_reset',//取消全部值的改变
				remove:'record_remove',//删除记录
				recall:'record_recall'//取消删除记录
			},
			saveOK:function(data){
				//保存成功 清除标志
				if(this.isNew && this.primaryFieldName!=null){
					this.primaryFieldValue = data[this.primaryFieldName];
					this.isNew = false;
				}
				this.modified = {};
				
				for(var i=0;i<this.fields.length;i++){
					var fieldValObj = this.data[this.fields[i].name];
					if(fieldValObj!=null && ( this.fields[i].fieldType == 'object' || this.fields[i].fieldType == 'set')){
						var subPKs = data[this.fields[i].name];
						if(subPKs!=null){
							fieldValObj.saveOK(subPKs);
						}
					}
				}
			},
			remove:function(){
				//删除此记录
				this.isDeleted = true;
				this.fireEvent(this.events.remove,{});
			},
			recall:function(){
				//取消删除
				this.isDeleted = false;
				this.fireEvent(this.events.recall,{});
			},
			reset:function(){
				//取消修改
				this.loadData(this.oldData);
				this.fireEvent(this.events.reset,{});
			},
			/**
			 * fieldName:
			 * fieldNewValue:
			 * silence:是否触发record的change事件
			 * isInitial:是否record在初始化数据
			 * source:触发值变化的源对象（在事件级联触发时，不会回到源对象）
			 */
			_setField:function(fieldName,fieldNewValue,silence,isInitial,originSource){
				//检查
				if(this.equalsValue(this.data[fieldName],fieldNewValue)){
					//no change
					return;
				}else if(this.equalsValue(this.oldData[fieldName],fieldNewValue)){
					//改回了原值
					delete this.modified[fieldName] ;
					
					
					var oldVal = this.data[fieldName];
					this.data[fieldName] = fieldNewValue;
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							fieldName:fieldName,
							oldValue:oldVal,
							newValue:fieldNewValue,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}else{
					var oldVal = this.data[fieldName];
					//真的修改了
					this.data[fieldName] = fieldNewValue;
					this.modified[fieldName] = fieldNewValue;
					
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							fieldName:fieldName,
							oldValue:oldVal,
							newValue:fieldNewValue,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}
			},
			setFieldValue:function(fieldName,fieldNewValue,silence,isInitial,originSource){
				var fieldDef = this.getFieldDefine(fieldName);
				if(fieldDef == null){
					LUI.Message.info("错误","记录中不存在此字段("+fieldName+")!");
					return ;
				}
				//
				if(fieldDef.fieldType == 'object'){
					var fieldRecord = this.getFieldValue(fieldName);
					if(fieldNewValue==null){
						//将对象类型的字段置为null 要取消对此记录的监听
						this._setField(fieldName,null,silence,isInitial,originSource);
						if(fieldRecord!=null){
							fieldRecord.removeListener(fieldRecord.events.change,this);
						}
					}else{
						if(fieldRecord==null){
							//原值为null 设置非空值 需要创建新记录 并监听
							fieldRecord = LUI.Record.createNew(fieldDef.fields,fieldDef.meta.primaryFieldName);
							fieldRecord.fieldName = fieldName;
								
							fieldRecord.addListener(fieldRecord.events.change,this,function(fRecord,r,e){
								this.data[fRecord.fieldName] = fieldRecord;
								this.modified[fRecord.fieldName] = fieldRecord;
							});
						}
						fieldRecord.primaryFieldValue = fieldNewValue[fieldDef.meta.primaryFieldName];
						//原值不为空 循环设置属性值
						for(var p in fieldNewValue){
							if(fieldRecord.hasField(p)){
								fieldRecord.setFieldValue(p,fieldNewValue[p]);
							}
						}
//						this._setField(fieldName,fieldNewValue,silence,isInitial,originSource);
					}
				}else if(fieldDef.fieldType == 'set'){
					LUI.Message.info("警告","暂时不允许对集合字段直接设置值!");
					return ;
//					var fieldRecordset = this.data[fieldName];
//					if(fieldNewValue!=null){
//						if(!LUI.Util.isArray(fieldNewValue)){
//							LUI.Message.info("错误","必须使用[{}]格式的参数为记录中的集合字段赋值!");
//							return ;
//						}
//						fieldRecordset.loadData(fieldNewValue);
//					}else{
//						//修改已有的记录 (按主键值判断)
//						//增加
//						if(fieldRecordset!=null){
//							fieldRecordset.removeAll();
//						}else{
//							//创建新recordset
//							fieldRecordset = LUI.Recordset.createNew(fieldDef.fields,fieldDef.meta.primaryFieldName,fieldDef.name);
//							fieldRecordset.addListener(fieldRecordset.events.change,this,function(){
//								this.modified[fieldName] = fieldRecordset;
//							});
//							this._setField(fieldName,fieldRecordset,silence,isInitial,originSource);
//						}
//						
//						if(fieldNewValue!=null){
//							if(!LUI.Util.isArray(fieldNewValue)){
//								LUI.Message.info("错误","必须使用[{}]格式的参数为记录中的集合字段赋值!");
//								return ;
//							}
//							fieldRecordset.loadData(fieldNewValue);
//						}
//					}
				}else{
					this._setField(fieldName,fieldNewValue,silence,isInitial,originSource);
				}
			},
			getFieldValue:function(fieldName){
				var fieldDef = this.getFieldDefine(fieldName);
				if(fieldDef == null){
					LUI.Message.info("错误","记录中不存在此字段("+fieldName+")!");
					return ;
				}
				var fieldVal = this.data[fieldName];
				if(fieldDef.fieldType == 'set' && fieldVal==null){
					var recordset = LUI.Recordset.createNew(fieldDef.fields,fieldDef.meta.primaryFieldName,fieldName);
					this.data[fieldName] = recordset;
					recordset.addListener(recordset.events.change,this,function(setRecordset,r,e){
						this.data[setRecordset.fieldName] = setRecordset;
						this.modified[setRecordset.fieldName] = setRecordset;
					});
					fieldVal = recordset;
				}
				return fieldVal;
			},
			equalsValue:function(val1,val2){
				var testVal1 = val1==null?'':val1;
				var testVal2 = val2==null?'':val2;
				return testVal1 == testVal2;
			},
			getSubmitData : function(onlyModified){
				var newData = {};
				if(this.isDeleted){
					newData[this.primaryFieldName] = this.primaryFieldValue;
				}else{
					var dataObj = this.data;
					if(onlyModified){
						dataObj = this.modified;
					}
					
					for(var p in dataObj){
						if(this.hasField(p)){
							var fieldDef = this.getFieldDefine(p);
							if(dataObj[p]!=null && fieldDef.fieldType == 'object'){
								var relaObj = {};
								relaObj[fieldDef.meta.primaryFieldName] = dataObj[p].primaryFieldValue;
								newData[p] = relaObj;
							}else if(dataObj[p]!=null && fieldDef.fieldType == 'set'){
								newData[p] = dataObj[p].getSubmitData(onlyModified);
							}else if(dataObj[p]!=null){
								newData[p] = dataObj[p];
							}else if(dataObj[p]==null){
								newData[p] = null;
							}
						}
					}
					//旧数据 加入主键列
					if(!this.isNew){
						newData[this.primaryFieldName] = this.primaryFieldValue;
					}
				}
				return newData;
			},
			getData:function(){
				var _data = {
					_record_id:this.id
				};
				for(var i=0;i<this.fields.length;i++){
					var fieldValObj = this.data[this.fields[i].name];
					if(fieldValObj!=null && ( this.fields[i].fieldType == 'object' || this.fields[i].fieldType == 'set')){
						_data[this.fields[i].name] = fieldValObj.getData();
					}else{
						_data[this.fields[i].name] = fieldValObj;
					}
				}
				return _data;
			},
			//为record对象加载数据 根据主键值判断 是否新增的记录
			loadData:function(dataObj){
				
				var _data = {};
				for(var i=0;i<this.fields.length;i++){
					var fieldDef = this.fields[i];
					var fieldValObj = dataObj[fieldDef.name];
					if(fieldValObj!=null && fieldDef.fieldType == 'object'){
						var fieldRecord = LUI.Record.createNew(fieldDef.fields,fieldDef.meta.primaryFieldName);
						fieldRecord.loadData(fieldValObj);
						fieldRecord.primaryFieldValue = fieldValObj[fieldDef.meta.primaryFieldName];
						fieldRecord.fieldName = fieldDef.name;

						fieldRecord.addListener(fieldRecord.events.change,this,function(objRecord,r,e){
							this.data[objRecord.fieldName] = objRecord;
							this.modified[objRecord.fieldName] = objRecord;
							
							this.fireEvent(this.events.change,{
								fieldName:objRecord.fieldName,
								oldValue:objRecord,
								newValue:objRecord,
								isInitial:false
							},this);
						});
						_data[fieldDef.name] = fieldRecord;
					}else if(fieldValObj!=null && this.fields[i].fieldType == 'set'){
						_data[fieldDef.name] = LUI.Recordset.createNew(fieldDef.fields,fieldDef.meta.primaryFieldName,fieldDef.name);
						_data[fieldDef.name].addListener(_data[fieldDef.name].events.change,this,function(setRecordset,r,e){
							this.data[setRecordset.fieldName] = setRecordset;
							this.modified[setRecordset.fieldName] = setRecordset;
							this.fireEvent(this.events.change,{
								fieldName:setRecordset.fieldName,
								oldValue:setRecordset,
								newValue:setRecordset,
								isInitial:false
							},this);
						});
						_data[fieldDef.name].loadData(fieldValObj);
					}else if(fieldValObj!=null){
						_data[fieldDef.name] = fieldValObj;
					}
				}
				
				this.oldData = dataObj;
				this.data = _data;
				this.modified = {};
				
				this.primaryFieldValue = dataObj[this.primaryFieldName];
				//无主键值的记录 要将所有值都记录到modified
				if(this.primaryFieldValue == null){
					this.isNew = true;
					for(var p in this.data){
						this.modified[p] = this.data[p];
					}
				}else{
					this.isNew = false;
				}
			},
			//复制record对象 为新的记录
			clone:function(dataObj){
				var r = LUI.Record.createNew(this.fields,this.primaryFieldName);
				r.loadData(this.getData());
				r.primaryFieldValue = null;
				r.isNew = true;
				return r;
			},
			addField:function(fieldDef){
				if(this.hasField(fieldDef.name)){
					LUI.Message.info("错误","记录中已存在名称为'"+fieldDef.name+"'的字段!");
				}else{
					this.fields[this.fields.length] = fieldDef;
				}
			},
			removeField:function(fieldName){
				//删除字段定义
				for(var i=0;i< this.fields.length;i++){
					var fieldDef = this.fields[i];
					if(fieldDef.name == fieldName){
			 			this.fields.splice(i,1);
						break;
					}
				}
				//删除可能存在的原内容
				delete this.oldData[fieldName];
				//删除可能存在的现内容
				delete this.data[fieldName];
				//删除可能存在的修改内容
				delete this.modified[fieldName];
			},
			isModified:function(){
				if(this.modified==null || LUI.Util.isEmpty(this.modified) || this.primaryFieldName==null){
					return false;
				}
				return true;
			},
			hasField:function(fieldName){
				for(var i=0;i< this.fields.length;i++){
					var fieldDef = this.fields[i];
					if(fieldDef.name == fieldName){
			 			return true;
					}
				}
		  		return false;
			},
			getFieldDefine:function(fieldName){
				var fieldDef = null;
				for(var i=0;i< this.fields.length;i++){
					if(this.fields[i].name == fieldName){
						fieldDef = this.fields[i];
						break;
					}
				}
		  		return fieldDef;
			},
			destroy:function(){
				for(var i=0;i<this.fields.length;i++){
					var fieldValObj = this.data[this.fields[i].name];
					if(fieldValObj!=null && ( this.fields[i].fieldType == 'object' || this.fields[i].fieldType == 'set')){
						fieldValObj.destroy();
					}
				}
				
				this.removeAllListener();
				LUI.Record.instances.remove(this);
			}
		});
 		//登记此record
		LUI.Record.instances.put(r);
		return r;
	},
	getInstance:function(record_id){
		var r = null;
		for(var i =0;i<LUI.Record.instances.size();i++){
			var _instance = LUI.Record.instances.get(i);
			if(_instance.id == record_id){
				r = _instance;
				break;
			}
		}
		return r;
	},
	removeInstance:function(record_id){
		for(var i =0;i<LUI.Record.instances.size();i++){
			var _instance = LUI.Record.instances.get(i);
			if(_instance.id == record_id){
				LUI.Record.instances.remove(_instance);
				break;
			}
		}
	}
};


LUI.Recordset = {
		uniqueId:0,
		createNew: function(fieldsDefArray,primaryFieldName,fieldName){
			if(fieldsDefArray == null || fieldsDefArray.length ==0){
				LUI.Message.info("错误","创建记录集时必须提供字段信息!");
				return null;
			}
			
			var rs = $.extend(LUI.Observable.createNew(),{
				id:'_recordset_'+(++LUI.Recordset.uniqueId),
				fieldName:fieldName,
				fields:fieldsDefArray,
				primaryFieldName:primaryFieldName,
				all:LUI.Set.createNew(),
				deleted:LUI.Set.createNew(),
				events:{
					change:'record_change'//值改变
				},
				size:function(){
					return this.all.size();
				},
				getRecordById:function(_rec_id){
					var r = null;
					for(var i = 0;i<this.size();i++){
						var cr = this.all.get(i);
						if(cr.id == _rec_id){
							r = cr;
							break;
						}
					}
					return r;
				},
				getRecordByIndex:function(index){
					return this.all.get(index);
				},
				getRecordByPrimaryFieldValue:function(primaryFieldValue){
					var r = null;
					for(var i = 0;i<this.size();i++){
						var cr = this.all.get(i);
						if(cr.primaryFieldValue == primaryFieldValue){
							r = cr;
							break;
						}
					}
					return r;
				},
				getRecordByFilter:function(filterFunc){
					var r = null;
					for(var i = 0;i<this.size();i++){
						var cr = this.all.get(i);
						var check_result = filterFunc.apply(this,[cr]);
						if(check_result == true){
							r = cr;
							break;
						}
					}
					return r;
				},
				addRecord:function(data){
					var r = LUI.Record.createNew(this.fields,this.primaryFieldName);
					r.loadData(data);
					r.primaryFieldValue = data[this.primaryFieldName];
					if(r.primaryFieldValue==null){
						r.isNew = true;
					}else{
						r.isNew = false;
					}
					this.all.put(r);
					//监听record的change事件
					r.addListener(r.events.change,this,function(){
						this.fireEvent(this.events.change,{fieldName:this.fieldName});
					});
					//监听record的remove事件
					if(!r.isNew){
						r.addListener(r.events.remove,this,function(){
							this.fireEvent(this.events.change,{fieldName:this.fieldName});
						});
					}
					//通知上级 已经改变（ 新增记录）
					this.fireEvent(this.events.change,{fieldName:this.fieldName});
					return r;
				},
				saveOK:function(dataArray){
					//保存成功 清除标志
					this.deleted = LUI.Set.createNew();
					
					for(var i = 0;i<this.all.size();i++){
						var cr = this.all.get(i);
						if(cr.isNew && cr.isModified()){
							var pkValue = null;
							for(var k = 0;k<dataArray.length;k++){
								if(dataArray[k]._clientDetailKey == cr.id ){
									pkValue = dataArray[k][this.primaryFieldName];
								}
							}
							if(pkValue == null){
								LUI.Message.info("错误","保存成功后，未返回集合新增数据的主键值!");
							}else{
								cr.saveOK(pkValue);
							}
						}
					}
				},
				getSubmitData : function(onlyModified){
					var _dataObject = {
						inserted:[],
						modified:[],
						deleted:[]
					};
					for(var i = 0;i<this.all.size();i++){
						var cr = this.all.get(i);
						if(cr.isNew && (cr.isModified() || !onlyModified)){
							_dataObject.inserted[_dataObject.inserted.length] = cr.getSubmitData(onlyModified);
						}else if (!cr.isNew && (cr.isModified() || !onlyModified)){
							_dataObject.modified[_dataObject.modified.length] = cr.getSubmitData(onlyModified);
						}
					}
					
					for(var i = 0;i<this.deleted.size();i++){
						var cr = this.deleted.get(i);
						_dataObject.deleted[_dataObject.modified.length] = cr.getSubmitData(onlyModified);
					}
					return _dataObject;
				},
				getData:function(){
					var _dataArray = [];
					for(var i = 0;i<this.size();i++){
						var cr = this.all.get(i);
						_dataArray[_dataArray.length] = cr.getData();
					}
					return _dataArray;
				},
				loadData:function(dataArray){
					if(dataArray == null){
						LUI.Message.info("错误","集合数据为空!");
						return ;
					}
					this.removeAll();
					this.deleted.removeAll();
					for(var i = 0;i<dataArray.length;i++){
						this.addRecord(dataArray[i]);
					}
				},
				removeRecord:function(r){
					if(r.isDeleted){
						LUI.Message.info("错误","此记录已删除!");
						return ;
					}
					
					if(!this.all.contains(r)){
						LUI.Message.info("错误","此记录不属于当前记录集!");
						return ;
					}
					
					if(!r.isNew){
						this.deleted.put(r);
					}
					
					r.remove();
					this.all.remove(r);
				},
				removeRecordByIndex:function(index){
					if(index >= this.size()){
						LUI.Message.info("错误","不存在索引号为"+index+"的记录!");
						return ;
					}
					var cr = this.getRecordByIndex(index);
					this.removeRecord(r);
				},
				removeAll:function(){
					while(this.size()>0){
						var cr = this.all.get(0);
						this.removeRecord(cr);
					}
				},
				destroy:function(){
					for(var i = 0;i<this.size();i++){
						var cr = this.all.get(i);
						cr.destroy();
					}
					
					this.removeAllListener();
				}
			});
			return rs;
		}
	};
