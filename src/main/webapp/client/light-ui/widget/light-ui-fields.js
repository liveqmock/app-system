/**
 * 校验字段输入值是否符合要求
 * 确定提示信息及错误信息如何显示
 * 值发生变化时 为关联字段设置是否可见、是否允许编辑、及关联的新值
 */
var isIE = /msie/.test(navigator.userAgent.toLowerCase()); 
LUI.Form.Field = {
	uniqueId:0,
	type:'editor',
	createNew:function(fieldMeta,lui_form){
		var fieldConfig = $.extend({},fieldMeta);
		//字段是否allowBlank
		var allowBlank = true;
		if(fieldMeta.allowBlank==false || fieldMeta.allowBlank == "false"){
			allowBlank = false;
		}
//		fieldMeta.allowBlank = allowBlank;
		
		//字段是否enable
		var enabled = true;
		if(fieldMeta.enabled!=null && (fieldMeta.enabled==false || fieldMeta.enabled == "false")){
			enabled = false;
		}
		if(fieldMeta.allowEdit!=null && (fieldMeta.allowEdit==false || fieldMeta.allowEdit == "false")){
			enabled = false;
		}
		
		//字段是否hidden
		var hidden = false;
		if(fieldMeta.hidden!=null &&  fieldMeta.hidden == "true"){
			hidden = true;
		}
		
		fieldConfig.allowBlank = allowBlank;
		fieldConfig.enabled = enabled;
		fieldConfig.hidden = hidden;
		
		//字段定义中的type 与字段对象的type有冲突 因为type定义已经在选择fieldFactory时起作用了 所以可以删除
		fieldConfig.dataType = fieldConfig.type;//字段定义中的type 其实是数据类型
		delete fieldConfig.type;                
		
		var onChangeFunctionName = fieldMeta.onChange;
		var onChangeFunc = null;
		if(onChangeFunctionName!=null && onChangeFunctionName.length >0){
			onChangeFunc = window[onChangeFunctionName];
			if(onChangeFunc==null){
				LUI.Message.warn('查询失败','字段onChange事件的处理函数('+onChangeFunctionName+')不存在！');
			}
		}
		
		
		var fieldCfg = $.extend({
			name:null,
			label:null,
			id: '_form_field_'+(++LUI.Form.Field.uniqueId),
			type:LUI.Form.Field.type,
			config:fieldConfig,
			el:null,
			events:{
				change:'_field_change'
			},
			form:lui_form,
			onChangeFunction:onChangeFunc,
			renderType:'append',
			/**
			 * 显示字段与数据字段绑定 ：
			 * 0、解除与原数据字段之间的绑定
			 * 1、数据字段监听显示字段的变化：将新值同步到数据字段
			 * 2、显示字段监听数据字段的变化：显示新值
			 */
			/**
			 * 为字段设置值
			 */
			value:null,//实际值
			setValue:function (newVal,silence,isInitial,originSource){
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					if(this.validate(newVal)){
						//校验通过
						this.value = newVal;
					}else{
						this.value = null;
					}
					//无论校验通过与否 都生成显示值
					this.rawValue = this.formatRawValue(newVal);
					if(this.rendered){
						//重新显示
						this.displayRawValue();
					}
					
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							oldValue:oldVal,
							newValue:newVal,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}
			},
			rawValue:'',//显示值
			setRawValue:function (newRawVal,preventValueChange){
//				//重新格式化显示值（设置的显示值可能不符合此字段的格式要求）
//				var newRawVal = this.formatRawValue(rawVal);
				
				//显示值真的有变化 保存并重新显示
				if(!this.equalsRawValue(this.rawValue,newRawVal)){
					this.rawValue =newRawVal;
					if(this.rendered){
						this.displayRawValue();
					}
					
					if(preventValueChange ==null || preventValueChange==false){
						this.setValue(this.parseRawValue(this.rawValue), false,false,null);
					}
				}
			},
			/**
			 * 取得字段实际值
			 */
			getValue:function (){
				return this.value;
			},
			/**
			 * 取得字段显示值
			 */
			getRawValue:function (){
				return this.rawValue;
			},
			displayRawValue:function (){
				if(this.inputEl.val() != this.rawValue){
					//将显示值 重新显示到页面
					this.inputEl.val(this.rawValue);
				}
			},
			/**
			 * 原显示值与当前显示值是否一致
			 */
			equalsRawValue:function(rawVal1,rawVal2){
				if((rawVal1 ==null && rawVal2 ==null ) || (rawVal1!=null && rawVal1 == rawVal2)){
					return true;
				}
				return false;
			},
			equalsValue:function(val1,val2){
				if((val1==null && val2!=null) || (val1!=null && val2==null)){
					return false;
				}else if(val1==null && val2==null){
					return true;
				}else if(typeof(val1) != typeof(val2)){
					return false;
				}
				return val1 == val2;
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				return (rawVal==null || (''+rawVal).length ==0)?null:rawVal;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				return dataVal==null?'':(''+dataVal);
			},
			allowBlank:allowBlank,
			isValid:true,
			validInfo:'',
			/**
			 * 检查数据值是否有效：非空、取值范围、长度等
			 */
			validate:function(dataValue){
				if(this.hidden){
					this.isValid = true;
				}else{
					//检查存储值是否 有效
					if((dataValue==null || (''+dataValue).length ==0) && !allowBlank){
						this.isValid = false;
						this.validInfo = '此字段不允许为空!';
					}else{
						this.isValid = true;
					}
				}
				
				if(!this.isValid){
					this.markInvalid();
				}else{
					this.clearInvalid();
				}
				return this.isValid;
			},
			markInvalid:function(){
				if(this.enabled && this.rendered ){
					this.inputEl.addClass('nim-field-invalid');
				}
			},
			clearInvalid:function(){
				if(this.rendered ){
					this.inputEl.removeClass('nim-field-invalid');
				}
			},
			enabled:enabled,
			enable:function(){
				this.enabled = true;
				if(this.rendered){
					if(!this.isValid){
						//enable状态下 需要显示数据是否有效
						this.markInvalid();
					}
					this.inputEl.removeClass('nim-field-disabled');
				}
			},
			disable:function(){
				this.enabled = false;
				if(this.rendered){
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.addClass('nim-field-disabled');
				}
			},
			el:null,
			inputEl:null,
			oldEl:null,
			createFieldEl:function(_templateString){
				if((this.renderType == 'replace' || this.renderType == 'rela') && this.form.renderType !='rela'){
					LUI.Message.warn('未生成字段','当前表单的生成方式为'+this.form.renderType+',不允许字段'+this.name+'('+this.label+')使用'+this.renderType+'生成方式！');
					return false;
				}
				
				var _template = null;
				var fieldContentString = null;
				
				if(_templateString!=null){
					_template = Handlebars.compile(_templateString);
					fieldContentString = _template(this);
				}
				//根据构建类型 确定如何render
				if(this.renderType == 'append' ){
					//创建新的label、input元素 放置到form内部 
					this.el = $(fieldContentString);
					this.el.appendTo(this.form.formEl);
				}else if(this.renderType == 'insert' ){
					//创建新的input元素 放置到原有元素内部 
					this.el = $(fieldContentString).find('.nim-field-wrapper');
					this.el.appendTo($(this.form.formEl).find(this.renderto).first());
				}else if(this.renderType == 'replace'){
					//替换原有input
					this.oldEl = $(this.form.formEl).find(this.renderto).first();
					if(this.oldEl.length == 0){
						LUI.Message.warn('未生成字段','在当前表单内未找到字段'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
						return false;
					}
					//在原有元素后 插入新的input元素
					this.oldEl.after($(fieldContentString).find('.nim-field-wrapper'));
					this.el = this.oldEl.next();
					//删除原有元素
					this.oldEl.remove();
				}else if(this.renderType == 'rela'){
					this.el = $(this.form.formEl).find(this.renderto).first();
					if(this.el.length == 0){
						LUI.Message.warn('未生成字段','在当前表单内未找到字段'+this.name+'('+this.label+')的目标元素('+this.renderto+')！');
						return false;
					}
				}
				
				if(this.el!=null){
					this.inputEl = this.el.find('.nim-field-el');
					if(this.inputEl.size()==0){
						this.inputEl = this.el;
					}
				}
				return true;
			},
			hidden:false,
			isHidden:function(){
				return this.hidden;
			},
			setHidden:function(isHidden){
				this.hidden = isHidden;
				if(isHidden){
					this.hide();
				}else{
					this.show();
				}
			},
			hide:function(){
				this.el.css('display','none');
			},
			show:function(){
				this.el.css('display','inline-block');
			},
			rendered:false,
			_observer:LUI.Observable.createNew(),
			//创建页面元素
			render:function(){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何render
					if(this.createFieldEl(LUI.Template.Field.field)){
						//将自定义onchange方法 绑定到当前对象
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象(一个inputEl 同时只能绑定到一个field)
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis.setRawValue($(this).val(), false);
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.value);
			},
			resize:function(){
				var containerWidth= this.inputEl.width();
				this.inputEl.outerWidth(containerWidth);
			},
			//撤销对页面元素的创建
			deRender:function(forceDeRender){
				if(this.renderType != 'none' ){
					//根据构建类型 确定如何derender此按钮
					if(this.renderType == 'append'){
						//从form中 删除当前元素
						this.el.remove();
					}else if(this.renderType == 'insert'){
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'replace'){
						//将保存的原有元素信息 放回原处
						this.el.after(this.oldEl);
						//删除新的input元素
						this.el.remove();
					}else if(this.renderType == 'rela'){
						
					}
					
					//与页面元素取消关联
					this.inputEl.unbind();
					this.removeListener(this.events.change,this._observer);
				}
				
				this.el = null;
				this.inputEl = null;
				this.rendered = false;
			},
			/**
			 * 删除所有监听 以及对数据字段的监听
			 */
			destroy:function(distroyExistsEl){
				if(this.rendered){
					this.deRender(true);
				}
				this.value = null;
				this.rawValue = null;
			}
		},fieldConfig);
		
		return $.extend(LUI.Observable.createNew(),fieldCfg);
	}
};

