package com.poweruniverse.app.system.servlet;

import javax.servlet.http.HttpServlet;

/**
 * 用于过滤客户端通过servlet方式对webservice的访问请求
 * 将请求转发到适当的服务类中
 * @author Administrator
 *
 */ 
public class TestServlet extends HttpServlet{
	private static final long serialVersionUID = 1L;
	
	public void init(){
		//esb 组件初始化  
		String contextPath = this.getServletContext().getRealPath("/");
		contextPath= contextPath+"asas";
		System.out.println("TestServlet 11111111111111111111111111111");
	}

}
