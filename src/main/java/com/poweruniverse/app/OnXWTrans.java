package com.poweruniverse.app;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import com.poweruniverse.nim.base.message.JSONMessageResult;
import com.poweruniverse.nim.data.action.OnAction;
import com.poweruniverse.nim.data.entity.sys.GongNengCZ;
import com.poweruniverse.nim.data.entity.sys.YongHu;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;

public class OnXWTrans extends OnAction {

	@Override
	public JSONMessageResult invoke(YongHu yongHu, GongNengCZ gongNengCZ, EntityI entity,JSONObject jsonObj) throws Exception {
		
		JSONArray fields = new JSONArray();
		
		JSONObject field1 = new JSONObject();
		field1.put("name", "xinWenBT");
		fields.add(field1);
		
		JSONObject field2 = new JSONObject();
		field2.put("name", "xinWenNR");
		fields.add(field2);
		
		JSONObject field3 = new JSONObject();
		field3.put("name", "xinWenLB");
		fields.add(field3);
		
		
		JSONMessageResult ret = TransUtils.sendEntity("app-system", gongNengCZ.getGongNeng().getShiTiLei(), entity, fields, "app-message");
		return ret;
	}

}