LUI.Form.Field.BooleanRadioEditor = {
	uniqueId:0,
	type:'booleanRadioEditor',
	createNew:function(fieldMeta,lui_form){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_text_'+(++LUI.Form.Field.BooleanRadioEditor.uniqueId),
			type:LUI.Form.Field.BooleanRadioEditor.type
		});
	}
}

LUI.Form.Field.BooleanCheckEditor = {
		uniqueId:0,
		type:'booleanCheckEditor',
		createNew:function(fieldMeta,lui_form){
			
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
					id: '_form_field_booleancheck_'+(++LUI.Form.Field.BooleanCheckEditor.uniqueId),
					type:LUI.Form.Field.BooleanCheckEditor.type,
					setValue:function (newValue,silence,isInitial,originSource){
						var oldVal = this.value;
						var newVal = null;
						if(newValue == null){
							newVal = false;
						}else if(typeof(newValue) == 'boolean'){
							newVal = newValue;
						}else if(typeof(newValue) == 'string'){
							newVal = (newValue != 'false');
						}else if(typeof(newValue) == 'number'){
							newVal = (newValue != 0);
						}else{
							LUI.Message.warn('设置值失败','未定义处理方式的值:'+newValue+'！');
						}
						//如果值有变化
						if(!this.equalsValue(this.value,newVal)){
							if(this.validate(newVal)){
								//校验通过
								this.value = newVal;
							}else{
								this.value = null;
							}
							this.rawValue = ''+this.value;

							//重新显示
							if(this.rendered){
								//重新显示
								this.displayRawValue();
							}
							
							//触发change事件
							if(!silence && (originSource==null || originSource != this)){
								this.fireEvent(this.events.change,{
									oldValue:oldVal,
									newValue:newVal,
									isInitial: (isInitial ==null?false:isInitial)
								},originSource||this);
							}
						}
					},
					render:function(){
						if(this.renderType != 'none'){
							//根据构建类型 确定如何render
							if(this.createFieldEl(LUI.Template.Field.checkbox)){
								//将自定义onchange方法 绑定到当前对象的change事件
								if(this.onChangeFunction!=null){
									this.addListener(this.events.change,this._observer,this.onChangeFunction);
								}
								//在ie浏览器中 checkbox需要失去焦点才能触发change事件
								if (isIE) {
									this.inputEl.click(function () {
										this.blur();
										this.focus();
									});
								}; 
								//将input元素的change事件 绑定到当前对象
								var contextThis = this;
								this.inputEl.bind('change',function(){
									contextThis.setValue($(this).prop("checked"),false,false,null);
								});
								
								this.rendered = true;
								//原值要重新显示出来
								this.displayRawValue();
							}
						}
						this.validate(this.value);
					},
					markInvalid:function(){
						;
					},
					clearInvalid:function(){
						;
					},
					enable:function(){
						
					},
					disable:function(){
						
					},
					/**
					 * 将显示值转换为数据值
					 */
					parseRawValue:function(rawVal){
						return rawVal==null?false:rawVal;
					},
					/**
					 * 将数据值格式化为显示值
					 */
					formatRawValue:function(dataVal){
						return dataVal==null?false:dataVal;
					},
					displayRawValue:function (){
						//原值要重新显示出来
						if(this.value!=null && this.value==true){
							this.inputEl.prop("checked", true);
						}else{
							this.inputEl.prop("checked", false);
						}
					}
			});
			return field;
		}
	};

