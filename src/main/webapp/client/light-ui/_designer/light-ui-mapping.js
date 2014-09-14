LUI.Mapping = {
		_gridMaping:null,
		openGridMaping:function(dataset,gridColumnsNode){
			var gridNode = gridColumnsNode.getParentNode();
			//创建或取得对话框
			var gridMapingInstance = LUI.Mapping._gridMapping;
			if(gridMapingInstance==null){
				gridMapingInstance = LUI.Mapping.createNewGridMaping(gridNode.component.type);
			}
			//记录本次信息
			gridMapingInstance._dataset = dataset;
			gridMapingInstance._columnsNode = gridColumnsNode;
			gridMapingInstance._gridNode = gridNode;
			//通知数据源加载数据 并将结果 显示在数据选择控件中
			dataset.load({
				limit:8,
		    	fields:"['...']"
			},function(params,result){
				//更新LUI.Mapping.chosen显示内容
				var options = "";
				if(gridMapingInstance._dataset.component.name == 'sqlDataset' || gridMapingInstance._dataset.component.name == 'sqlRecord'){
					
					gridMapingInstance._result = result;
					gridMapingInstance._data = null;
					if(result.rows.length>0){
						gridMapingInstance._data = result.rows[0];
						for(var i=0;i<result.rows.length;i++){
							var rowData = result.rows[i];
							options = options+"<option value='"+i+"'"+(i==0?" selected ":"")+">"+LUI.Util.stringify(rowData)+"</option>";
						}
					}
				}else{
					var meta = result.meta;
					if(meta!=null){
						gridMapingInstance._result = result;
						gridMapingInstance._data = null;
						if(result.rows.length>0){
							gridMapingInstance._data = result.rows[0];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								options = options+"<option value='"+rowData[meta.zhuJianLie]+"'"+(i==0?" selected ":"")+">"+rowData[meta.xianShiLie]+"</option>";
							}
						}
					}
					
				}
				
				
				
				gridMapingInstance.dialog.find('select#_mappingDataEL option').remove();
				gridMapingInstance.dialog.find('select#_mappingDataEL').first().append(options);
				
				if(gridMapingInstance.dataSelector != null){
					gridMapingInstance.dialog.find('select#_mappingDataEL').first().chosen("destroy");
				}
				gridMapingInstance.dataSelector = gridMapingInstance.dialog.find('select#_mappingDataEL').first().chosen({
					search_contains:true,
					disable_search_threshold:-1,
					no_results_text:'无满足条件的记录',
					width:'100%'
				}).change(function(event,selectedOption){
					var index = event.currentTarget.selectedIndex;
					
					gridMapingInstance._data = LUI.Mapping._gridMapping._result.rows[index];
					
					//选择的数据发生变化时 重新显示所有的值
					LUI.Mapping._gridMapping.generateColumnTmplate(-1);
					
				});
				//覆盖chosen的查询
				if(gridMapingInstance._dataset.component.name == 'sqlDataset' || gridMapingInstance._dataset.component.name == 'sqlRecord'){
					var chosenInstance = gridMapingInstance.dataSelector.data('chosen');
					chosenInstance.results_search = function(evt) {
						if (chosenInstance.results_showing) {
							var meta = LUI.Mapping._gridMapping._result.meta;
							var filters = null;
							var searchText = chosenInstance.get_search_text();
						    var escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
						    if(escapedSearchText!=null && escapedSearchText.length >0){
						    	filters = "[{property:'"+meta.xianShiLie+"',operator:'like',value:'"+escapedSearchText+"'}]";
						    }
						    LUI.Mapping._gridMapping._dataset.load({
						    	limit:8,
						    	filters:filters,
						    	fields:"['...']"
						    },function(params,result){
						    	if(!result.success){
									LUI.Message.info("提示","取数据失败!"+result.errorMsg);
								}else{
									
									this._result = result;
									
//									chosenInstance.results_data = [{}];
									var meta = result.meta;
									var options = "";
									//将数据替换到  this.results_data;
									for(var i=0;i<result.rows.length;i++){
										var rowData = result.rows[i];
										options = options+"<option value="+rowData[meta.zhuJianLie]+">"+rowData[meta.xianShiLie]+"</option>";
									}
									$(chosenInstance.form_field).html(options);
									
									var searchText = chosenInstance.get_search_text();
									chosenInstance.results_build();
									chosenInstance.search_field.val(searchText);
									//执行查询
									chosenInstance.winnow_results();
								}
							});
						    
						} else {
							return chosenInstance.results_show();
						}
					}; 
				}else{
					var meta = result.meta;
					if(meta!=null){
						var options = "";
						
						gridMapingInstance._result = result;
						gridMapingInstance._data = null;
						if(result.rows.length>0){
							gridMapingInstance._data = result.rows[0];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								options = options+"<option value='"+rowData[meta.zhuJianLie]+"'"+(i==0?" selected ":"")+">"+rowData[meta.xianShiLie]+"</option>";
							}
						}
					}
				}
				//更新表格行及显示内容
				gridMapingInstance.initMappingEls();
				gridMapingInstance.show();
			});
		},
		createNewGridMaping:function(componentType){
			var btns = {
				"更新行模板":function(){
					var gridNode = LUI.Mapping._gridMapping._gridNode;
					//查看是否有grid控件对象
					var grid = LUI.Grid.getInstance(gridNode.data.name);
					if(grid._originalContent !=null){
						var firstDataLine = parseInt(gridNode.data.headerLines);
						
						var templateLi =  $('<ul>'+grid._originalContent+'</ul>').find("li:eq("+firstDataLine+")");
						var _columnRenderTemplate = $("<p>").append(templateLi.clone()).html();
						_columnRenderTemplate = _columnRenderTemplate.replace(/\n/g,"\\n").replace(/\"/g,'\\"').replace(/\'/g,"\\'");
						
						if(gridNode.record!=null){
							gridNode.record.setFieldValue('renderTemplate',_columnRenderTemplate);
						}
						gridNode.data.renderTemplate = _columnRenderTemplate;
						//重新显示
						LUI.Mapping._gridMapping.initMappingEls();
					}else{
						LUI.Message.info("提示","当前构建模板已经是最新的!");
					}
				},
				"确定": function() {
					//将数据字段不为空的行  加入columns/fields集合
					var zdArray = [];
					$(this).find('input#columnProperty').each(function(index,fieldEl){
						//检查是否为空
						var datacolumnName = $(fieldEl).val();
						var _closestLi = $(fieldEl).closest('li');
						var _columnNodeId = _closestLi.find('input#columnNodeId').val();
						
						if(datacolumnName != null && datacolumnName.length > 0){
							
							//插入或修改节点
							var _columnLabel = _closestLi.find('span#columnLabel input').val();
							var _columnType  = _closestLi.find('input#columnType').val();
							
							var _columnNodeComponent = null;
							var _columnNode = null;
							if(_columnNodeId!=null && _columnNodeId.length >0){
								_columnNode = LUI.PageDesigner.instance._pageCmpTree.getNodeByTId(_columnNodeId);
								_columnNodeComponent = _columnNode.component.name;
							}else{
								if( LUI.Mapping._gridMapping._gridNode.component.type == 'form' || LUI.Mapping._gridMapping._gridNode.component.name == 'editorGrid'){
//									_columnNodeComponent = "simpleField";
//									if(_columnType == "set" || _columnType == "object"){
//										_columnNodeComponent = "complexField";
//									}
									var type_def = LUI.PageDesigner.instance._types[ _columnType+"Field"];
									
									_columnNodeComponent = type_def.defaultComponent;
								}else{
									_columnNodeComponent = "gridColumn";
								}
								_columnNode = LUI.PageDesigner.instance.addComponentNode(LUI.Mapping._gridMapping._columnsNode,_columnNodeComponent,_columnLabel);
							}
							
							var _columnName  = _closestLi.find('span#columnName input').val();
							zdArray[zdArray.length] = {name:_columnName,type:_columnType};
							
							var _columnRenderto = _closestLi.find('span#elName').text();
							var _columnRenderTemplate = _closestLi.find('span#columnExpression input').val();
								
							
							if(_columnNode.record!=null){
								_columnNode.record.setFieldValue('name',_columnName);
								_columnNode.record.setFieldValue('label',_columnLabel);
								_columnNode.record.setFieldValue('fieldType',_columnType);
								_columnNode.record.setFieldValue('renderto','#'+_columnRenderto);
								_columnNode.record.setFieldValue('renderTemplate',_columnRenderTemplate);
							}
							
							var nodeText = _columnLabel||_columnName;
							var component_def = LUI.PageDesigner.instance._components[_columnNodeComponent];
							if(nodeText!=null){
								nodeText = component_def.label+"("+nodeText+")";
							}else{
								nodeText = component_def.label;
							}
							
							_columnNode.name = nodeText;
							_columnNode.data._isValid = true;
							_columnNode.data.name = _columnName;
							_columnNode.data.label = _columnLabel;
							_columnNode.data.fieldType = _columnType;
							_columnNode.data.renderto = '#'+_columnRenderto;
							_columnNode.data.renderTemplate = _columnRenderTemplate;
							LUI.PageDesigner.instance._pageCmpTree.updateNode(_columnNode);
							
						}else if(_columnNodeId!=null && _columnNodeId.length >0){
							//删除节点
							LUI.PageDesigner.instance._pageCmpTree.removeNode(LUI.PageDesigner.instance._pageCmpTree.getNodeByTId(_columnNodeId));
						}
					});
					
					//尝试将当前字段加入到数据源
					if(zdArray.length >0){
						var datasourceNode = LUI.PageDesigner.instance.getDatasourceNodeByName(LUI.Mapping._gridMapping._dataset.name);
						LUI.PageDesigner.instance.addPropertyToDatasetNode(
							datasourceNode,
							datasourceNode.children[0],
							zdArray
						);
					}
					//添加字段后 允许保存
					LUI.PageDesigner.instance._saveComponentBtn.button( "enable");
					//关闭对话框
					$(this).dialog( "close" );
				 },
				 "关闭": function() {
					 $(this).dialog( "close" );
				 }
			};
			if(componentType == "form"){
				//form节点没有行模板需要更新 删除第一个元素
				delete btns['更新行模板'];
			}
			//显示对话框
			var gridMaping = $(LUI.Mapping._mappingContent).dialog({
				title: "关联页面元素",
				autoOpen: false,
				height: 300,
				width: 980,
				modal: true,
				open: function( event, ui ) {
					
				},
				buttons: btns
			});
			LUI.Mapping._gridMapping = {
				_dataset:null,
				_columnsNode:null,
				_gridNode:null,
				dialog:gridMaping,
				show:function(){
					this.dialog.dialog( "open" );
				},
				//根据模板 生成显示字段对应的显示值
				generateColumnTmplate:function(rowIndex){
					this.dialog.find('span#columnExpression input').each(function(index,fieldEl){
						if(rowIndex < 0 || rowIndex == index){
							var _expression_parentLi = $(fieldEl).closest("li");
							
							//显示表达式初值不为空的 设置显示值
							var templateExpression = $(fieldEl).val();
							if(templateExpression != null && templateExpression.length > 0 && LUI.Mapping._gridMapping._data!=null){
								var _expression_template = Handlebars.compile(templateExpression);
								var _expression_value = _expression_template(LUI.Mapping._gridMapping._data);
								_expression_parentLi.find('span#columnValue').html(_expression_value);
							}else{
								_expression_parentLi.find('span#columnValue').html("");
							}
						}
					});
				},
				//根据模板 生成显示字段对应的显示值
				columnNameChanged:function(rowIndex,newName,newLabel,newType){
					this.dialog.find('span#columnName input').each(function(index,fieldEl){
						if(rowIndex == index){
							var _parentLi = $(fieldEl).closest("li");
							
							if(newName==null){
								//清空column名称
								_parentLi.find('span#columnName input').val('');
								//清空column标题
								_parentLi.find('span#columnLabel input').val('').attr('disabled','disabled');
								//清空column表达式
								_parentLi.find('span#columnExpression input').val('').attr('disabled','disabled');
								//清空column值
								_parentLi.find('span#columnValue').html('');
							}else{
								//显示column名称
								_parentLi.find('span#columnName input').val(newName);
								//显示column标题
								_parentLi.find('span#columnLabel input').val(newLabel).removeAttr('disabled');
								//显示column类型
								_parentLi.find('input#columnType').val(newType);
								//显示column表达式
								_parentLi.find('span#columnExpression input').val('{{'+newName+'}}').removeAttr('disabled');
								//显示column值
								
								//设置对应的显示值
								LUI.Mapping._gridMapping.generateColumnTmplate(index);
							}
						}
					});
				},
				//初始化列表行  
				//清除列表中 原有信息
				//将目标元素中的所有.data子元素 加入列表
				initMappingEls:function(){
					//grid节点 及目标元素
					var gridRenderto = this._gridNode.data.renderto;
					//显示映射窗口
					var firstDataLine = parseInt(this._gridNode.data.headerLines);
					//找到模板中的.data元素
					var rows = [];
					
					var componentType = this._gridNode.component.type;
					var content = null;
					if( componentType == 'form'){
						var formName = this._gridNode.data.name;
						var formInstance = LUI.Form.getInstance(formName);
						if(formInstance!=null){
							content = $(formInstance.formTargetElContent);
						}else{
							content = $(this._gridNode.data.renderto);
						}
					}else{
						var contentString = this._gridNode.data.renderTemplate;
						contentString = contentString.replace(/\\"/g,'\"').replace(/\\'/g,"\'");
						content =  $(contentString);
					}
					
					content.find(".data,.field,.column").each(function(index,element){
						var elName = element.id;
						var elLabel = "无";
						var elLabel = "";
						if( componentType == 'form'){
							elLabel = content.find("label[for="+elName+"]").text();
							elValue = $(element).val();
						}else{
							if(firstDataLine >0){
								//从第一行中 取得对应的标题
								elLabel = $(gridRenderto+" li:eq(0)").children().eq(index).text();
							}
							elValue = $(element).text();
						}
						
						var columnName = null;
						var columnLabel = null;
						var columnExpression = null;
						var columnValue = null;
						var columnType = null;
						var columnNodeId = null;
						//检查当前columns节点下 是否有关联了此元素的column节点
						if(elName!=null && LUI.Mapping._gridMapping._columnsNode.children!=null){
							for(var j=0;j<LUI.Mapping._gridMapping._columnsNode.children.length;j++){
								var columnNode = LUI.Mapping._gridMapping._columnsNode.children[j];
								if(columnNode.data.renderto == '#'+element.id){
									columnName = columnNode.data.name;
									columnLabel = columnNode.data.label;
									columnType = columnNode.data.fieldType;
									columnExpression = columnNode.data.renderTemplate;
									columnNodeId = columnNode.tId;
									break;
								}
							}
						}
						//
						rows[rows.length] = {
							elName:elName=null?'无':elName,
							elLabel:elLabel,
							elValue:elValue,
							columnName:columnName,
							columnLabel:columnLabel,
							columnExpression:columnExpression,
							columnValue:columnValue,
							columnType:columnType,
							columnNodeId:columnNodeId
						}
						
					});
					//生成对话框中 表格行的内容
					var _template = Handlebars.compile(LUI.Mapping._mappingLi);
					var liContent = _template({rows:rows});
					
					this.dialog.find('ul#_ul li:eq(0)').siblings().remove();
					this.dialog.find('ul#_ul').append(liContent);
					//对行中所有的columnProperty元素 生成下拉框 
					//初始化对应的显示值 并监听变化 重新生成显示值
					this.dialog.find('input#columnProperty').each(function(index,fieldEl){
						 $( "<a>" )
							 .attr( "tabIndex", -1 )
							 .appendTo( $(this).parent() )
							 .button({
								 icons: {
									 primary: "ui-icon-triangle-1-s"
								 },
								 text: false
							 })
							 .removeClass( "ui-corner-all" )
							 .removeClass( "ui-state-default" )
							 .addClass( "ui-corner-right" )
							 .css("border","1px solid #AED0EA")
							 .css("bottom","0")
							 .css("margin-top","2px")
							 .css("margin-left","-1px")
							 .css("padding","0")
							 .css("top","0")
							 .css("position","absolute")
							 .click(function() {
								 //显示数据源 及数据窗口
								 LUI.PropertyChoose.openPropertyChoose(function(zdRow){
									 //返回的当前数据、字段信息
									 if(zdRow == null){
										 LUI.Mapping._gridMapping.columnNameChanged(index,null,null);
									 }else{
										 LUI.Mapping._gridMapping.columnNameChanged(index,zdRow.ziDuanDH,zdRow.ziDuanBT,zdRow.ziDuanLX.ziDuanLXDH);
									 }
								 });
							 });
					});
					//编辑显示表达式 要刷新显示值
					this.dialog.find('span#columnExpression input').each(function(index,fieldEl){
						var _expression_change_parentLi = $(fieldEl).closest("li");
						$(fieldEl).change(function(event){
							LUI.Mapping._gridMapping.generateColumnTmplate(index);
						}); 
						
					});
					//设置显示值
					LUI.Mapping._gridMapping.generateColumnTmplate(-1);
				}
			};
			return LUI.Mapping._gridMapping;
		},
		_mappingContent:
			'<div style="width: 100%;margin: 0;padding: 0;font-family: Microsoft YaHei;">'+
				'<span style="width: 100%;margin: 0;padding: 0;">'+
					'<select id="_mappingDataEL" data-placehoder="选择数据...">'+
					'</select>'+
				'</span>'+
				'<ul id="_ul" style="width: 100%;margin: 0;padding: 0;list-style: none outside none;font-family: Microsoft YaHei;">'+
					'<li style="border-bottom:#ddd 1px solid;height: 28px;width:100%;font-size: 14px;">'+
					    '<span style="padding:0 2px;font-weight: bold;float:left;width:32px;line-height: 28px;height: 28px;"></span>'+
					    '<span style="padding:0 2px;font-weight: bold;float:left;width:80px;line-height: 28px;">目标名称</span>'+
					    '<span style="padding:0 2px;font-weight: bold;float:left;width:80px;line-height: 28px;">目标标题</span>'+
					    '<span style="padding:0 2px;font-weight: bold;float:left;width:120px;line-height: 28px;">参考值</span>'+
						'<span style="padding:0 2px;font-weight: bold;float:left;width:185px;line-height: 28px;">显示字段名</span>'+
						'<span style="padding:0 2px;font-weight: bold;float:left;width:120px;line-height: 28px;">显示字段标题</span>'+
						'<span style="padding:0 2px;font-weight: bold;float:left;width:180px;line-height: 28px;">显示表达式</span>'+
						'<span style="padding:0 2px;font-weight: bold;float:left;width:120px;line-height: 28px;">显示值</span>'+
						'<div class="clear"></div>'+
					'</li>'+
				'</ul>'+
			'</div>',
		_mappingLi:
			'{{#each rows}}'+
				'<li style="color: #666666;float: left;line-height: 28px;height: 28px;width: 100%;">'+
					'<span id="elIndex" style="padding:0 2px;float:left;width:32px;line-height: 28px;height: 28px;text-align: center;">{{add @index 1}}</span>'+
					'<span id="elName" style="padding:0 2px;float:left;width:80px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">{{elName}}</span>'+
					'<span id="elLabel" style="padding:0 2px;float:left;width:80px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">{{elLabel}}</span>'+
					'<span id="elValue" style="padding:0 2px;float:left;width:120px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">{{elValue}}</span>'+
					'<span id="columnName" style="padding-top:2px;float:left;display:inline-block;position: relative;width:185px;line-height:20px;">'+
						'<input id="columnProperty" style="height:20px;width:150px;" disabled class="field-disabled  ui-widget ui-widget-content ui-corner-left ui-autocomplete-input" value="{{columnName}}">'+
					'</span>'+
					'<span id="columnLabel" class="ui-widget" style="padding:0 2px;float:left;width:120px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">'+
						'<input type="text" class="text ui-widget-content ui-corner-all" style="height: 20px;" value="{{columnLabel}}">'+
					'</span>'+
					'<span id="columnExpression" class="ui-widget" style="padding:0 2px;float:left;width:180px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">'+
						'<input type="text" class="text ui-widget-content ui-corner-all" style="height: 20px;" value="{{columnExpression}}">'+
					'</span>'+
					'<span id="columnValue" style="padding:0 2px;float:left;width:120px;line-height: 28px;height: 28px;overflow: hidden;text-overflow: ellipsis;">{{columnValue}}</span>'+
					'<input id="columnType" type="hidden" value="{{columnType}}">'+
					'<input id="columnNodeId" type="hidden" value="{{columnNodeId}}">'+
				'</li>'+
			'{{/each}}'
};


LUI.PropertyChoose = {
		_propertyChoose:null,
		openPropertyChoose:function(callback){
			//创建或取得对话框
			var propertyChooseInstance = LUI.PropertyChoose._propertyChoose;
			if(propertyChooseInstance==null){
				propertyChooseInstance = LUI.PropertyChoose.createNewPropertyChoose();
			}else{
				//修改对话框标题
				propertyChooseInstance.dialog.dialog( "option","title", "数据源("+LUI.Mapping._gridMapping._dataset.label+")-字段选择");
			}
			//记录本次信息
			propertyChooseInstance._callback = callback;
			//更新显示内容
			if(LUI.Mapping._gridMapping._dataset.component.name == 'sqlDataset' || LUI.Mapping._gridMapping._dataset.component.name == 'sqlRecord'){
				
				//取数据源定义
				var dsXiTongDH = LUI.Mapping._gridMapping._dataset.xiTongDH;
				var dsSQl = LUI.Mapping._gridMapping._dataset.sql;
				
				var currentSQLQuery = dsXiTongDH+"_"+dsSQl;
				if(propertyChooseInstance._lastSQLQuery == currentSQLQuery){
					propertyChooseInstance.refreshPropertyChoose();
					LUI.PropertyChoose._propertyChoose.show();
				}else{
					propertyChooseInstance._lastSQLQuery = currentSQLQuery;
					//清除原有内容
					var treeGrid = LUI.PropertyChoose._propertyChoose._tree;
					while(treeGrid.rootNodes.length >0){
						treeGrid.removeNode(treeGrid.rootNodes[0].id);
					}
					//取得sql中所有列
					propertyChooseInstance.requestColumnsFromSql(dsXiTongDH,dsSQl,function(zdResult){
						//从sql中 取得列信息 创建treegrid的行信息做为根节点加入）
						this.addZdsToTree(null,zdResult.data);
						
						this.refreshPropertyChoose();
						
						LUI.PropertyChoose._propertyChoose.show();
					});
				}
			}else{
				
				var datasourceNode = LUI.PageDesigner.instance.getDatasourceNodeByName(LUI.Mapping._gridMapping._dataset.name);
				//取数据源定义
				var dsXiTongDH = datasourceNode.data.xiTongDH;
				var dsGongNengDH = datasourceNode.data.gongNengDH;
				var dsShiTiLeiDH = datasourceNode.data.shiTiLeiDH;
				
				var currentZdsQuery = dsXiTongDH+"_"+(dsGongNengDH||dsShiTiLeiDH);
				if(propertyChooseInstance._lastZdsQuery == currentZdsQuery){
					propertyChooseInstance.refreshPropertyChoose();
					//显示窗口
					LUI.PropertyChoose._propertyChoose.show();
				}else{
					propertyChooseInstance._lastZdsQuery = currentZdsQuery;
					//清除原有内容
					var treeGrid = LUI.PropertyChoose._propertyChoose._tree;
					while(treeGrid.rootNodes.length >0){
						treeGrid.removeNode(treeGrid.rootNodes[0].id);
					}
					//取得实体类中所有字段
					propertyChooseInstance.requestZdsFromServer(dsXiTongDH,dsGongNengDH,dsShiTiLeiDH,function(zdResult){
						//根据得到的字段信息 创建treegrid的行信息做为根节点加入）
						this.addZdsToTree(null,zdResult.data);
						this.refreshPropertyChoose();
						//显示窗口
						LUI.PropertyChoose._propertyChoose.show();
					});
				}
				this._lastZdsQuery = currentZdsQuery;
				
				
				
			}
		},
		createNewPropertyChoose:function(){
			//显示对话框
			var propertyChooseDialog = $(LUI.PropertyChoose._propertyChooseContent).dialog({
				title: "数据源("+LUI.Mapping._gridMapping._dataset.label+")-字段选择",
				autoOpen: false,
				height: 480,
				width: 700,
				modal: true,
				open: function( event, ui ) {
						
				},
				buttons: {
					"清除": function() {
						LUI.PropertyChoose._propertyChoose._callback.apply(this,null);
						$(this).dialog( "close" );
					 },
					"确定": function() {
						//取得选中的节点
						var selectNodes = LUI.PropertyChoose._propertyChoose._tree.getSelectNodes();
						if(selectNodes!=null && selectNodes.length >0){
							LUI.PropertyChoose._propertyChoose._callback.apply(this,[selectNodes[0].dataObject]);
							//关闭对话框
							$(this).dialog( "close" );
						}else{
							LUI.Message.info("提示","请选择数据字段!");
						}
					 },
					 "关闭": function() {
						 $(this).dialog( "close" );
					 }
				}
			});
			
			var propertyChooseTree = new Core4j.toolbox.TableTree4j({
				headers:[{
				  	columns:[{dataIndex:'label'},{dataIndex:'type'},{dataIndex:'value'}],
					dataObject:{label:'字段名称/代号',type:'类型',value:'参考值'},
					trAttributeNames:['classStyle','style'],
					trAttributeValueObject:{classStyle:'tabletree4j-headerbg',style:''}
				}],
				columns:[{
					dataIndex:'label',width:'55%',isNodeClick:true,renderFunction:function(colData){
						var dataObj = colData.node.dataObject;
						return ""+dataObj.ziDuanBT+"【"+dataObj.ziDuanDH+"】";
					}
				},{
					dataIndex:'type',width:'10%',renderFunction:function(colData){
						var dataObj = colData.node.dataObject;
						return ""+dataObj.ziDuanLX.ziDuanLXDH;
					}
				},{
					dataIndex:'value',width:'35%',renderFunction:function(colData){
						if(colData.node.dataObject==null || LUI.PropertyChoose._propertyChoose._data==null){
							return "";
						}
						var result = LUI.PropertyChoose._propertyChoose._data[colData.node.dataObject.ziDuanDH];
						if(typeof(result) == 'object'){
							result = LUI.Util.stringify(result);
						}
						return result;
					}
				}],
				treeMode:'gird',
				renderTo:'_propertyChooseTreeEL',
				useLine:true,
				useIcon:true,
				id:'_propertyChooseTree',
				useCookie:false,
				themeName:'arrow',
				selectMode:'single'
			});
			//build tree by nodes
			propertyChooseTree.build([],true);
			
			LUI.PropertyChoose._propertyChoose = {
				_callback:null,
				dialog:propertyChooseDialog,
				_tree:propertyChooseTree,
				_dataSelector:null,
				show:function(){
					this.dialog.dialog( "open" );
				},
				requestColumnsFromSql:function(dsXiTongDH,dsSQl,callback){
					
					//取得 实体类定义
					$.ajax({
						url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
						type: "POST", 
						data:{
							application:'nsb',
							service:'designer',
							method:'loadSQLMeta',
							parameters:"{" +
								"xiTongDH:'"+dsXiTongDH+"'," +
								"sql:\""+dsSQl+"\"" +
							"}"
						},
						dataType:"json",
						context:this,
						success:function(result){
							if(!result.success){
								LUI.Message.info("提示","取sql列信息失败!"+result.errorMsg);
							}else{
								callback.apply(LUI.PropertyChoose._propertyChoose,[result]);
							}
						},
						error:function(){
							LUI.Message.info("信息","访问服务器失败!");
						}
					});
				
				},
				requestZdsFromServer:function(dsXiTongDH,dsGongNengDH,dsShiTiLeiDH,callback){
					//取得 实体类定义
					$.ajax({
						url: "http://"+_urlInfo.host+":"+_urlInfo.port+"/jservice/", 
						type: "POST", 
						data:{
							application:'nsb',
							service:'designer',
							method:'loadSTL',
							parameters:"{" +
								"xiTongDH:'"+dsXiTongDH+"'," +
								(dsGongNengDH!=null?("gongNengDH:'"+dsGongNengDH+"',"):"") +
								(dsShiTiLeiDH!=null?("shiTiLeiDH:'"+dsShiTiLeiDH+"',"):"") +
								"fields:[{" +
									"name:'ziDuanDM'" +
								"},{" +
									"name:'ziDuanDH'" +
								"},{" +
									"name:'ziDuanBT'" +
								"},{" +
									"name:'ziDuanLX',fields:[{" +
										"name:'ziDuanLXDH'" +
									"}]" +
								"},{" +
									"name:'guanLianSTL',fields:[{" +
										"name:'shiTiLeiDH'" +
									"},{" +
										"name:'zhuJianLie'," +
									"},{" +
										"name:'xianShiLie'" +
									"}]" +
								"}]" +
							"}"
						},
						dataType:"json",
						context:this,
						success:function(result){
							if(!result.success){
								LUI.Message.info("提示","取字段信息失败!"+result.errorMsg);
							}else{
								callback.apply(LUI.PropertyChoose._propertyChoose,[result]);
							}
						},
						error:function(){
							LUI.Message.info("信息","访问服务器失败!");
						}
					});
				},
				refreshPropertyChoose:function(){
					//使用mapping控件中的数据 初始化数据选择控件chosen
					var gridMapingInstance = LUI.Mapping._gridMapping;
					var result = gridMapingInstance._result;
					LUI.PropertyChoose._propertyChoose._data = null;
					var meta = result.meta;
					
					var options = "";
					if(gridMapingInstance._dataset.component.name == 'sqlDataset' || gridMapingInstance._dataset.component.name == 'sqlRecord'){
						if(result.rows.length>0){
							LUI.PropertyChoose._propertyChoose._data = result.rows[0];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								options = options+"<option value='"+i+"'"+(i==0?" selected ":"")+">"+LUI.Util.stringify(rowData)+"</option>";
							}
						}
					}else{
						if(result.rows.length>0){
							LUI.PropertyChoose._propertyChoose._data = result.rows[0];
							for(var i=0;i<result.rows.length;i++){
								var rowData = result.rows[i];
								options = options+"<option value='"+rowData[meta.zhuJianLie]+"'"+(i==0?" selected ":"")+">"+rowData[meta.xianShiLie]+"</option>";
							}
						}
					}
					
					LUI.PropertyChoose._propertyChoose.dialog.find('select#_propertyChooseDataEL option').remove();
					LUI.PropertyChoose._propertyChoose.dialog.find('select#_propertyChooseDataEL').first().append(options);
					
					//创建数据选择的 chosen 
					if(LUI.PropertyChoose._propertyChoose.dataSelector != null){
						LUI.PropertyChoose._propertyChoose.dialog.find('select#_propertyChooseDataEL').first().chosen("destroy");
					}
					LUI.PropertyChoose._propertyChoose.dataSelector = LUI.PropertyChoose._propertyChoose.dialog.find('select#_propertyChooseDataEL').first().chosen({
						search_contains:true,
						disable_search_threshold:-1,
						no_results_text:'无满足条件的记录',
						width:'100%'
					}).change(function(event,selectedOption){
						var index = event.currentTarget.selectedIndex;
						
						LUI.PropertyChoose._propertyChoose._data = gridMapingInstance._result.rows[index];
						
						//选择的数据发生变化时 重新显示所有的值
						LUI.PropertyChoose._propertyChoose.refreshDisplayColumn(LUI.PropertyChoose._propertyChoose._tree.rootNodes);
						
					});
					//显示初始化值
					LUI.PropertyChoose._propertyChoose.refreshDisplayColumn(LUI.PropertyChoose._propertyChoose._tree.rootNodes);
					//覆盖chosen的查询
					if(gridMapingInstance._dataset.component.name != 'sqlDataset' && gridMapingInstance._dataset.component.name != 'sqlRecord'){
						var chosenInstance = LUI.PropertyChoose._propertyChoose.dataSelector.data('chosen');
						chosenInstance.results_search = function(evt) {
							if (chosenInstance.results_showing) {
								var filters = null;
								var searchText = chosenInstance.get_search_text();
							    var escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
							    if(escapedSearchText!=null && escapedSearchText.length >0){
							    	filters = "[{property:'"+meta.xianShiLie+"',operator:'like',value:'"+escapedSearchText+"'}]";
							    }
							    LUI.Mapping._gridMapping._dataset.load({
							    	limit:8,
							    	filters:filters,
							    	fields:"['...']"
							    },function(params,result){
							    	if(!result.success){
										LUI.Message.info("提示","取数据失败!"+result.errorMsg);
									}else{
										
										this._result = result;
										
//										chosenInstance.results_data = [{}];
										var meta = result.meta;
										var options = "";
										//将数据替换到  this.results_data;
										for(var i=0;i<result.rows.length;i++){
											var rowData = result.rows[i];
											options = options+"<option value="+rowData[meta.zhuJianLie]+">"+rowData[meta.xianShiLie]+"</option>";
										}
										$(chosenInstance.form_field).html(options);
										
										var searchText = chosenInstance.get_search_text();
										chosenInstance.results_build();
										chosenInstance.search_field.val(searchText);
										//执行查询
										chosenInstance.winnow_results();
									}
								});
							    
							} else {
								return chosenInstance.results_show();
							}
						}; 
					}
					
					//按输入值查询
//					$('#_propertyChooseSearchEL').change(function(){
//						var searchText = $(this).val().trim();
//						if( searchText == '输入过滤条件...'){
//							searchText = null;
//						}
//						LUI.PropertyChoose._propertyChoose._tree.filter(function(text){
//							if(text==null || text.length == 0){
//								return false;
//							}else if(searchText==null || searchText.length == 0 || text.toUpperCase().indexOf(searchText.toUpperCase()) >=0){
//								return true;
//							}
//							return false;
//						});
//					});
					$('#_propertyChooseSearchEL').keyup(function(){
						var searchText = $(this).val().trim();
						if( searchText == '输入过滤条件...'){
							searchText = null;
						}
						LUI.PropertyChoose._propertyChoose._tree.filter(function(text){
							if(text==null || text.length == 0){
								return false;
							}else if(searchText==null || searchText.length == 0 || text.toUpperCase().indexOf(searchText.toUpperCase()) >=0){
								return true;
							}
							return false;
						});
					});
				},
				addZdsToTree:function(parentNodeId,rows){
					
					var newNode = new Core4j.toolbox.TableTreeNode({
						id:(parentNodeId==null?'':parentNodeId)+'_zd_index',
						order: 1,
						isLeaf:true,
						isOpen:false,
						dataObject:{
							ziDuanDH:'@index',
							ziDuanBT:'行号',
							ziDuanLX:{
								ziDuanLXDH:'int'
							}
						}
					});
					//add one node
					LUI.PropertyChoose._propertyChoose._tree.addNode(newNode,parentNodeId);
					
					for(var i =0;i<rows.length;i++){
						var row = rows[i];
						var isLeaf = row.ziDuanLX.ziDuanLXDH !='object' && row.ziDuanLX.ziDuanLXDH !='set';
						var newNode = new Core4j.toolbox.TableTreeNode({
							id:(parentNodeId==null?'':parentNodeId)+'_zd_'+rows[i].ziDuanDM,
							order: 99 - rows[i].ziDuanLX.ziDuanLXDM,
							isLeaf:isLeaf,
							isOpen:false,
							dataObject:row
						});
						//add one node
						LUI.PropertyChoose._propertyChoose._tree.addNode(newNode,parentNodeId);
					}
				},
				refreshDisplayColumn:function(nodes){
					//rootNodes
					for(var i=0;i<nodes.length;i++){
						var node = nodes[i];
						//
						LUI.PropertyChoose._propertyChoose._tree.refreshNode(node,'value');
						//
						if(node.childs.length > 0){
							this.refreshDisplayColumn(node.childs);
						}
					}
				}
			};
			return LUI.PropertyChoose._propertyChoose;
		},
		_propertyChooseContent:
			'<div style="width: 100%;margin: 0;padding: 0;font-family: Microsoft YaHei;">'+
				'<div style="width: 100%;height:28px;padding-top:1px;">'+
					'<span style="width:400px;margin: 0;padding: 0;float:left;">'+
						'<select id="_propertyChooseDataEL" data-placehoder="选择数据..." >'+
						'</select>'+
					'</span>'+
					'<span class="ui-widget" style="width:275px;margin: 0;padding: 0;float:right;">'+
						'<input style="width:270px;" id="_propertyChooseSearchEL" onfocus="if(this.value==\'输入过滤条件...\'){this.value=\'\';}" onblur="if(this.value==\'\'){this.value=\'输入过滤条件...\';}" value="输入过滤条件..." style="height: 20px;" class="text ui-widget-content ui-corner-all">'+
					'</span>'+
				'</div>'+
				'<div id="_propertyChooseTreeEL" style="width: 100%;height:360px;overflow-y:scroll;margin: 0;padding: 0;">'+
				'</div>'+
			'</div>'
}

