package com.poweruniverse.app;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import app.trans.wsclient.trans.TransWebservice;
import app.trans.wsclient.utils.AppTransClientUtils;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.utils.NimJSONObject;
import com.poweruniverse.nim.data.action.OnAction;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.ShiTiLei;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;
import com.poweruniverse.nim.data.service.utils.JSONConvertUtils;

public class OnXWLBTrans extends OnAction {

	@Override
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
		JSONMessageResult ret = null;
		
		ShiTiLei stl  = gongNengCZ.getGongNeng().getShiTiLei();
		JSONArray fields = JSONArray.fromObject("[{name:'xinWenLBBH'},{name:'xinWenLBMC'}]");
		NimJSONObject jsonData = JSONConvertUtils.Entity2JSONObject(stl, entity, fields);

		//取得数据平台接口 ：数据平台ip、webservice端口号、数据平台用户名、数据平台密码
		TransWebservice transPort = AppTransClientUtils.getTransServicePort("127.0.0.1", "1091", "faSong", "faSong");
		if(transPort!=null){
//			//数据传输 -> app-message
//			app.trans.wsclient.trans.JsonMessageResult setResult = transPort.sendRecord("app-system", stl.getShiTiLeiDH(), entity.pkValue(), jsonData.toString(), "app-message");
			//数据传输 -> oim-xny 
			app.trans.wsclient.trans.JsonMessageResult setResult = transPort.sendRecord("app-system", stl.getShiTiLeiDH(), entity.pkValue(), jsonData.toString(), "xny");
			if(setResult.isSuccess()){
				ret = new JSONMessageResult();
			}else{
				ret = new JSONMessageResult(setResult.getErrorMsg());
			}
		}else{
			ret = new JSONMessageResult("传输失败，请检查目标服务器的webservice服务是否可以正常访问");
		}
		return ret;
	}

}