/**
 * 字符单行编辑控件 最基础的控件类型 
 */
LUI.Form.Field.String = {
	uniqueId:0,
	type:'stringEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_text_'+(++LUI.Form.Field.String.uniqueId),
			type:LUI.Form.Field.String.type
		});
	}
};

/**
 * 字符单行编辑+选择控件 可选择也可自主输入 
 */
LUI.Form.Field.StringPlusSelect = {
	uniqueId:0,
	type:'stringEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_text_'+(++LUI.Form.Field.String.uniqueId),
			type:LUI.Form.Field.String.type
		});
	}
};

/**
 * 字符选择控件 预定义范围内选择值 代替用户输入
 */
LUI.Form.Field.StringSelect = {
	uniqueId:0,
	type:'textSelectEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_textselect_'+(++LUI.Form.Field.StringSelect.uniqueId),
			type:LUI.Form.Field.StringSelect.type,
			options:fieldMeta.options,
			dataGetter:fieldMeta.dataGetter,
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.select)){
						var containerWidthStyle = this.inputEl.css('width');
						if(containerWidthStyle.indexOf('%') >=0){
							this.inputEl.find('#'+this.name).css('width','calc('+containerWidthStyle +' -20px');
						}else{
							this.inputEl.find('#'+this.name).css('width',(parseInt(containerWidthStyle)  -20) +'px');
						}
						//
						var allowSearch = true;
						if(this.allowSearch != null &&  this.allowSearch != "true"){
							allowSearch = false;
						}
						
//						this.inputEl.val(this.value);
						//创建chosen
						this.inputEl.chosen({
							allow_single_deselect:this.allowBlank,
							disable_search_threshold:5,
							disable_search:!allowSearch,
							width:'100%'
						});
						//添加选项
						this.initOptions(this.options);

						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						//将input元素的change事件 绑定到当前对象
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis.setValue($(this).val());
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.value);
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				return (rawVal==null || rawVal=='')?null:rawVal;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				return dataVal==null?'':dataVal;
			},
			markInvalid:function(){
				if(this.enable){
					$('#'+this.form.name).find('#'+this.name+"_chosen").children('.chosen-single').addClass('field-invalid');
				}
			},
			clearInvalid:function(){
				$('#'+this.form.name).find('#'+this.name+"_chosen").children('.chosen-single').removeClass('field-invalid');
			},
			enable:function(){
				if(!this.isValid){
					this.markInvalid();
				}
				$('#'+this.form.name).find('#'+this.name).removeAttr('disabled');
				$('#'+this.form.name).find('#'+this.name).trigger("chosen:updated");
			},
			disable:function(){
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				$('#'+this.form.name).find('#'+this.name).attr('disabled','disabled');
				$('#'+this.form.name).find('#'+this.name).trigger("chosen:updated");
				$('#'+this.form.name).find('#'+this.name+"_chosen").children('.chosen-single').addClass('field-disabled');
			},
			displayRawValue:function(){
				if(this.inputEl.val() != this.value){
					this.inputEl.val(this.value);
					this.inputEl.trigger("chosen:updated");
				}
			},
			initOptions:function(){
				//删除原有选项
				this.inputEl.find('option').remove();
				if(field.allowBlank){
					this.inputEl.append('<option value=""></option>');
				}
				
				var options = [];
				if(this.options !=null && this.options.length >0){
					options = eval(this.options); 
				}else if (this.dataGetter!=null && this.dataGetter.length>0){
					var dataGetterFunc = window[this.dataGetter];
					if(dataGetterFunc==null){
						LUI.Message.warn('查询失败','字段的dataGetter函数('+this.dataGetter+')不存在！');
					}
					options = dataGetterFunc.apply(this); 
				}
				
				var valueExists = false;
				for(var i=0;i<options.length;i++){
					if(this.value == options[i].value){
						valueExists = true;
					}
					this.inputEl.append('<option  value="'+options[i].value+'"'+(this.value == options[i].value ?'selected':'')+'>'+options[i].text+'</option>');
				}
				if(this.value!=null && !valueExists){
					this.setValue(null);
				}else if(this.value ==null && this.allowBlank== false && options.length >0){
					this.setValue(options[0].value);
				}
				this.inputEl.trigger("chosen:updated");
			}
		});
		
		
		return field;
	}
};


LUI.Form.Field.TextRadio = {
	uniqueId:0,
	type:'textRadioEditor',
	createNew:function(fieldMeta,lui_form){
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_textradio_'+(++LUI.Form.Field.TextRadio.uniqueId),
			type:LUI.Form.Field.TextRadio.type
		});
		
		return field;
	}
};

LUI.Form.Field.StringChooseEl = {
		uniqueId:0,
		type:'textChooseElEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_textchooseel_'+(++LUI.Form.Field.StringChooseEl.uniqueId),
				type:LUI.Form.Field.StringChooseEl.type,
				render:function(){
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.chooseEl)){
							//允许drag
							this.el.find( 'img#_handler').first()
								.data("droppableSelector",this.droppable)
								.data("field",this)
								.draggable({
									appendTo: "body",
									revert: true, 
									helper: "clone" ,
									scroll: true,
									start:function( event, ui ){
										//input失去焦点
										var field = $(this).data("field");
										field.inputEl.blur();
										
										var parentRenerto = "";
										//取到次顶级节点 检查上层节点的renderto属性
										
										var selectedNodes = LUI.PageDesigner.instance._pageCmpTree.getSelectedNodes();
										var selectedNode = selectedNodes[0];
			
										var loopNode = selectedNode;
										while(loopNode.getParentNode()!=null &&　loopNode.getParentNode().component!=null &&　loopNode.getParentNode().component.type !='page'){
											loopNode = loopNode.getParentNode();
											if(LUI.PageDesigner.instance.hasProperty(loopNode,'renderto')){
												if(loopNode.data.renderto!=null){
													parentRenerto += loopNode.data.renderto+" ";
												}else{
													event.preventDefault();
													alert("上级节点尚未设置renderto属性");
													return;
												}
											}
										}
										
										//根据节点类型 设置dropable的元素
										var tSelector = $(this).data("droppableSelector");
										$(this).data("droppableSelectorWithPath",parentRenerto+tSelector);
										$( "#_pageContent" ).find(parentRenerto+tSelector).droppable({
											 activeClass: "ui-state-hover",
											 hoverClass: "ui-state-active",
											 drop: function( event, ui ) {
												 var asd = event.target;
												 if(this.id){
													 field.setValue("#"+this.id,false,false,null);
												 }else{
													 LUI.Message.info("信息","目标元素未定义id!");
												 }
												 return false;
											 }
										});
									},
									stop:function( event, ui ){
										var field = $(this).data("field");
										//取消dropable的元素
										var tSelector = $(this).data("droppableSelectorWithPath");
										$("#_pageContent").find(tSelector).droppable( "destroy" );
										field.inputEl.focus();
									}
								});
							
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								contextThis.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//
							this.resize();
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					
					this.validate(this.value);
				},
				resize:function(){
					var containerWidth= this.inputEl.outerWidth();
					this.inputEl.outerWidth(containerWidth  -20);
				},
				enable:function(){
					//按钮不可点击 拖拽
					
					//
					if(!this.isValid){
						this.markInvalid();
					}
					this.inputEl.removeAttr('disabled');
				},
				disable:function(){
					//按钮可点击 拖拽
					
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					this.inputEl.attr('disabled','disabled');
				},
