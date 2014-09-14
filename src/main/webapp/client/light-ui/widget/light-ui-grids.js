
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
LUI.Grid = {
	uniqueId:0,
	instances:LUI.Set.createNew(),
	createNew:function(config){
		//检查参数
		if(config.name==null){
			LUI.Message.info("错误","必须为列表提供name参数!");
			return null;
		}
		if(config.renderto==null){
			LUI.Message.info("错误","必须为列表提供renderto参数!");
			return null;
		}
		var datasource = null;
		if(config.datasourceType!=null && config.datasourceType!='none'){
			if(config.datasourceName==null){
				LUI.Message.info("错误","必须为列表"+name+"提供datasourceName参数!");
				return null;
			}
			datasource = LUI.Datasource.getInstance(config.datasourceName);
			if(datasource == null){
				LUI.Message.info("错误","未找到列表"+name+"的数据源"+config.datasourceName+"!");
				return null;
			}
		}
		
		
		//记录第一行内容 作为迭代的模板
		var gridLine = $(config.renderto+' li').eq(config.headerLines);
		var gridLineContent = $("<p>").append(gridLine.clone()).html();
		
		//参数的默认值
		var gridConfig = $.extend({
			id:'_grid_'+ (++LUI.Grid.uniqueId),
			headerLines:0,
			footerLines:0,
			columns:[],
			gridLineContent:gridLineContent,
			pagiTarget:null,
			autoLoad:true,
			initialed:false,
			datasource:datasource,
			events:{
				gridRendered:'grid_render',
				rowRendered:'row_render',
				pagiRendered:'pagi_render'
			},
			/**
			 * 通知grid  根据绑定的数据 
			 * 重新显示列表内容 显示grid 分页工具栏
			 */
			render:function(){
				
				//预编译行模板
				var data={
					totalCount:0,//用于分页显示
					start:0,//用于分页显示
					limit:0,//用于分页显示
					rows:[]
				};
				if(this.datasource!=null ){
					var dsData = this.datasource.getResult();
					if(dsData!=null){
						data.totalCount = dsData.totalCount;
						data.start = dsData.start;
						data.limit = dsData.limit;
						for(var i=0;i<this.datasource.size();i++){
							var record = this.datasource.getRecord(i);
							data.rows[i] = record.getData();
							data.rows[i]._record_id = record.id;
						}
					}
					
					//生成表格内容
					this.doRender(data);
					
					//需要分页的话 重新 显示分页工具栏
					if(this.pagiTarget!=null){
						var currentPage = data.limit>0?Math.floor(data.start/data.limit):0;
						
						$(this.pagiTarget).pagination(data.totalCount, {
							items_per_page:data.limit,
							num_display_entries:5,
							num_edge_entries:2,
							prev_text:'前一页',
							next_text:'后一页',
							gridInstance:this,
							current_page:currentPage,
							callback:function(page_index, jq){
								if(gridInstance.datasource!=null){
									gridInstance.datasource.page(page_index);
								}
								return false;
							}
						});
						this.fireEvent(this.events.pagiRendered,{
							grid:this,
							pagiEl:this.pagiTarget,
							start:data.start,
							limit:data.limit,
							pageIndex:currentPage
						});
					}
				}
				//
				this.initialed = true;
				
				this.fireEvent(this.events.gridRendered,{
					grid:this,
					data:data
				});
			},
			doRender:function(data){
				//删除除header和footer以外的行 
				if(this.footerLines>0){
					$(this.renderto+' li').slice(this.headerLines, -this.footerLines).remove();
				}else{
					$(this.renderto+' li').slice(this.headerLines).remove();
				}
				//重新显示列表

				if(data.rows!=null && data.rows.length >0){
					var newLineEl = null;
					for(var i=0;i<data.rows.length;i++){
						var rowData = data.rows[i];
						//在表格中增加一行
						if(newLineEl == null){
							if(this.headerLines>0){
								newLineEl = $(this.gridLineContent).insertAfter($(this.renderto+' li').eq(this.headerLines -1));
							}else{
								newLineEl = $(this.gridLineContent).appendTo($(this.renderto));
							}
						}else{
							newLineEl = $(this.gridLineContent).insertAfter(newLineEl);
						}
						newLineEl.attr('_row_index',i);
						newLineEl.attr('_record_id',rowData._record_id);
						//编译动态内容
						for(var j=0;j<this.columns.length;j++){
							//单元格内容
							var cellEl = newLineEl.find(this.columns[j].renderto);
							cellEl.attr('_col_index',j);
							cellEl.attr('_col_name',this.columns[j].name);
							if(this.columns[j].name.indexOf('@index') >=0){
								cellEl.html(data.start + i +1);
							}else{
								var _compiledValue = this._compiledCellTemplates[j](rowData);
								if(_compiledValue!=null && _compiledValue.length > 0){
									//如果使用千分符
									if(this.columns[j].showThousand == 'true'){
										_compiledValue = LUI.Util.thousandth(_compiledValue);
									}
									cellEl.html(_compiledValue);
								}else{
									cellEl.html('&nbsp;');
								}
							}
							
							//单元格提示信息
							if(this.columns[j].showTips == 'true'){
								cellEl.attr('title',this._compiledTipTemplates[j](rowData));
							}else{
								cellEl.attr('title','');
							}
						}
						//
						this.fireEvent(this.events.rowRendered,{
							grid:this,
							rowIndex:i,
							rowEl:newLineEl,
							rowData:rowData
						});
					}
				}
			},
			//彻底销毁grid
			destroy:function(){
				this.removeAllListener();
				LUI.Grid.instances.remove(this);
			}
		},config);
		//创建grid对象
		var gridInstance = $.extend(LUI.Widget.createNew(),gridConfig);
		//记录原模板行信息
		if(gridInstance.renderto!=null){
			gridInstance._originalContent = $(gridInstance.renderto).html();
		}
		//事件监听
		if(gridInstance.listenerDefs!=null){
			if(gridInstance.listenerDefs.onGridRendered!=null){
				var onGridRenderFunc = window[gridInstance.listenerDefs.onGridRendered];
				if(onGridRenderFunc==null){
					LUI.Message.warn('查询失败','事件onGridRendered的处理函数('+gridInstance.listenerDefs.onGridRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.gridRendered,LUI.Observable.createNew(),onGridRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onRowRendered!=null){
				var onRowRenderFunc = window[gridInstance.listenerDefs.onRowRendered];
				if(onRowRenderFunc==null){
					LUI.Message.warn('查询失败','事件onRowRendered的处理函数('+gridInstance.listenerDefs.onRowRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.rowRendered,LUI.Observable.createNew(),onRowRenderFunc);
				}
			}
			
			if(gridInstance.listenerDefs.onPagiRendered!=null){
				var onPagiRenderFunc = window[gridInstance.listenerDefs.onPagiRendered];
				if(onPagiRenderFunc==null){
					LUI.Message.warn('查询失败','事件onPagiRendered的处理函数('+gridInstance.listenerDefs.onPagiRendered+')不存在！');
				}else{
					gridInstance.addListener(gridInstance.events.pagiRendered,LUI.Observable.createNew(),onPagiRenderFunc);
				}
			}
		}
		//预编译
		gridInstance._compiledCellTemplates = [];
		gridInstance._compiledTipTemplates = [];
		
		for(var j=0;j<gridInstance.columns.length;j++){
			gridInstance._compiledCellTemplates[j] = Handlebars.compile(gridInstance.columns[j].renderTemplate);
			if( gridInstance.columns[j].tipsTemplate == null || 
				gridInstance.columns[j].tipsTemplate.length ==0 || 
				gridInstance.columns[j].tipsTemplate == gridInstance.columns[j].renderTemplate){
				gridInstance._compiledTipTemplates[j] = gridInstance._compiledCellTemplates[j];
			}else if(gridInstance.columns[j].showTips == 'true'){
				gridInstance._compiledTipTemplates[j] = Handlebars.compile(gridInstance.columns[j].tipsTemplate);
			}
		}
		if(gridInstance.autoLoad == true && gridInstance.datasource!=null){
			//监听数据源的load事件 重新显示
			gridInstance.datasource.addListener(gridInstance.datasource.events.load,gridInstance,function(source,target,event){
				target.render();
			});
		}
		
		//登记此grid
		LUI.Grid.instances.put(gridInstance);
		return gridInstance;
	},
	getInstance:function(gridName){
		var gridInstance = null;
		for(var i =0;i<LUI.Grid.instances.size();i++){
			var _instance = LUI.Grid.instances.get(i);
			if(_instance.name == gridName){
				gridInstance = _instance;
				break;
			}
		}
		return gridInstance;
	},
	removeInstance:function(gridName){
		for(var i =0;i<LUI.Grid.instances.size();i++){
			var _instance = LUI.Grid.instances.get(i);
			if(_instance.name == gridName){
				LUI.Form.instances.remove(_instance);
				break;
			}
		}
	}
};

