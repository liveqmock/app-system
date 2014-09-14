$.widget("ui.autocomplete", $.extend({}, $.ui.autocomplete.prototype, {
	_resizeMenu: function() {
		var parentCombo = this.element.data('combo');
		this.menu.element.outerWidth( 500 );
		var ul = this.menu.element;
		ul.css('max-height',parentCombo.options.height);
		ul.outerWidth( Math.max(
			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			parentCombo.wrapper.outerWidth(),
			parentCombo.input.outerWidth() + parentCombo.trigger.outerWidth()
		) );
	}
}));


(function( $ ) {
	$.widget( "custom.combobox", {
		_create: function() {
			this._field = this.options.getObjectField();
			this.wrapper = $( "<span>" )
			.addClass( "custom-combobox" )
			.insertAfter( this.element );
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
			
			this.wrapper.css('width',this.options.width);
			this.input.outerWidth( parseInt(this.options.width) - this.trigger.outerWidth() );
		},
		_createAutocomplete: function() {
			this.input = $( "<input>" )
				.appendTo( this.wrapper )
				.attr( "title", "" )
//				.css('width',this.options.width)
				.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" );
			this.options.appendTo = this.wrapper;
			//将
			this.input
				.autocomplete(this.options)
				.data('combo',this)
				.tooltip({
					tooltipClass: "ui-state-highlight"
				});
			if(!this.options.disabled){
				this._on( this.input, {
//					autocompleteselect: function( event, ui ) {
//						 ui.item.option.selected = true;
//						 this._trigger( "select", event, {
//							 item: ui.item.option
//						 });
//					},
					autocompletechange: "_removeIfInvalid"
				});
			}else{
				this.input.attr("disabled","true");
			}
			
		},
		_createShowAllButton: function() {
			var input = this.input,
			wasOpen = false;
			var is_disabled = this.options.disabled;
			this.trigger = $( "<a>" )
				.attr( "tabIndex", -1 )
				.tooltip()
				.appendTo( this.wrapper )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "custom-combobox-toggle ui-corner-right" )
				.mousedown(function() {
					wasOpen = input.autocomplete( "widget" ).is( ":visible" );
				})
				.click(function() {
					if(!is_disabled){
						input.focus();
						// Close if already visible
						if ( wasOpen ) {
							return;
						}
						//点击下箭头 认为是按空字符串进行搜索
						input.autocomplete( "search", "search all" );
					}
					
				});
		},
		_removeIfInvalid: function( event, ui ) {
			// Selected an item, nothing to do
			if ( ui.item ) {
				return;
			}
			// Search for a match (case-insensitive)
			var vText = this.input.val();
			if(vText==null || vText.length ==0){
				//当前字段置为null
				this.input.val( "" );
				this._field.setValue(null);
			}else{
				var valObj = this._field.parseRawValue(vText);
				if(valObj==null){
					this.input.val( "" );
					this._field.setValue(null);
				}else{
					this.input.val(this._field.formatRawValue(valObj));
					this._field.setValue(valObj);
				}
			}
		},
		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
})( jQuery );