//				markInvalid:function(){
//					if(this.enabled && this.rendered ){
//						this.inputEl.addClass('nim-field-invalid');
//					}
//				},
//				clearInvalid:function(){
//					if(this.rendered ){
//						this.inputEl.removeClass('nim-field-invalid');
//					}
//				},
				displayRawValue:function (){
					if(this.inputEl.val() != this.rawValue){
						//将显示值 重新显示到页面
						this.inputEl.val(this.rawValue);
					}
				}
			});
			return field;
		}
	};


LUI.Form.Field.HTMLArea = {
		uniqueId:0,
		type:'htmlEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.Textarea.createNew(fieldMeta,lui_form),{
				id: '_form_field_HTMLArea_'+(++LUI.Form.Field.HTMLArea.uniqueId),
				type:LUI.Form.Field.HTMLArea.type,
				richEditor:null,
				richEditorSetting:false,
				setValue:function (newVal,silence,isInitial,originSource){
					var oldVal = this.value;
					//如果值有变化
					if(!this.equalsValue(this.value,newVal)){
						if(this.validate(newVal)){
							//校验通过
							this.value = newVal;
							this.rawValue =this.formatRawValue(newVal);
						}else{
							this.value = null;
							this.rawValue = '';
						}
						
						//field renderer的时候 也会触发change时间 导致此field被setValue
						if(this.richEditor!=null && this.richEditorSetting == false){
							this.richEditor.html(this.rawValue);
						}
						
						//触发change事件
						if(!silence && (originSource==null || originSource != this)){
							this.fireEvent(this.events.change,{
								oldValue:oldVal,
								newValue:newVal,
								isInitial: (isInitial ==null?false:isInitial)
							},originSource||this);
						}
					}
				},
				setRawValue:function (newRawVal,preventValueChange){
					//显示值真的有变化 保存并重新显示
					if(!this.equalsRawValue(this.rawValue,newRawVal)){
						this.rawValue =newRawVal;
						if(preventValueChange ==null || preventValueChange==false){
							this.setValue(this.parseRawValue(this.rawValue), false,false,null);
						}
					}
				},
				render:function(){
					if(this.renderType == 'replace'){
						var fieldSameNameElCount = $('#'+this.name).length;
						if(fieldSameNameElCount >0){
							LUI.Message.warn('警告','页面中存在其它id = '+this.name+'的元素('+fieldSameNameElCount+')，<br/>为表单('
								+this.form.name+' '+this.form.renderto+')中字段('+this.name+' '+this.renderto+')生成HTML编辑器失败，<br/>请将生成方式改为:‘关联输入域’重试！');
							return;
						}else{
							if(this.createFieldEl(LUI.Template.Field.htmlArea)){
								var containerWidthStyle = this.el.css('width');
								if(containerWidthStyle.indexOf('%') >=0){
									this.inputEl.css('width','calc('+containerWidthStyle +' -30px');
								}else{
									this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
								}
								var _this = this;
//								var inputElOuterWidth = this.inputEl.outerWidth()+"px";
								this.richEditor = KindEditor.create(this.form.renderto+' textarea#'+this.name, {
									allowImageUpload : false,
									minWidth:400,
									items : [
										'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
										'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
										'insertunorderedlist', '|','wordpaste', 'emoticons', 'image', 'link'],
									afterCreate:function(){
										_this.el.find('div.ke-container').css('display', 'inline-block');
										//在工具栏显示计数
										$(this.toolbar.div[0]).append(
											'<span unselectable="on" style="float:right;font-size: 12px;padding-right: 5px;padding-top: 3px;">字数统计: 0'+
											'</span>');
									},
									afterChange:function(){
										//在工具栏显示计数
										$(this.toolbar.div[0]).find('span:last').html('字数统计: '+this.count());
										var textareaValue = this.html().replace(/\n/g,"\\n").replace(/\"/g,'\\"');
//										_this.setValue(textareaValue,true);//设置值到field 并不触发field的change事件（这么做 是为了有效性检查）
										_this.validate(textareaValue);
									},
									afterBlur:function(){
										var textareaValue = this.html().replace(/\n/g,"\\n").replace(/\"/g,'\\"');
										_this.richEditorSetting = true;//通知field不要再把值set回来
										_this.setValue(textareaValue);
										_this.richEditorSetting = false;
									}
								});
								
								//允许点击 打开编辑窗口
								this.el.find('img#_handler').first()
									.click(function(){
										var workarea = $('#_pageContent');
										var workareaWidth = workarea.width() - 100;
										var workareaHeight = workarea.height() - 60;
										
										$( "body" ).append(
												'<div title="'+_this.label+'('+_this.name+')'+'" id="html_area_'+_this.name+'" style="height:100%;">'+
													'<textarea id="'+_this.name+'_textarea" name="'+_this.name+'_textarea" style="width:100%;height:100%;">'+
													'</textarea>'+
												'</div>'
											);
										divEl = $('#html_area_'+_this.name);
										
										divEl.dialog({
												 modal: true,
												 width: workareaWidth,
												 height: workareaHeight,
												 close:function(){
													 $(this).dialog( "destroy" );
													 $(this).remove();
												 },
												 open:function(event, ui){
													$(".ui-dialog-titlebar-close", $(this).parent()).hide();
													var popEditor = KindEditor.create('#html_area_'+_this.name, {
														allowImageUpload : false,
														resizeType:0,
														width:workareaWidth -2,
														afterCreate:function(){
															 this.html(_this.richEditor.html());
														}
													});
													_this.popEditor = popEditor;
												 },
												 resizeStop: function( event, ui ) {
													_this.popEditor.resize(
														ui.size.width -1,
														ui.size.height - 78
														,false
													);
												 },
												 autoOpen: true,
												 hide: { effect: "scale", percent: 0 ,duration: 400},
												 buttons: [{ 
													 text: "确定",
													 click:function() {
														 _this.richEditor.html(_this.popEditor.html());
//														var textareaValue = jsCodeMirrorEdit.getValue();
//														textareaValue = textareaValue.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
//														fieldCmp.setValue(textareaValue,false,false,null);
														$( this ).dialog( "close" );
													 }
												},{ 
													 text: "取消",
													 click:function() {
														$( this ).dialog( "close" );
													 }
												}]
										});
									});
							}
							
							
						}
						
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						
					}else if (this.renderType == 'rela'){

						if(this.createFieldEl()){
							var containerWidthStyle = this.el.css('width');
							if(containerWidthStyle.indexOf('%') >=0){
								this.inputEl.css('width','calc('+containerWidthStyle +' -30px');
							}else{
								this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
							}
							var _this = this;
							this.richEditor = KindEditor.create(this.form.renderto+' textarea#'+this.name, {
								allowImageUpload : false,
								minWidth:400,
								items : [
									'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline',
									'removeformat', '|', 'justifyleft', 'justifycenter', 'justifyright', 'insertorderedlist',
									'insertunorderedlist', '|','wordpaste', 'emoticons', 'image', 'link'],
								afterCreate:function(){
									_this.el.find('div.ke-container').css('display', 'inline-block');
									//在工具栏显示计数
									$(this.toolbar.div[0]).append(
										'<span unselectable="on" style="float:right;font-size: 12px;padding-right: 5px;padding-top: 3px;">字数统计: 0'+
										'</span>');
								},
								afterChange:function(){
									//在工具栏显示计数
									$(this.toolbar.div[0]).find('span:last').html('字数统计: '+this.count());
									var textareaValue = this.html().replace(/\n/g,"\\n").replace(/\"/g,'\\"');
//									_this.setValue(textareaValue,true);//设置值到field 并不触发field的change事件（这么做 是为了有效性检查）
									_this.validate(textareaValue);
								},
								afterBlur:function(){
									var textareaValue = this.html().replace(/\n/g,"\\n").replace(/\"/g,'\\"');
									_this.richEditorSetting = true;//通知field不要再把值set回来
									_this.setValue(textareaValue);
									_this.richEditorSetting = false;
								}
							});
							
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
						}
					}
					this.rendered = true;
					this.validate(this.value);
				},
				displayRawValue:function(){
					;//
				},
				deRender:function(forceDeRender){
					KindEditor.remove(this.form.renderto+' textarea#'+this.name);
					if(this.renderType != 'none' ){
						//根据构建类型 确定如何derender此按钮
						if(this.renderType == 'append'){
							//从form中 删除当前元素
							this.el.remove();
						}else if(this.renderType == 'insert'){
							//删除新的input元素
							this.el.remove();
						}else if(this.renderType == 'replace'){
							//将保存的原有元素信息 放回原处
							this.el.after(this.oldEl);
							//删除新的input元素
							this.el.remove();
						}else if(this.renderType == 'rela'){
							
						}
						
						//与页面元素取消关联
						this.inputEl.unbind();
						this.removeListener(this.events.change,this._observer);
					}
					
					this.el = null;
					this.inputEl = null;
					this.rendered = false;
				},
				markInvalid:function(){
					if(this.enabled && this.rendered && this.richEditor!=null){
						$(this.richEditor.container[0]).addClass('nim-field-invalid');
//						this.inputEl.find('.ke-container').addClass('nim-field-invalid');
					}
				},
				clearInvalid:function(){
					if(this.rendered && this.richEditor!=null){
						$(this.richEditor.container[0]).removeClass('nim-field-invalid');
//						this.inputEl.find('.ke-container').removeClass('nim-field-invalid');
					}
				}
			});
			return field;
		}
}


LUI.Form.Field.EventScript = {
		uniqueId:0,
		type:'eventScriptEditor',
		createNew:function(fieldMeta,lui_form){
			var field = $.extend(LUI.Form.Field.Textarea.createNew(fieldMeta,lui_form),{
				id: '_form_field_eventScript_'+(++LUI.Form.Field.EventScript.uniqueId),
				type:LUI.Form.Field.EventScript.type,
				render:function(){
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.eventScript)){
							var containerWidthStyle = this.el.css('width');
							if(containerWidthStyle.indexOf('%') >=0){
								this.inputEl.css('width','calc('+containerWidthStyle +' -30px');
							}else{
								this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
							}
							
							var fieldCmp = this;
							//允许点击 打开编辑窗口
							this.el.find('img#_handler').first()
								.click(function(){
									$( "body" ).append(
											'<div title="'+fieldCmp.label+'('+fieldCmp.name+')'+'" id="event_script_'+fieldCmp.name+'">'+
												'<span class="cm-s-default" style="font-size: 13px;font-weight: bold;line-height:22px;height:22px;">'+
													'<span class="cm-keyword">function</span>&nbsp;'+
													'<span class="cm-variable">'+fieldCmp.name+'</span>('+
													'<span class="cm-def">qweqe,qweq</span>,'+
													'<span class="cm-def">qweqw</span>,'+
													'<span class="cm-def">qwe</span>){'+
												'</span>'+
												'<textarea cols=40 rows=10 id="'+fieldCmp.name+'_textarea" name="'+fieldCmp.name+'_textarea" style="height: 136px;width: 100%;overflow:auto">'+
												(fieldCmp.getValue()==null?"":fieldCmp.getValue().replace(/\\n/g,"\n") )+
												'</textarea>'+
												'<span style="font-size: 13px;font-weight: bold;line-height:22px;height:22px;">}</span>'+
											'</div>'
										);
									divEl = $('#event_script_'+fieldCmp.name);
									var jsCodeMirrorEdit = CodeMirror.fromTextArea(divEl.find('#'+fieldCmp.name+'_textarea')[0], {
									     lineNumbers: true,
									     matchBrackets: true,
									     continueComments: "Enter",
									     extraKeys: {"Ctrl-Q": "toggleComment"},
									     mode: "javascript"
									 });
									
									divEl.dialog({
											 modal: true,
											 width: 613,
											 height: 393,
											 close:function(){
												 $(this).dialog( "destroy" );
												 $(this).remove();
											 },
											 open:function(event, ui){
												$(".ui-dialog-titlebar-close", $(this).parent()).hide();
												
												//设置textarea宽度
												divEl.css('padding','0px').css('width','100%');
												// 创建CodeMirror编辑器
												
												jsCodeMirrorEdit.setSize('100%','246px');
											 },
											 resizeStop: function( event, ui ) {
												 jsCodeMirrorEdit.setSize('100%',(ui.size.height - 130)+'px');
											 },
											 autoOpen: true,
											 show: { effect: "scale", percent:100,duration: 400 },
											 hide: { effect: "scale", percent: 0 ,duration: 400},
											 buttons: [{ 
												 text: "确定",
												 click:function() {
													var textareaValue = jsCodeMirrorEdit.getValue();
													textareaValue = textareaValue.replace(/\n/g,"\\n").replace(/\"/g,'\\"');
													fieldCmp.setValue(textareaValue,false,false,null);
													$( this ).dialog( "close" );
												 }
											},{ 
												 text: "取消",
												 click:function() {
													$( this ).dialog( "close" );
												 }
											}]
									});
								});
							
							//将input元素的change事件 绑定到当前对象
							this.inputEl.bind('change',function(){
								fieldCmp.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					this.validate(this.value);
				}
			});
			return field;
		}
}

LUI.Form.Field.Textarea = {
	uniqueId:0,
	type:'textareaEditor',
	createNew:function(fieldMeta,lui_form){
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_textarea_'+(++LUI.Form.Field.Textarea.uniqueId),
			type:LUI.Form.Field.Textarea.type,
			render:function(){
				
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.textarea)){
						var containerWidthStyle = this.el.css('width');
						if(containerWidthStyle.indexOf('%') >=0){
							this.inputEl.css('width','calc('+containerWidthStyle +' -30px');
						}else{
							this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
						}
						
						//允许点击 打开编辑窗口
						this.el.find('img#_handler').first()
							.data("field",this)
							.click(function(){
								var cField = $(this).data('field');
								var divEl = $(
									'<div title="'+cField.label+'('+cField.name+')'+'">'+
										'<textarea cols=40 rows=10 id="'+cField.name+'_textarea" name="'+cField.name+'_textarea" style="height: 100%;width: 100%;overflow:auto">'+
										'</textarea>'+
									'</div>');
								
								divEl.find('textarea#'+cField.name+'_textarea').val(cField.getValue()==null?"":cField.getValue().replace(/\\n/g,"\n"));
								divEl.dialog({
										 modal: true,
										 width: 413,
										 height: 263,
										 close:function(){
											 $(this).dialog( "destroy" );
											 $(this).remove();
										 },
										 open:function(){
											$(".ui-dialog-titlebar-close", $(this).parent()).hide();
										 },
										 autoOpen: true,
										 show: { effect: "scale", percent:100,duration: 400 },
										 hide: { effect: "scale", percent: 0 ,duration: 400},
										 buttons: [{ 
											 text: "确定",
											 click:function() {
												var textareaValue = $(this).find('textarea#'+cField.name+'_textarea').val();
												textareaValue = textareaValue.replace(/\n/g,"\\n");
												cField.setValue(textareaValue,false,false,null);
												$( this ).dialog( "close" );
											 }
										},{ 
											 text: "取消",
											 click:function() {
												$( this ).dialog( "close" );
											 }
										}]
								});
							});
						
						//将input元素的change事件 绑定到当前对象
						var contextThis = this;
						this.inputEl.bind('change',function(){
							contextThis.setValue($(this).val(),false,false,null);
						});
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.value);
			},
			enable:function(){
				//按钮不可点击
				
				//
				if(!this.isValid){
					this.markInvalid();
				}
				this.inputEl.removeAttr('disabled');
			},
			disable:function(){
				//按钮可点击
				
				//
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				this.inputEl.attr('disabled','disabled');
			},
			displayRawValue:function (){
				if(this.inputEl.val() != this.rawValue){
					//将显示值 重新显示到页面
					this.inputEl.val(this.rawValue);
				}
			}
		});
	
		return field;
	}

};


