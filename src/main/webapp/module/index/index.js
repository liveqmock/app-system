function onIndexPageLoaded(){
 	//设置：点击 左侧菜单中的cmp_menu_item_title 打开对应的子页面
	$('ul#cmp_menu span.cmp_menu_item_title').click(function(){
		var pageUrl = $(this).attr('href');
		LUI.Page.include(pageUrl,{},'#rightContent',false);
	});
 	//设置：点击 左侧菜单中的cmp_menu_grp_title 显示子菜单
	$('ul#cmp_menu span.cmp_menu_grp_title').click(function(){
		$(this).closest('li').find('ul.cmp_submenu').toggle();
	});

	//默认打开第一个链接
	$('ul#cmp_menu span.cmp_menu_item_title').eq(0).click();
	
}
