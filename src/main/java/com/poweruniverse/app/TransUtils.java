package com.poweruniverse.app;

import java.text.SimpleDateFormat;

import net.sf.json.JSONArray;
import app.trans.wsclient.trans.TransWebservice;

import com.poweruniverse.nim.base.description.Application;
import com.poweruniverse.nim.base.description.RemoteComponent;
import com.poweruniverse.nim.base.description.RemoteWebservice;
import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.base.utils.NimJSONObject;
import com.poweruniverse.nim.data.entity.sys.ShiTiLei;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;
import com.poweruniverse.nim.data.service.utils.JSONConvertUtils;

public class TransUtils {
	public static SimpleDateFormat dtf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	
	//向数据交换平台 发送一条实体类数据 
	//发送的实体类代号 如果在数据交换平台中没有定义映射关系，会出错
	//发送的字段内容 如果在数据交换平台中没有定义映射关系，会被忽略
	public static JSONMessageResult sendEntity(String sourceXTDH,ShiTiLei stl,EntityI obj,JSONArray fields,String targetXTDH) throws Exception{
		JSONMessageResult result = null;
		try {
			//根据字段 将数据拼为json格式
			NimJSONObject jsonData = JSONConvertUtils.Entity2JSONObject(stl, obj, fields);
			
			RemoteComponent appTransCmp =  (RemoteComponent)Application.getInstance().getComponent("app-trans");
			RemoteWebservice appTransService = appTransCmp.getWebservice("trans");
			TransWebservice ws = (TransWebservice)appTransService.getServiceInstance();
			if(ws!=null){
				app.trans.wsclient.trans.JsonMessageResult asa = ws.sendRecord(sourceXTDH, stl.getShiTiLeiDH(), obj.pkValue(), jsonData.toString(), targetXTDH);
				if(asa.isSuccess()){
					result = new JSONMessageResult();
				}else{
					result = new JSONMessageResult(asa.getErrorMsg());
				}
			}else{
				result = new JSONMessageResult("传输失败，请检查目标服务器的webservice服务是否可以正常访问");
			}
		} catch (Exception e) {
			result = new JSONMessageResult(e.getMessage());
			e.printStackTrace();
		}
		
		return result;
	}

}
