package com.poweruniverse.app;


import net.sf.json.JSONNull;
import net.sf.json.JSONObject;
import net.sf.json.JSONString;
import net.sf.json.util.JSONBuilder;
import net.sf.json.util.JSONStringer;
import net.sf.json.util.JSONUtils;

public class TestJson {

	public static void main(String[] args) {
		JSONObject jo1 = JSONObject.fromObject("{'value':'null'}");
		Object value =  jo1.get("value");
		System.out.println(jo1+"value:"+value);
		
		JSONObject jo2 = JSONObject.fromObject("{'value':\"null\"}");
		Object value2 =  jo2.get("value");
		System.out.println(jo2+"value:"+value2);
		
		JSONObject jo3 = new JSONObject();
		jo3.put("type", "null");
		Object type3 =  jo3.get("type");
		System.out.println(jo3+" type:"+type3);
		
		
		JSONObject jo5 = new JSONObject();
		jo5.put("type", null);
		Object type5 =  jo5.get("type");
		System.out.println(jo5+" type:"+type5);
		
		JSONObject jo6 = new JSONObject();
		jo6.put("type", JSONNull.getInstance());
		Object type6 =  jo6.get("type");
		System.out.println(jo6+"type:"+type6);
		
		String aa = new JSONStringer().object().key("type").value("\'null\'").endObject().toString();
		System.out.println("aa:"+aa);
		
	}

}