LUI.Form.Field.Int = {
	uniqueId:0,
	type:'intEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_int_'+(++LUI.Form.Field.Int.uniqueId),
			type:LUI.Form.Field.Int.type
		});
	}
};

LUI.Form.Field.Double = {
	uniqueId:0,
	type:'doubleEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_double_'+(++LUI.Form.Field.Double.uniqueId),
			type:LUI.Form.Field.Double.type
		});
	}
};

LUI.Form.Field.Money = {
	uniqueId:0,
	type:'moneyEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_money_'+(++LUI.Form.Field.Money.uniqueId),
			type:LUI.Form.Field.Money.type
		});
	}
};

LUI.Form.Field.ObjectSelect = {
	uniqueId:0,
	type:'objectSelectEditor',
	createNew:function(fieldMeta,lui_form){
		var datasourceType = fieldMeta.datasourceType;
		var _datasource = LUI.Datasource.getInstance(fieldMeta.datasourceName);
		if(_datasource == null){
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置数据源！');
			return null;
		}
		
		//解析生成模板中的字段名 用作查询条件
		var queryFields = [];
		var renderTemplateExpression = null;
		if(fieldMeta.renderTemplate!=null && fieldMeta.renderTemplate.length >0){
			var matchRe = /{{[\S]+?}}/gi;
			var replaceRe = /{{|}}/gi;
			var fields = fieldMeta.renderTemplate.match(matchRe);
			for(var i= 0;i<fields.length;i++){
				queryFields[queryFields.length] = fields[i].replace(replaceRe, "");
			}
			
			renderTemplateExpression = Handlebars.compile(fieldMeta.renderTemplate);
		}else{
			LUI.Message.warn('创建字段失败','字段('+fieldMeta.name+')未设置显示表达式！');
			return null;
		}
		
		var minLength = 0;
		if(fieldMeta.minLength!=null && fieldMeta.minLength.length >0){
			minLength = parseInt(fieldMeta.minLength);
		}
		
		var allowEdit = true;
		if(fieldMeta.allowEdit!=null && fieldMeta.allowEdit=='false'){
			allowEdit = false;
		}
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_objectselect_'+(++LUI.Form.Field.ObjectSelect.uniqueId),
			type:LUI.Form.Field.ObjectSelect.type,
			options:[],
			queryFields:queryFields,
			datasource:_datasource,
			renderTemplateExpression:renderTemplateExpression,
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.select)){
						var contextThis = this;
						this.inputEl.combobox({
							getObjectField:function(){
								return contextThis;
							},
							height:fieldMeta.height,
							width:fieldMeta.width,
							disabled:!allowEdit,
							source: function( request, response ) {
								var searchString = null;
								var isShowAll = false;
								if(request.term == 'search all'){
									isShowAll = true;
									if(this.options.minLength >0){
										return;
									}
								}else if(request.term!=null && request.term.length>0){
									searchString = request.term.toLowerCase();;
								}
								
								//输入字符或点击下拉箭头 请求显示符合条件的选项 
								if(contextThis.searchMode == 'local'){
									//本地搜索
									if(contextThis.datasource.loaded = true){
										//如果已经load了全部数据 进行本地搜索
										contextThis.initOptions(searchString,isShowAll);
										response(contextThis.options);
									}else{
										//如果还没有load 需要远程取得全部数据 再进行本地搜索
										contextThis.datasource.load({},function(){
											contextThis.initOptions(searchString,isShowAll);
											response(contextThis.options);
										},true,false);
									}
								}else{
									//远程搜索
									var filters = [];
									if(searchString!=null && contextThis.queryFields.length>0){
										var filter = {
											property:contextThis.queryFields[0],
											operator:'like',
											value:searchString,
											assist:contextThis.queryFields
										};
										if(contextThis.queryFields.length>1){
											filter.assist = contextThis.queryFields.slice(1);
										}
										filters[filters.length] = filter;
									}
									
									contextThis.datasource.load({
										filters:filters
									},function(){
										contextThis.initOptions(searchString,isShowAll);
										response(contextThis.options);
									},true,false);
								}
							},
							minLength: minLength,
							select: function( event, ui ) {
								contextThis.setValue(ui.item.data);
							}
						});
						//如果数据源已经loaded 初始化选择项
//						if(this.datasource.loaded = true ){
//							this.initOptions();
//						}
						
						
						
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
		//				//在ie浏览器中 checkbox需要失去焦点才能触发change事件
		//				if (isIE) {
		//					this.inputEl.click(function () {
		//						this.blur();
		//						this.focus();
		//					});
		//				}; 
						this.rendered = true;
						//原值要重新显示出来
//						this.displayRawValue();
					}
				}
				this.validate(this.value);
			},
			setValue:function (val,silence,isInitial,originSource){
				var newVal = val;
				if(typeof(val) == 'number' || typeof(val) == 'string'){
					var oRecord = this.datasource.getRecordByPKValue(val *1);
					if(oRecord!=null){
						newVal = oRecord.getData();
					}
				}
				var oldVal = this.value;
				//如果值有变化
				if(!this.equalsValue(this.value,newVal)){
					if(this.validate(newVal)){
						//校验通过
						this.value = newVal;
					}else{
						this.value = null;
					}
					//无论校验通过与否 都生成显示值
					this.rawValue = this.formatRawValue(newVal);
					if(this.rendered){
						//重新显示
						this.displayRawValue();
					}
					
					//触发change事件
					if(!silence && (originSource==null || originSource != this)){
						this.fireEvent(this.events.change,{
							oldValue:oldVal,
							newValue:newVal,
							isInitial: (isInitial ==null?false:isInitial)
						},originSource||this);
					}
				}
			},
			/**
			 * 将显示值转换为数据值
			 */
			parseRawValue:function(rawVal){
				var valueLowerCase = rawVal.toLowerCase();
				for(var i=0;i<this.datasource.size();i++){
					var r = this.datasource.getRecord(i);
					var text = this.formatRawValue(r.getData());
					if(text == rawVal){
						return r.getData();
					}
				}
				
//				for(var i=0;i<this.options.length;i++){
//					var item = this.options[i];
//					var elText = item.label.toLowerCase();
//					if ( elText.indexOf(valueLowerCase) >= 0 ) {
//						return item.data;
//					}
//				}
				return null;
			},
			/**
			 * 将数据值格式化为显示值
			 */
			formatRawValue:function(dataVal){
				if(dataVal!=null && this.renderTemplateExpression!=null){
					return this.renderTemplateExpression(dataVal);
				}
				return '';
			},
			displayRawValue:function (){
				var comboInput = this.inputEl.combobox("instance").input;
				if(comboInput.val() != this.rawValue){
					//将显示值 重新显示到页面
					comboInput.val(this.rawValue);
				}
			}, 
			markInvalid:function(){
				if(this.enable){
					var comboboxIns = this.inputEl.combobox("instance");
					if(comboboxIns!=null) comboboxIns.wrapper.addClass('custom-combobox-invalid');
				}
			},
			clearInvalid:function(){
				var comboboxIns = this.inputEl.combobox("instance");
				if(comboboxIns!=null) comboboxIns.wrapper.removeClass('custom-combobox-invalid');
			},
			enable:function(){
				if(!this.isValid){
					this.markInvalid();
				}
				//将字段变为可编辑
				//...
			},
			disable:function(){
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
				//将字段变为不可编辑
				//...
			},
			initOptions:function(searchString,isShowAll){
				var searchStringLowerCase = null;
				if(searchString!=null){
					searchStringLowerCase = searchString.toLowerCase();
				}
				//删除原有选项
				this.options = [];
				
				if(field.allowBlank && (searchStringLowerCase==null || isShowAll)){
					this.options[this.options.length] = {
						value: null,
						label: "无"
					};
				}
				
				for(var i=0;i<this.datasource.size();i++){
					var r = this.datasource.getRecord(i);
					var rData = r.getData();
					var text = this.formatRawValue(rData);
					if(searchStringLowerCase==null || text.toLowerCase().indexOf(searchStringLowerCase) >= 0){
						this.options[this.options.length] = {
								value: text,
								label: text,
								data:rData
							};
					}
				}
			}
		});
		return field;
	}

};

