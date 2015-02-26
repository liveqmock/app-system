//
var dengLuDH= $.cookie('dengLuDH');
var dengLuMM= $.cookie('dengLuMM');
if(dengLuDH!=null){
	$("#user-name").val(dengLuDH);
	$("#user-password").val(dengLuMM);
	
	$("#user-cookie").prop("checked", "checked");
}else{
	$("#user-cookie").prop("checked", "");
}

$("#user-password").keyup(function(event){
    if(event.keyCode == 13){
    	login();
    }
});

function login(){
	//取得用户名
	var userName = $("#user-name").val();
	if(userName==null || userName.length ==0){
		LUI.Message.info("提示","请输入登陆用户名!",null,{
			close: function( event, ui ) {
				$("#user-name")[0].focus();
			}
		});
		return ;
	}
	//取得用户密码
	var userPassword = $("#user-password").val();
	if(userPassword==null || userPassword.length ==0){
		LUI.Message.info("提示","请输入登陆密码!",null,{
			close: function( event, ui ) {
				$("#user-password")[0].focus();
			}
		});
		return ;
	}
	//是否记录登陆信息
	var saveLoginInfo = false;
	if ($("#user-cookie").is(':checked')) {
		saveLoginInfo = true;
	}
	
	LUI.Util.login(userName,userPassword,saveLoginInfo,function(result){
		if(result.success){
			window.location = homePageUrl;
		}else{
			LUI.Message.info("登陆失败",result.errorMsg,null,{
				close: function( event, ui ) {
					$("#user-password").val("");
				}
			});
		}
	});
}

/**背景图片切换js**/

    var ali=$('#lunbonum li');
    var aPage=$('#lunhuanback p');
    var iNow=0;
	
    ali.each(function(index){	
        $(this).mouseover(function(){
            slide(index);
        })
    });
	
    function slide(index){	
        iNow=index;
        ali.eq(index).addClass('lunboone').siblings().removeClass();
		aPage.eq(index).siblings().stop().animate({opacity:0},600);
		aPage.eq(index).stop().animate({opacity:1},600);	
    }
	
	function autoRun(){	
        iNow++;
		if(iNow==ali.length){
			iNow=0;
		}
		slide(iNow);
	}
	
	var timer=setInterval(autoRun,4000);
		
    ali.hover(function(){
		clearInterval(timer);
	},function(){
		timer=setInterval(autoRun,4000);
    });


function onHeaderLoad(){
	$('#header').find('.r-menu').hide();
  	$('#header').find('.headnav').hide();
}