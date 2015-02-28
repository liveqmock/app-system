function onsqPageLoaded(){
	$('#yhxzmc').keydown(function(event) {
		if (event.keyCode == 13) {
			searchBy();
		}
	});
	var grid = LUI.Grid.getInstance('authedUserSelectGrid');
	grid.addListener(grid.events.rowSelect,this,function(source,target,event){
		$(event.params.rowEl).addClass('sqyhxz_yh_row_selected');
	});
	grid.addListener(grid.events.rowUnselect,this,function(source,target,event){
		$(event.params.rowEl).removeClass('sqyhxz_yh_row_selected');
	});
}

function onTreeRendered(treeObj){
	var fRootNode = treeObj.getFirstRootNode();
	fRootNode.expand();
	
	fRootNode.select();
}

function onQxyhFieldFocus(focus){
	var yhxzmcEl = $('#yhxzmc');
	if(focus){
		if(yhxzmcEl.val()=='搜索关键字  姓名'){
			yhxzmcEl.val('');
		}
		yhxzmcEl.removeClass('nim-manager-search-field-nofocus');
	}else{
		if(yhxzmcEl.val()==''){
			yhxzmcEl.val('搜索关键字  姓名');
		}
		yhxzmcEl.addClass('nim-manager-search-field-nofocus');
	}
}


function onNodeSelected(){
    //清除关键字
  	$('#yhxzmc').val('搜索关键字  姓名');
  	//按部门搜索
  	searchBy();
}

//按部门树中当前选择的部门和输入的关键字 进行搜索
function searchBy(){
	var filters = [];
	var selectedNode = LUI.Tree.getInstance('authedUserSelectTree').getSelectNode();
	if(selectedNode!=null){
		var cBuMenBH = selectedNode.getData().getFieldValue('buMenBH');
	  	filters[filters.length] = {property:'suoShuBM.buMenBH',operator:'like',value:cBuMenBH}
	}
	
	var searchString = $('#yhxzmc').val();
	if(searchString!=null && searchString!='搜索关键字  姓名'){
		filters[filters.length] = {property:'yongHuMC',operator:'like',value:searchString}
	}
	
	LUI.Datasource.getInstance('authedUserSelectDatasource').load({
      filters:filters
    });
}