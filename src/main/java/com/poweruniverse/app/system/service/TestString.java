package com.poweruniverse.app.system.service;

public class TestString {
	
	public static void main(String[] args) {
		String aa = "resources/light-ui/widget/light-ui-forms.js".replaceAll("/", "_").replaceAll("\\.", "_").replaceAll("-", "_");
		System.out.println(aa);
	}
}