LUI.Form.Field.Time = {
	uniqueId:0,
	type:'timeEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_time_'+(++LUI.Form.Field.Time.uniqueId),
			type:LUI.Form.Field.Time.type
		});
	}
};

LUI.Form.Field.Date = {
		uniqueId:0,
		type:'dateEditor',
		createNew:function(fieldMeta,lui_form){
//			var renderType = fieldMeta.renderType||'generate';
//			fieldMeta.renderType = 'rela';
			
			var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
				id: '_form_field_date_'+(++LUI.Form.Field.Date.uniqueId),
				type:LUI.Form.Field.Date.type,
				
				enable:function(){
					//按钮不可点击
					
					//
					if(!this.isValid){
						this.markInvalid();
					}
					$('#'+this.form.name).find('#'+this.name).removeAttr('disabled');
				},
				disable:function(){
					//按钮可点击
					
					//
					if(!this.isValid){
						//disable状态下 不显示数据是否有效
						this.clearInvalid();
					}
					$('#'+this.form.name).find('#'+this.name).attr('disabled','disabled');
				},
				render:function(){
					
					if(this.renderType != 'none'){
						if(this.createFieldEl(LUI.Template.Field.datepicker)){
							this.inputEl.datepicker({dateFormat:'yy-mm-dd'});
							
							var containerWidthStyle = this.el.css('width');
							if(containerWidthStyle.indexOf('%') >=0){
								this.inputEl.css('width','calc('+containerWidthStyle +' -30px');
							}else{
								this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
							}
							
							
							var fieldInputEl = this.inputEl;
							//点击显示日历
							this.el.find('img#_handler').first()
								.click(function(){
									fieldInputEl.datepicker("show");
								});
							//将input元素的change事件 绑定到当前对象
							var contextThis = this;
							this.inputEl.bind('change',function(){
								contextThis.setValue($(this).val(),false,false,null);
							});
							//将自定义onchange方法 绑定到当前对象的change事件
							if(this.onChangeFunction!=null){
								this.addListener(this.events.change,this._observer,this.onChangeFunction);
							}
							this.rendered = true;
							//原值要重新显示出来
							this.displayRawValue();
						}
					}
					this.validate(this.value);
				}
			});
			return field;
		}

};

