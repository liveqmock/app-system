	

LUI.Form = {
		uniqueId:0,
		instances:LUI.Set.createNew(),
		createNew:function(formCfg,noDatasource){
			//检查参数
			if(formCfg.name==null){
				LUI.Message.error('创建表单失败','必须提供name参数！');
				return null;
			}
			
			if(LUI.Form.instances.contains(formCfg.name)){
				LUI.Message.error('创建表单失败','不允许重复绑定('+formCfg.name+')！');
				return null;
			}
			
			var fieldsCfg = formCfg.fields||[];
			delete formCfg.fields;
			
			var buttonsCfg = formCfg.buttons||[];
			delete formCfg.buttons;
			
			if(formCfg.renderto == null){
				formCfg.renderto = "#"+formCfg.name;
			}
			
			var datasource = null;
			if(!noDatasource){
				if(formCfg.datasourceName==null){
					LUI.Message.error('创建表单失败',"表单"+formCfg.name+"未提供datasourceName参数,不能自动加载！");
					return null;
				}else{
					datasource = LUI.Datasource.getInstance(formCfg.datasourceName);
					if(datasource == null){
						LUI.Message.info("创建表单失败","表单"+formCfg.name+"指定的数据源"+formCfg.datasourceName+"不存在!");
						return null;
					}
				}
			}
			
			//记录第一行内容 作为迭代的模板
			var formTargetEl = $(formCfg.renderto);
			var formTargetElContent = $("<p>").append(formTargetEl.clone()).html();
			
			//预处理(参数)
			var cFormCfg = $.extend({
				id:'_form_'+ (++LUI.Form.uniqueId),
				name:null,
				autoRender:false,
				fields:[],
				datasource:datasource,
				xiTongDH:null,
				gongNengDH:null,
				caoZuoDH:null,
				renderType:'append',
				formTargetElContent:formTargetElContent,
				addField:function(lui_field){
					for(var i=0;i<this.fields.length;i++){
						var eField = this.fields[i];
						if(eField.name ==lui_field.name ){
							LUI.Message.info("错误","表单'"+this.formName+"'中已存在名称为'"+lui_field.name+"'的字段!");
							return;
						}
					}
					this.fields[this.fields.length] = lui_field;
				},
				buttons:[],
				addButton:function(lui_button){
					for(var i=0;i<this.buttons.length;i++){
						var button = this.buttons[i];
						if(button.name ==lui_button.name ){
							LUI.Message.info("错误","表单'"+this.formName+"'中已存在名称为'"+lui_button.name+"'的按钮!");
							return;
						}
					}
					this.buttons[this.buttons.length] = lui_button;
				},
				getAllFields:function(){
					return this.fields;
				},
				hasField:function(name){
					var hasField = false;
					for(var i=0;i<this.fields.length;i++){
						if(this.fields[i].name == name){
							hasField = true;
							break;
						}
					}
					return hasField;
				},
				getField:function(name){
					var field = null;
					for(var i=0;i<this.fields.length;i++){
						if(this.fields[i].name == name){
							field = this.fields[i];
							break;
						}
					}
					if(field == null){
						LUI.Message.info("取字段失败","字段'"+name+"'不存在!");
					}
					return field;
				},
				setFieldValue:function(name,value){
					var field = this.getField(name);
					if(field == null){
						LUI.Message.info("设置字段值失败","字段'"+name+"'不存在!");
					}else{
						field.setValue(value);
					}
				},
				getFieldValue:function(name){
					var field = this.getField(name);
					if(field == null){
						LUI.Message.info("取字段值失败","字段'"+name+"'不存在!");
						return null;
					}

					return field.getValue();
				},
				//从数据源中 加最新数据
				loaded:false,
				record:null,
				load:function(){
					
					if(!this.datasource.loaded){
						LUI.Message.info("加载数据失败","请监听数据源的onload事件，为表单加载数据!");
						return;
					}else if(this.datasource.size()==0){
						LUI.Message.info("加载数据失败","数据源的记录数为0!");
						return;
					}
					
					//如果表单已经rendered 将数据显示到页面元素中
					this.loaded = true;
					if(this.binded == true){
						this.deBindRecord();
					}
					this.record = this.datasource.getRecord(0);
					this.bindRecord();
					
				},
				//加载数据记录 并通过对双方的监听 建立关联
				binded:false,
				bindRecord:function(record){
					if(record!=null){
						this.record = record;
					}
					//从数据源中 取得第一条数据记录
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						
						var v = this.record.getFieldValue(field.name);
						if(v!=null && (field.fieldType =='object' || field.fieldType =='set' ) ){
							v = v.getData();
						}
						//初始化值的时候
						field.setValue(v,true,true,this.record);
						//record监听field的变化 修改自身的值
						field.addListener(field.events.change,this.record,function(sField,tRecord,event,eventOrigin){
							tRecord.setFieldValue(sField.name,event.params.newValue,false,false,eventOrigin||sField);
						});
						//field监听record的变化 修改field的值
						this.record.addListener(this.record.events.change,field,function(sRecord,tField,event,eventOrigin){
							if(event.params.fieldName == tField.name){
								tField.setValue(sRecord.getFieldValue(tField.name),true,false,eventOrigin||sRecord);
							}
						});
					}
					//初始化数据后 为字段触发一次change事件（因为关联的字段 是否隐藏等 都是在onchange事件中处理的）
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						field.fireEvent(field.events.change,{
							oldValue:null,
							newValue:field.getValue(),
							isInitial:true
						},this.record);
					}
					this.binded = true;
				},
				deBindRecord:function(){
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						//取消监听field的变化
						field.removeListener(field.events.change,this.record);
						//取消监听record的变化
						this.record.removeListener(this.record.events.change,field);
					}
					this.binded = false;
					this.record = null;
				},
				//加载自定义数据 相当于批量修改表单/记录中的数据
				loadData:function(data){
					//修改field中的值,通过监听修改关联的record
					for(var p in data){
						var field = this.getField(p);
						field.setValue(data[p],false,false,field);
					}
				},
				isValid:function(){
					//所有field都valid form就valid
					for(var j=0;j<this.fields.length;j++){
						if(!this.fields[j].isValid && !this.fields[j].hidden && this.fields[j].enabled){
							return false;
						}
					}
					return true;
				},
				rendered:false,
				//生成或绑定页面元素
				el:null,
				formEl:null,
				oldEl:null,
				render:function(forceFieldRender){
					if(!this.rendered){
						//根据构建类型 确定如何render
						if(this.renderType == 'append' ){
							//创建新的标题、form 放置到目标元素内部 
							this.el = $(LUI.Template.Form);
							this.formEl = this.el.find('.nim-form-el');
							this.el.appendTo($(this.renderto).first());
						}else if(this.renderType == 'insert' ){
							//创建新的form 放置到原有元素内部 
							this.el = $(LUI.Template.Form).find('.nim-form-el');
							this.formEl = this.el;
							this.el.appendTo($(this.renderto).first());
						}else if(this.renderType == 'replace'){
							//替换原有form
							this.oldEl = $(this.renderto).first();
							//在原有form元素后 插入新的 form元素
							this.el = $(LUI.Template.Form).find('.nim-form-el');
							this.formEl = this.el;
							this.oldEl.after(this.el);
							//删除原有form元素
							this.oldEl.remove();
						}else if(this.renderType == 'rela'){
							//关联原有form容器
//							this.el = oldEl;
//							this.formEl = this.el;
							this.el = $(this.renderto).first();
							this.formEl = this.el;
						}
						
						//通知未构建button按照预定义规则render 
						for(var i=0;i<this.buttons.length;i++){
							var button = this.buttons[i];
							if(!button.rendered ){
								button.render();
							}
						}
					}
					//通知未构建field按照预定义规则 render
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						if(!field.rendered || forceFieldRender ){
							field.render();
						}
					}
					//生成后 如果需要自动加载且已加载完成 绑定加载的数据
					if(this.loaded == true && this.autoLoad == true && this.binded == false){
						this.bindRecord();
					}
					//
					this.rendered = true;
				},
				//撤销对页面元素的改变
				deRender:function(forceDeRender){
					//根据构建类型 确定如何deRender
					if(this.renderType == 'append' ){
						this.el.remove;
					}else if(this.renderType == 'insert' ){
						this.el.remove;
					}else if(this.renderType == 'replace'){
						//将保存的原有元素信息 放回原处
						this.el.after(this.oldEl);
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'rela'){
						
					}
					
					//通知未构建field按照预定义规则 render
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						if(field.rendered || forceDeRender ){
							field.deRender();
						}
					}
					//通知未构建button按照预定义规则render 
					for(var i=0;i<this.buttons.length;i++){
						var button = this.buttons[i];
						if(button.rendered || forceDeRender ){
							button.deRender();
						}
					}
					//
					this.rendered = false;
				},
				//彻底销毁form
				destroy:function(){
					if(this.rendered){
						this.deRender(true);
					}
					//取消与record的绑定
					this.deBindRecord();
					
					//通知未构建field按照预定义规则 render
					for(var i=0;i<this.fields.length;i++){
						var field = this.fields[i];
						field.destroy();
					}
					//通知未构建button按照预定义规则render 
					for(var i=0;i<this.buttons.length;i++){
						var button = this.buttons[i];
						button.destroy();
					}
					
					this.fields = [];
					this.buttons = [];
					this.datasource = null;
					
					this.removeAllListener();
					LUI.Form.instances.remove(this);
				}
			},formCfg);
			//创建form对象
			var lui_form = $.extend(LUI.Widget.createNew(),cFormCfg);
			LUI.Form.instances.put(lui_form);
			//为form添加字段信息
			for(var i=0;i<fieldsCfg.length;i++){
				var fieldFactory = LUI.FieldFactoryManager.getFieldFactory(fieldsCfg[i].type || fieldsCfg[i].fieldType,fieldsCfg[i].widget || fieldsCfg[i].component);
				
				if(fieldsCfg[i].renderto == null){
					fieldsCfg[i].renderto = '#'+fieldsCfg[i].name;
				}
				var field = fieldFactory.createNew(fieldsCfg[i],lui_form);
				lui_form.addField(field);
			}
			//为form添加按钮信息
			for(var i=0;i<buttonsCfg.length;i++){
				var buttonObj = LUI.Form.Button.createNew(buttonsCfg[i],lui_form);
				lui_form.addButton(buttonObj);
			}
			//是否生成并关联字段 按钮
			if(lui_form.autoRender){
				lui_form.render();
			}
			//是否自动取得数据 并将数据显示到字段中
			if(lui_form.autoLoad){
				
				lui_form.datasource.addListener(lui_form.datasource.events.load,lui_form,function(e_datasource,e_form,event,eventOrigin){
					if(e_datasource.size()>0){
						e_form.load();
					}
				});
			}
			
			return lui_form;
		},
		getInstance:function(formName){
			var formInstance = null;
			for(var i =0;i<LUI.Form.instances.size();i++){
				var _instance = LUI.Form.instances.get(i);
				if(_instance.name == formName){
					formInstance = _instance;
					break;
				}
			}
			return formInstance;
		},
		removeInstance:function(formName){
			for(var i =0;i<LUI.Form.instances.size();i++){
				var _instance = LUI.Form.instances.get(i);
				if(_instance.name == formName){
					LUI.Form.instances.remove(_instance);
					break;
				}
			}
			
		}
	};


	LUI.Form.Button = {
		uniqueId:0,
		createNew:function(btnCfg,lui_form){
			//检查参数
			if(btnCfg.name==null){
				LUI.Message.error('创建表单按钮失败','必须提供name参数！');
				return null;
			}
			if(btnCfg.renderto==null){
				LUI.Message.error('创建表单按钮失败','必须提供renderto参数！');
				return null;
			}
			
			var btnType = btnCfg.type;
			if(btnType==null){
				if(btnCfg.component == 'submitButton'){
					btnType = 'submit';
				}else if(btnCfg.component == 'resetButton'){
					btnType = 'reset';
				}else{
					btnType = 'custom';
				}
			}
			if(btnType == 'custom'){
				if(btnCfg.onClick == null){
					LUI.Message.error('创建表单自定义按钮失败','必须提供onClick参数！');
					return null;
				}
				
				var onClickFunc = window[btnCfg.onClick];
				if(onClickFunc==null){
					LUI.Message.error('创建表单自定义按钮失败','名称为('+btnCfg.onClick+')的onClick方法不存在！');
					return null;
				}
				btnCfg.onClickFunc = onClickFunc;
			}
			
			
			//预处理(参数)
			var cBtnCfg = $.extend({
				id:'_form_btn_'+ (++LUI.Form.Button.uniqueId),
				form:lui_form,
				renderto:null,
				renderType:'none',
				type:btnType,
				onClickFunc:null,
				submit:function(){
					if(this.form.isValid()){
						var xiTongDH = null;
						if(this.form.xiTongDH!=null){
							xiTongDH = this.form.xiTongDH;
						}
						var gongNengDH = null;
						if(this.form.gongNengDH!=null){
							gongNengDH = this.form.gongNengDH;
						}
						var caoZuoDH = null;
						if(this.form.caoZuoDH!=null){
							caoZuoDH = this.form.caoZuoDH;
						}
						
						this.form.datasource.save(xiTongDH,gongNengDH,caoZuoDH,true);
					}else{
						LUI.Message.error('提示','表单中有未检查通过的字段，请修改后重试！');
						return ;
					}
				},
				reset:function(){
					this.form.reset();
					this.form.datasource.reset();
				},
				//生成或绑定页面元素
				el:null,
				oldEl:null,
				rendered:false,
				render:function(forceRender){
					if(this.renderType != 'none' ){
						//根据构建类型 确定如何render此按钮
						if(this.renderType == 'append' || this.renderType == 'insert' ){
//							//创建新的按钮元素 放置到form元素内部 
//							this.el = $(LUI.Template.FormButton);
//							this.el.appendTo(this.form.formEl);
//						}else if(this.renderType == 'insert' ){
							//创建新的按钮元素 放置到原有元素内部 
							this.el = $(LUI.Template.FormButton);
							this.el.appendTo($(lui_form.renderto + " " +this.renderto).first());
						}else if(this.renderType == 'replace'){
							//替换
							this.oldEl = $(lui_form.renderto + " " +this.renderto).first();
							//在原有元素后 插入新的按钮元素
							this.el = $(LUI.Template.FormButton);
							this.oldEl.after(this.el);
							//删除原有按钮元素
							this.oldEl.remove();
						}else if(this.renderType == 'rela'){
							this.el = $(this.form.renderto +' ' +this.renderto).first();
						}
						
						//与页面元素建立关联
						var _this = this;
						if(this.type == 'submit'){
							this.el.click(function(){
								_this.submit();
							});
						}else if(this.type == 'reset'){
							this.el.click(function(){
								_this.reset();
							});
//							this.el.bind('click',this.reset);
						}else{
							this.el.click(function(){
								_this.onClickFunc();
							});
//							this.el.bind('click',this.onClickFunc);
						}
						this.rendered = true;
					}
				},
				//撤销对页面元素的改变
				deRender:function(forceDeRender){
					//根据构建类型 确定如何derender此按钮
					if(this.renderType == 'append'){
						//删除新的按钮元素
						this.el.remove();
					}else if(this.renderType == 'insert'){
						//删除新的按钮元素
						this.el.remove();
					}else if(this.renderType == 'replace'){
						//将保存的原有元素信息 放回原处
						this.el.after(this.oldEl);
						//删除新的按钮元素
						this.el.remove();
					}else if(this.renderType == 'rela'){
						
					}
					
					//与页面元素取消关联
					if(this.type == 'submit'){
						this.el.unbind('click',this.submit);
					}else if(this.type == 'reset'){
						this.el.unbind('click',this.reset);
					}else{
						this.el.unbind('click',this.onClickFunc);
					}
					this.el = null;
					this.rendered = false;
				},
				//彻底销毁buttom
				destroy:function(){
					if(this.rendered){
						this.deRender(true);
					}
					this.removeAllListener();
					
					$(this.renderto).children().remove();
				}
			},btnCfg);
			//创建form对象
			var lui_btn = $.extend(LUI.Widget.createNew(),cBtnCfg);
			return lui_btn;
		}
	};

//	'<span style="display:inline-block;width:100%;" id="field_container_'+fieldMeta.name+'">'+
//		'<table width="100%" style="table-layout:fixed;">'+
//		'<tr>'+
//			'<td width="90px">'+
//				'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="'+fieldMeta.name+'">'+fieldMeta.label+'</label>'+
//			'</td>'+
//			'<td width="*">'+
//			'<input type="text" '+(field.enabled?'':'disabled')+' name="'+fieldMeta.name+'" id="'+fieldMeta.name+'" style="height: 20px;" class="text ui-widget-content ui-corner-all '+(field.enabled?'':'field-disabled')+'" >'+
//			'</td>'+
//	        '</tr>'+
//	    '</table>'+
//	'</span>'
	
	LUI.Template = {
		Form:'<div><span class="nim-form-title"></span><form class="form nim-form-el"></form></div>',
		FormButton:'<span class="nim-button" style="width:100px;">按钮</span>',
		Field:{
			field:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*">'+
							'<input type="text" id="{{name}}" {{#unless enabled}}disabled{{/unless}} id="" style="width:{{#if width}}{{width}}{{else}}100%{{/if}};" class="nim-field-wrapper field text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			checkbox:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label class="nim-field-label" style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*">'+
						'<input type="checkbox" id="{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:14px;" class="nim-field-wrapper text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			select:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<select id="{{name}}" {{#unless enabled}}disabled{{/unless}} data-placeholder="请选择..." style="width:{{#if width}}{{width}}{{else}}100%{{/if}};" class="nim-field-wrapper nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
							'</select>'+
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
			chooseEl:
				'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
					'<table width="100%" style="table-layout:fixed;">'+
					'<tr>'+
						'<td width="90px">'+
							'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
						'</td>'+
						'<td width="*" style="font-size: 1em important!;">'+
							'<span id="{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:{{#if width}}{{width}}{{else}}100%{{/if}};">'+
								'<input type="text" id="{{name}}" {{#unless enabled}}disabled{{/unless}} style="" class=" text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >'+
								'<img id="_handler" src="resources/nim/light-ui/images/indicator.png" style="margin-left: 4px;vertical-align: middle;">'+
							'</span>'+
						'</td>'+
				        '</tr>'+
				    '</table>'+
				'</span>',
				fileUpload:
					'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
						'<table width="100%" style="table-layout:fixed;">'+
						'<tr>'+
							'<td width="90px">'+
								'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
							'</td>'+
							'<td width="*" style="font-size: 1em important!;">'+
								'<span id="{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width: {{#if width}}{{width}}{{else}}100%{{/if}};" >'+
									'<input type="text" id="{{name}}" disabled style="" class="text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}" >'+
									'<img id="_handler" src="resources/nim/light-ui/images/file-upload-icon.gif" style="margin-left: 4px;vertical-align: middle;">'+
								'</span>'+
							'</td>'+
					        '</tr>'+
					    '</table>'+
					'</span>',
				textarea:
					'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
						'<table width="100%" style="table-layout:fixed;">'+
						'<tr>'+
							'<td width="90px">'+
								'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
							'</td>'+
							'<td width="*" style="font-size: 1em important!;">'+
								'<span id="{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width: {{#if width}}{{width}}{{else}}100%{{/if}};">'+
									'<textarea id="{{name}}" {{#unless enabled}}disabled{{/unless}} style="height:{{height}};" class="nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
									'</textarea>'+
									'<img title="编辑" id="_handler" src="resources/nim/light-ui/images/icon-text.jpg" style="position: relative;margin-left: 4px;cursor:hand;cursor:pointer;">'+
								'</span>'+
							'</td>'+
					    '</tr>'+
					    '</table>'+
					'</span>',
					htmlArea:
					'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
						'<table width="100%" style="table-layout:fixed;">'+
						'<tr>'+
							'<td width="90px">'+
								'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
							'</td>'+
							'<td width="*" style="font-size: 1em important!;">'+
								'<span id="{{name}}_field_container" class="nim-field-wrapper" style="width:{{#if width}}{{width}}{{else}}100%{{/if}};">'+
									'<textarea id="{{name}}" {{#unless enabled}}disabled{{/unless}} style="width:{{#if width}}{{width}}{{else}}100%{{/if}};height:{{height}};" class="nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
									'</textarea>'+
									'<img title="编辑" id="_handler" src="resources/nim/light-ui/images/icon-text.jpg" style="position: absolute;margin-left: 4px;cursor:hand;cursor:pointer;">'+
								'</span>'+
							'</td>'+
					    '</tr>'+
					    '</table>'+
					'</span>',
				datepicker:
					'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
						'<table width="100%" style="table-layout:fixed;">'+
						'<tr>'+
							'<td width="90px">'+
								'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
							'</td>'+
							'<td width="*" style="font-size: 1em important!;">'+
								'<span id="{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width: {{#if width}}{{width}}{{else}}100%{{/if}};">'+
									'<input type="text" id="{{id}}{{name}}" {{#unless enabled}}disabled{{/unless}} style="" class="text ui-widget-content ui-corner-all nim-field-el {{#unless enabled}}nim-field-disabled{{/unless}} {{#unless isValid}}nim-field-invalid{{/unless}}">'+
									'<img title="显示日历" id="_handler" src="resources/nim/light-ui/images/date-pic.png" style="margin-left: 4px;vertical-align: middle;cursor:hand;cursor:pointer;">'+
								'</span>'+
							'</td>'+
					    '</tr>'+
					    '</table>'+
					'</span>',
				eventScript:
					'<span style="display:{{#if hidden}}none{{else}}inline-block{{/if}};width:100%;" class="nim-field-container">'+
						'<table width="100%" style="table-layout:fixed;">'+
						'<tr>'+
							'<td width="90px">'+
								'<label style="width:90px;word-wrap:break-word;word-break:break-all;overflow:hidden;" for="{{name}}">{{label}}</label>'+
							'</td>'+
							'<td width="*" style="font-size: 1em important!;">'+
								'<span id="{{name}}_field_container" class="nim-field-wrapper" style="display:inline-block;width:  {{#if width}}{{width}}{{else}}100%{{/if}};">'+
									'<textarea id="{{name}}" {{#unless enabled}}disabled{{/unless}} style="height:{{height}};" class="nim-field-el {{#unless isValid}}nim-field-invalid{{/unless}}">'+
									'</textarea>'+
									'<img title="编辑" id="_handler" src="resources/nim/light-ui/images/icon-text.jpg" style="position: relative;margin-left: 4px;cursor:hand;cursor:pointer;">'+
								'</span>'+
							'</td>'+
					    '</tr>'+
					    '</table>'+
					'</span>'
		}
		
	};

	///////////////////////////////////////////////////////////////////
	LUI.SearchDatasourceForm = {
			uniqueId:0,
			instances:LUI.Set.createNew(),
			createNew:function(config){
				//检查参数
				if(config.filters==null){
					LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供filters参数!");
					return null;
				}
				
				if(config.datasourceName==null){
					LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供datasourceName参数!");
					return null;
				}
				var dataset = LUI.Datasource.getInstance(config.datasourceName);
				if(dataset == null){
					LUI.Message.info("错误","未找到查询表单"+name+"的数据源"+config.datasourceName+"!");
					return null;
				}
				//将filter转换为field (searchFieldFilter类型的 字段查询条件)
				var fields = [];
				if(config.filters !=null){
					for(var i=0;i<config.filters.length;i++){
						if(config.filters[i].component == 'searchFieldFilter'){
							fields[fields.length] = {
								name:config.filters[i].name,
								label:config.filters[i].label,
								fieldType:config.filters[i].fieldType,
								renderType:config.filters[i].renderType,
								renderto:config.filters[i].renderto
							}
						}
					}
					config.fields = fields;
				}
				
				//
				var formInstance = $.extend(LUI.Form.createNew(config),{
					id:'_searchDatasourceForm_'+ (++LUI.SearchDatasourceForm.uniqueId),
					dataset:dataset,
					filters:config.filters||[],
					removeAllFilters:function(){
						this.filters = [];
					},
					removeFilter:function(fieldName){
						for(var i=0;i<this.filters.length;i++){
							if(this.filters[i].name == fieldName){
								this.filters.splice(i,1);
								break;
							}
						}
					},
					addFilter:function(fieldName,operator,value,assist){
						this.filters[this.filters.length] = {
							name:fieldName,
							operator:operator||'eq',
							value:value,
							assist:assist
						}
					},
//					setValue:function(fieldName,value){
//						var fieldExists = false;
//						for(var i=0;i<this.filters.length;i++){
//							if(this.filters[i].name == fieldName){
//								this.filters[i].value = value;
//								fieldExists = true;
//								break;
//							}
//						}
//						if(!fieldExists){
//							LUI.Message.warn('设置查询参数失败','字段('+fieldName+')不存在！');
//						}
//					},
					submit:function(){
						if(this.events!=null ){
							var beforeSearchFunction = null;
							var beforeSearchFunctionName = this.listenerDefs.beforeSearch;
							if(beforeSearchFunctionName!=null){
								beforeSearchFunction = window[beforeSearchFunctionName];
								
								if(beforeSearchFunction==null){
									LUI.Message.warn('查询失败','事件beforeSearch的处理函数('+beforeSearchFunctionName+')不存在！');
									return ;
								}
								
								var callRet = beforeSearchFunction.call(this);
								if(!callRet){
									return;
								}
							}
						}
						var cfilters = [];
						for(var i=0;i<this.filters.length;i++){
							if(this.filters[i].value != null && this.filters[i].value != ''){
								cfilters[cfilters.length] = {
									property:this.filters[i].name,
									operator:this.filters[i].operator||'eq',
									value:this.filters[i].value,
									assist:this.filters[i].assist||''
								};
							}
						}
						dataset.load({filters:cfilters});
					}
				});
				//监听field的变化
				for(var i=0;i<formInstance.fields.length;i++){
					var field = formInstance.fields[i];
					
					field.addListener(field.events.change,formInstance,function(source,target,event){
						//监听field的变化 将新值保存到filter的value中
						for(var i=0;i<formInstance.filters.length;i++){
							if(formInstance.filters[i].name == source.name ){
								formInstance.filters[i].value = source.getValue();
								break;
							}
						}
					});
				}
				//为buttons添加点击事件
				if(config.renderto!=null){
					for(var i=0;i<formInstance.buttons.length;i++){
						var button = formInstance.buttons[i];
						if(button.renderto !=null){
							if(button.type =='submit'){
								//提交
								$(config.renderto+' '+button.renderto).click(function(){
									formInstance.submit();
								});
							}else{
								//重置
								$(config.renderto+' '+button.renderto).click(function(){
									formInstance.filters = formInstance.config.filters;
								});
							}
						}
					}
				}
				
				//登记此form
				LUI.SearchDatasourceForm.instances.put(formInstance);
				return formInstance;
			},
			getInstance:function(formName){
				var formInstance = null;
				for(var i =0;i<LUI.SearchDatasourceForm.instances.size();i++){
					var _instance = LUI.SearchDatasourceForm.instances.get(i);
					if(_instance.name == formName){
						formInstance = _instance;
						break;
					}
				}
				return formInstance;
			}
		};

		LUI.SearchPageForm = {
				uniqueId:0,
				instances:LUI.Set.createNew(),
				createNew:function(config){
					//检查参数
					if(config.filters==null){
						LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供filters参数!");
						return null;
					}
					
					//检查参数
					if(config.target==null){
						LUI.Message.info("错误","必须为查询表单"+config.label+":"+config.name+"提供target参数!");
						return null;
					}
					
					var fields = [];
					if(config.filters !=null){
						for(var i=0;i<config.filters.length;i++){
							if(config.filters[i].component == 'searchFieldFilter'){
								fields[fields.length] = {
									name:config.filters[i].name,
									label:config.filters[i].label,
									fieldType:config.filters[i].fieldType,
									renderType:config.filters[i].renderType,
									renderto:config.filters[i].renderto
								}
							}
						}
						config.fields = fields;
					}
					
					//
					var formInstance = $.extend(LUI.Form.createNew(config,true),{
						id:'_searchPageForm_'+ (++LUI.SearchPageForm.uniqueId),
						filters:config.filters||[],
						removeAllFilters:function(){
							this.filters = [];
						},
						removeFilter:function(fieldName){
							for(var i=0;i<this.filters.length;i++){
								if(this.filters[i].name == fieldName){
									this.filters.splice(i,1);
									break;
								}
							}
						},
						addFilter:function(fieldName,operator,value,assist){
							this.filters[this.filters.length] = {
								name:fieldName,
								operator:operator||'eq',
								value:value,
								assist:assist
							}
						},
						setValue:function(fieldName,value){
							var fieldExists = false;
							for(var i=0;i<this.filters.length;i++){
								if(this.filters[i].name == fieldName){
									this.filters[i].value = value;
									fieldExists = true;
									break;
								}
							}
							if(!fieldExists){
								LUI.Message.warn('设置查询参数失败','字段('+fieldName+')不存在！');
							}
						},
						submit:function(){
							if(this.events!=null ){
								var beforeSearchFunction = null;
								var beforeSearchFunctionName = this.listenerDefs.beforeSearch;
								if(beforeSearchFunctionName!=null){
									beforeSearchFunction = window[beforeSearchFunctionName];
									
									if(beforeSearchFunction==null){
										LUI.Message.warn('查询失败','事件beforeSearch的处理函数('+beforeSearchFunctionName+')不存在！');
										return ;
									}
									
									var callRet = beforeSearchFunction.call(this);
									if(!callRet){
										return;
									}
								}
							}
							var cfilters = [];
							for(var i=0;i<this.filters.length;i++){
								if(this.filters[i].value != null && this.filters[i].value != ''){
									var cfilter = {
										property:this.filters[i].name,
										operator:this.filters[i].operator||'eq',
										value:this.filters[i].value
									};
									if(this.filters[i].assist!=null && this.filters[i].assist.length >0){
										cfilter.assist = this.filters[i].assist;
									}
									cfilters[cfilters.length] = cfilter;
								}
							}
							//拼在url里 打开新页面 
							var pageUrl = this.target + "&_ps_={params:"+ $.toJSON(cfilters)+"}";
							window.open(pageUrl);
						}
					});
					
					//监听field的变化
					for(var i=0;i<formInstance.fields.length;i++){
						var field = formInstance.fields[i];
						
						field.addListener(field.events.change,formInstance,function(source,target,event){
							//监听field的变化 将新值保存到filter的value中
							for(var i=0;i<formInstance.filters.length;i++){
								if(formInstance.filters[i].name == source.name ){
									formInstance.filters[i].value = source.getValue();
									break;
								}
							}
						});
					}
					//为buttons添加点击事件
					if(config.renderto!=null){
						for(var i=0;i<formInstance.buttons.length;i++){
							var button = formInstance.buttons[i];
							if(button.renderto !=null){
								if(button.type =='submit'){
									//提交
									$(config.renderto+' '+button.renderto).click(function(){
										formInstance.submit();
									});
								}else{
									//重置
									$(config.renderto+' '+button.renderto).click(function(){
										formInstance.filters = formInstance.config.filters;
									});
								}
							}
						}
					}
					formInstance.render();
					//登记此form
					LUI.SearchPageForm.instances.put(formInstance);
					return formInstance;
				},
				getInstance:function(formName){
					var formInstance = null;
					for(var i =0;i<LUI.SearchPageForm.instances.size();i++){
						var _instance = LUI.SearchPageForm.instances.get(i);
						if(_instance.name == formName){
							formInstance = _instance;
							break;
						}
					}
					return formInstance;
				}
		};

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		LUI.DisplayForm = {
				uniqueId:0,
				instances:LUI.Set.createNew(),
				createNew:function(config){
					//检查参数
					if(config.name==null){
						LUI.Message.info("错误","必须为显示表单提供name参数!");
						return null;
					}
					if(config.renderto==null){
						LUI.Message.info("错误","必须为显示表单提供renderto参数!");
						return null;
					}
					if(config.datasourceName==null){
						LUI.Message.info("错误","必须为显示表单"+name+"提供datasourceName参数!");
						return null;
					}
					var datasource = LUI.Datasource.getInstance(config.datasourceName);
					if(datasource == null){
						LUI.Message.info("错误","未找到显示表单"+name+"的数据源"+config.datasourceName+"!");
						return null;
					}
					
					//记录第一行内容 作为迭代的模板
					var formTargetEl = $(config.renderto);
					var formTargetElContent = $("<p>").append(formTargetEl.clone()).html();
					
					//参数的默认值
					var displayFormConfig = $.extend({
						id:'_displayForm_'+ (++LUI.DisplayForm.uniqueId),
						autoLoad:true,
						initialed:false,
						formTargetElContent:formTargetElContent,
						events:{
							render:'displayForm_render'
						},
						/**
						 * 通知displayForm  根据绑定的数据 
						 * 重新显示内容
						 */
						render:function(){
							
							var data={};
							if(this.datasource!=null ){
								data = this.datasource.getRow(0);
							}
							
							//生成行信息 到
							this.doRender(data);
							//
							this.initialed = true;
							
							this.fireEvent(this.events.render);
						},
						doRender:function(data){
							for(var i=0;i<this.fields.length;i++){
								var fieldDef = this.fields[i];
								if(fieldDef.renderTemplate!=null && fieldDef.renderto!=null){
									var _template = Handlebars.compile(fieldDef.renderTemplate);
									var _compiledValue = _template(data);
									//如果使用千分符
									if(fieldDef.showThousand == 'true'){
										_compiledValue = LUI.Util.thousandth(_compiledValue);
									}
									$(this.renderto+" "+fieldDef.renderto).html(_compiledValue);
									
									if(fieldDef.showTips == 'true'){
										if(fieldDef.tipsTemplate == null || fieldDef.tipsTemplate.length >0 || fieldDef.tipsTemplate == fieldDef.renderTemplate){
											$(this.renderto+" "+fieldDef.renderto).attr('title',_template(data));
										}else{
											_tipsTemplate = Handlebars.compile(fieldDef.tipsTemplate);
											$(this.renderto+" "+fieldDef.renderto).attr('title',_tipsTemplate(data));
										}
									}else{
										$(this.renderto+" "+fieldDef.renderto).attr('title','');
									}
								}
							}
						},
						datasource:datasource,
						//彻底销毁form
						destroy:function(){
							this.removeAllListener();
							LUI.Form.instances.remove(this);
						}
					},config);
					//创建grid对象
					var displayFormInstance = $.extend(LUI.Widget.createNew(),displayFormConfig);
					//事件监听
					if(displayFormInstance.listenerDefs!=null){
						if(displayFormInstance.listenerDefs.onRender!=null){
							var onRenderFunc = window[displayFormInstance.listenerDefs.onRender];
							if(onRenderFunc==null){
								LUI.Message.warn('查询失败','事件onRender的处理函数('+displayFormInstance.listenerDefs.onRender+')不存在！');
							}else{
								displayFormInstance.addListener(displayFormInstance.events.render,LUI.Observable.createNew(),onRenderFunc);
							}
						}
					}
					//绑定数据源（监听datasource的load事件）
					if(displayFormInstance.autoLoad == true){
						displayFormInstance.datasource.addListener(
							displayFormInstance.datasource.events.load,
							displayFormInstance,
							function(e_datasource,e_form,event,eventOrigin){
								if(e_datasource.size()>0){
									displayFormInstance.render();
								}
							}
						);
					}
					
					//登记此grid
					LUI.Form.instances.put(displayFormInstance);
					return displayFormInstance;
				}
			};