LUI.Form.Field.Month = {
	uniqueId:0,
	type:'monthEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_month_'+(++LUI.Form.Field.Month.uniqueId),
			type:LUI.Form.Field.Month.type
		});
	}
};

LUI.Form.Field.Year = {
	uniqueId:0,
	type:'yearEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_year_'+(++LUI.Form.Field.Year.uniqueId),
			type:LUI.Form.Field.Year.type
		});
	}
};

LUI.Form.Field.File = {
	uniqueId:0,
	type:'fileUploaderEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
//		var renderType = fieldMeta.renderType||'generate';
//		fieldMeta.renderType = 'rela';
		
		var field = $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form),{
			id: '_form_field_file_'+(++LUI.Form.Field.File.uniqueId),
			type:LUI.Form.Field.File.type,
			enable:function(){
				//按钮不可点击
				//
				if(!this.isValid){
					this.markInvalid();
				}
//				$('#'+this.form.name).find('#'+this.name).removeAttr('disabled');
			},
			disable:function(){
				//按钮可点击
				//
				if(!this.isValid){
					//disable状态下 不显示数据是否有效
					this.clearInvalid();
				}
//				$('#'+this.form.name).find('#'+this.name).attr('disabled','disabled');
			},
			formatRawValue:function(dataVal){
				return dataVal==null?'':(dataVal.shangChuanWJM);
			},
			displayRawValue:function (){
				if(this.inputEl!=null && this.inputEl.val() != this.rawValue){
					//将显示值 重新显示到页面
					this.inputEl.val(this.rawValue);
				}
			},
			render:function(){
				if(this.renderType != 'none'){
					if(this.createFieldEl(LUI.Template.Field.fileUpload)){
						var containerWidthStyle = this.el.css('width');
						this.inputEl.css('width',(parseInt(containerWidthStyle)  -30) +'px');
						
						var contextThis = this;
						
						var fieldInputEl = this.inputEl;
						//点击上传文件
						var fieldInputHandler = this.el.find('img#_handler').first();
						fieldInputHandler.click(function(){
							if(contextThis.getValue()!=null){
								contextThis.setValue(null);
							}else{
								LUI.Util.uploadFile({
									context:this,
									multiple:false
								},function(data){
									if(data!=null && data.length >0){
										var fuJian = data[0];
//										fieldInputEl.val(fuJian.shangChuanWJM);
										contextThis.setValue(fuJian);
									}
								});
							}
						});
						
						//将自定义onchange方法 绑定到当前对象的change事件
						if(this.onChangeFunction!=null){
							this.addListener(this.events.change,this._observer,this.onChangeFunction);
						}
						
						this.addListener(this.events.change,this._observer,function(eventSource,eventTarget,event,eventOriginal){
							if(contextThis.getValue()!=null){
								fieldInputHandler.attr('src','resources/nim/light-ui/images/file-uoload-remove.gif').attr( "title", "删除" );
							}else{
								fieldInputHandler.attr('src','resources/nim/light-ui/images/file-upload-icon.gif').attr( "title", "上传" );
							}
							if(contextThis.onChangeFunction!=null){
								contextThis.onChangeFunction.apply(eventTarget,[eventSource,eventTarget,event,eventOriginal]);
							}
						});
						this.rendered = true;
						//原值要重新显示出来
						this.displayRawValue();
					}
				}
				this.validate(this.value);
			}
		});
		return field;
	}
};

LUI.Form.Field.Grid = {
	uniqueId:0,
	type:'gridEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_grid_'+(++LUI.Form.Field.Grid.uniqueId),
			type:LUI.Form.Field.Grid.type
		});
	}
};

LUI.Form.Field.Tree = {
	uniqueId:0,
	type:'treeEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_tree_'+(++LUI.Form.Field.Tree.uniqueId),
			type:LUI.Form.Field.Tree.type
		});
	}
};

LUI.Form.Field.TreeGrid = {
	uniqueId:0,
	type:'treeGridEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_treegrid_'+(++LUI.Form.Field.TreeGrid.uniqueId),
			type:LUI.Form.Field.TreeGrid.type
		});
	}
};

LUI.Form.Field.TwinCol = {
	uniqueId:0,
	type:'twincolEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_twincol_'+(++LUI.Form.Field.TwinCol.uniqueId),
			type:LUI.Form.Field.TwinCol.type
		});
	}
};

LUI.Form.Field.FileSet = {
	uniqueId:0,
	type:'filesetEditor',
	createNew:function(fieldMeta,lui_form,createNotExistsEl){
		return $.extend(LUI.Form.Field.createNew(fieldMeta,lui_form,createNotExistsEl),{
			id: '_form_field_fileset_'+(++LUI.Form.Field.FileSet.uniqueId),
			type:LUI.Form.Field.FileSet.type
		});
	}
};
