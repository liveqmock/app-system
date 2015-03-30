package com.poweruniverse.app;


/**
 * 解析客户端保存的json数据 插入到数据接口表中
 *
 */
public class TransUtils2 {
//	public static SimpleDateFormat dtf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
//	public static final String ShiTiLei_FuJian_DH = "SYS_FuJian";
//	public static final String Source_XiTong_DH = "gys";
//
//	/**
//	 * 发送一个功能操作/流程动作
//	 * @param yongHuDM
//	 * @param sourceSTLDH
//	 * @param sourceId
//	 * @param targetXTDH
//	 * @param targetSTLDH
//	 * @param targetId
//	 * @param jsonData
//	 * @return
//	 */
//	public static TransInfo createTaskTrans(Integer yongHuDM,TransGNCZMap transGNCZMap,TransSTLMap transSTLMap,Integer sourceId) throws Exception{
//		Session sess = com.poweruniverse.oim.server.util.HibernateSessionFactory.getSession();
//		//查找本系统是否曾经向目标系统传输过此条数据(查找已完成的记录 获取目标代码) （可能有多次传输 多条记录 取最后一条 作为本次task的依赖数据）
////		TransInfo hisTrans = (TransInfo)sess.createCriteria(TransInfo.class)
////				.add(Restrictions.eq("sourceXTDH", Source_XiTong_DH))
////				.add(Restrictions.eq("sourceSTLDH", transSTLMap.getSourceSTLDH()))
////				.add(Restrictions.eq("sourceZJZ", sourceId))
////				.add(Restrictions.eq("targetXTDH", transSTLMap.getTargetXTDH()))
////				.addOrder(Order.desc("xinXiCSJLDM"))
////				.setMaxResults(1)
////				.uniqueResult();
////		if(hisTrans==null){
////			throw new Exception("关联的业务数据未传输:"+Source_XiTong_DH+"."+transSTLMap.getSourceSTLDH()+"."+sourceId);
////		}
//		
//		//此实体类操作的映射关系
//		TransInfo transInfo = new TransInfo();
//		transInfo.setSourceXTDH(Source_XiTong_DH);
//		transInfo.setSourceSTLDH(transSTLMap.getSourceSTLDH());
//		transInfo.setSourceZJZ(sourceId);
//		transInfo.setChuangJianSJ(Calendar.getInstance().getTime());//创建时间
//		
//		transInfo.setShiFouCSWC(false);//未传输完成
//		transInfo.setShuJuLBMC("json");//传输内容是json 只有 json|file
//		transInfo.setXinXiLBMC("task");//传输的是data  data|file|task
//		transInfo.setTargetLBMC("gn");//传输目标是stl  stl|gn|file
//
//		transInfo.setTargetXTDH(transGNCZMap.getTargetXTDH());
//		transInfo.setTargetGNDH(transGNCZMap.getTargetGNDH());
//		transInfo.setTargetCZDH(transGNCZMap.getTargetCZDH());
//		transInfo.setTargetZJZ(null);
//		
//		//只传输主键值
//		JSONObject jsonData = new JSONObject();
//		jsonData.put(transSTLMap.getTargetZJDH(), encodeOutputPKValue(transSTLMap.getSourceSTLDH(),sourceId));
//		
//		transInfo.setJsonData("["+jsonData.toString()+"]");
//		
//		//对数据传输的依赖
////		TransDepend transDepend = new TransDepend();
////		transDepend.setXinXiCSYL(hisTrans);
////		transInfo.addToyls(transInfo, transDepend);
//				
//		return transInfo;
//	}
//
//	
//	/**
//	 * 创建数据输出记录
//	 * @param yongHuDM
//	 * @param sourceSTLDH
//	 * @param sourceId
//	 * @param targetXTDH
//	 * @return
//	 * @throws Exception
//	 */
//	public static TransInfo createEntityTrans(Integer yongHuDM,ShiTiLei stl,TransSTLMap transSTLMap,EntityI sourceObj) throws Exception{
//		Session sess = com.poweruniverse.oim.server.util.HibernateSessionFactory.getSession();
//		
//		//创建本系统需要向外传输的数据传输记录
//		TransInfo transInfo = new TransInfo();
//		transInfo.setSourceXTDH(Source_XiTong_DH);
//		transInfo.setSourceSTLDH(stl.getShiTiLeiDH());
//		transInfo.setChuangJianSJ(Calendar.getInstance().getTime());//创建时间
//		
//		transInfo.setSourceZJDH(stl.getZhuJianLie());//源数据的主键列代号
//		transInfo.setSourceZJZ(sourceObj.pkValue());
//		
//		transInfo.setShiFouCSWC(false);//未传输完成
//		transInfo.setShuJuLBMC("json");//传输内容是json 只有 json|file
//		transInfo.setXinXiLBMC("data");//传输的是data  data|file|task
//		transInfo.setTargetLBMC("stl");//传输目标是stl  stl|gn|file
//		//查找本系统是否曾经向目标系统传输过此条数据(查找已完成的记录 获取目标代码) （可能有多次传输 多条记录 取任意一条已完成的即可）
//		TransInfo hisTrans = (TransInfo)sess.createCriteria(TransInfo.class)
//				.add(Restrictions.eq("sourceXTDH", Source_XiTong_DH))
//				.add(Restrictions.eq("sourceSTLDH", stl.getShiTiLeiDH()))
//				.add(Restrictions.eq("sourceZJZ", sourceObj.pkValue()))
//				.add(Restrictions.eq("targetXTDH", transSTLMap.getTargetXTDH()))
//				.add(Restrictions.eq("shiFouCSWC", true))
//				.setMaxResults(1)
//				.uniqueResult();
//		//已传输完成的数据 一定是有主键值的
//		Integer targetId = null;
//		if(hisTrans!=null){
//			targetId = hisTrans.getTargetZJZ();
//		}
//		transInfo.setTargetXTDH(transSTLMap.getTargetXTDH());
//		transInfo.setTargetSTLDH(transSTLMap.getTargetSTLDH());
//		transInfo.setTargetZJZ(targetId);
//		//准备数据
//		JSONObject jsonData = new JSONObject();
//		//根据字段映射 将数据拼为json格式
//		for(TransZDMap zdMap:transSTLMap.getZds()){
//			Object value = PropertyUtils.getProperty(sourceObj, zdMap.getSourceZDDH());
//			if(value == null){
//				//空值直接传递
//				jsonData.put(zdMap.getTargetZDDH(), JSONNull.getInstance());
//			}else{
//				//根据源字段类型 确定如何传递此数据
//				Integer zdlxdm = zdMap.getSourceZDLX().getZiDuanLXDM();
//				if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_OBJECT)){
//					//对象类型的数据 （不会自动级联传输关联的对象 此对象必须已存在）
//					ZiDuan subZd = stl.getZiDuan(zdMap.getSourceZDDH());
//					EntityI subObj = (EntityI)value;
//					//在数据传输表中 查找对应的子表传输记录(取最后一条)
//					TransInfo dependTrans = (TransInfo)sess.createCriteria(TransInfo.class)
//							.add(Restrictions.eq("sourceXTDH", Source_XiTong_DH))
//							.add(Restrictions.eq("sourceSTLDH", subZd.getGuanLianSTL().getShiTiLeiDH()))
//							.add(Restrictions.eq("sourceZJZ", subObj.pkValue()))
//							.add(Restrictions.eq("targetXTDH", transSTLMap.getTargetXTDH()))
//							.addOrder(Order.desc("xinXiCSJLDM"))
//							.setMaxResults(1)
//							.uniqueResult();
//					if(dependTrans!=null){
//						//如果关联对象已通过接口传输 无论是否附件、是否传输完成，仅记录依赖关系即可
//						TransDepend subTransDepend = new TransDepend();
//						subTransDepend.setXinXiCSYL(dependTrans);
//						transInfo.addToyls(transInfo, subTransDepend);
//						//子表的映射关系
//						TransSTLMap transSubMap = (TransSTLMap)sess.createCriteria(TransSTLMap.class)
//								.add(Restrictions.eq("sourceXTDH", transSTLMap.getSourceXTDH()))
//								.add(Restrictions.eq("sourceSTLDH", subZd.getGuanLianSTL().getShiTiLeiDH()))
//								.add(Restrictions.eq("targetXTDH", transSTLMap.getTargetXTDH()))
//								.uniqueResult();
//						jsonData.put(
//							zdMap.getTargetZDDH(), 
//							JSONObject.fromObject("{"+
//									transSubMap.getTargetZJDH()+":'"+encodeOutputPKValue(subZd.getGuanLianSTL().getShiTiLeiDH(),subObj.pkValue())+"'"
//							+ "}")
//						);
//					}else {
//						//对象类型字段的关联对象 必须已经先通过接口传输了
//						throw new Exception("生成待传输JSON数据：处理源数据("+zdMap.getXinXiCSSTLYS().getSourceSTLDH()+")中字段("+zdMap.getSourceZDDH()+")的值失败，未发现主键值为"+subObj.pkValue()+"的子表数据的传输记录");
//					}
//					
//				}else if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_SET)){
//					//集合类型的数据 （不级联传输）
//				}else if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_STRING) || zdlxdm.equals(ZiDuanLX.ZiDuanLX_TEXT)){
//					jsonData.put(zdMap.getTargetZDDH(), value.toString());
//				}else if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_DOUBLE) || zdlxdm.equals(ZiDuanLX.ZiDuanLX_INT) ){
//					jsonData.put(zdMap.getTargetZDDH(), value);
//				}else if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_DATE) || zdlxdm.equals(ZiDuanLX.ZiDuanLX_MONTH)){
//					jsonData.put(zdMap.getTargetZDDH(),dtf.format((Date)value));
//				}else if(zdlxdm.equals(ZiDuanLX.ZiDuanLX_BOOLEAN)){
//					jsonData.put(zdMap.getTargetZDDH(), value);
//				}else{
//					throw new Exception("未处理的字段类型！");
//				}
//			}
//		}
//		
//		transInfo.setJsonData(jsonData.toString());
//		return transInfo;
//	}
//	
//	/**
//	 * 创建附件输出记录
//	 * @param yongHuDM
//	 * @param sourceSTLDH
//	 * @param sourceId
//	 * @param targetXTDH
//	 * @return
//	 * @throws Exception
//	 */
//	public static TransInfo createFuJianTrans(Integer yongHuDM,Integer  fuJianId,String targetXTDH) throws Exception{
//		if(fuJianId == null){
//			throw new Exception("生成待传输附件数据：必须提供附件的主键值");
//		}
//		
//		Session sess = com.poweruniverse.oim.server.util.HibernateSessionFactory.getSession();
//		//查找本系统是否曾经向目标系统传输过此条附件
//		TransInfo transInfo = (TransInfo)sess.createCriteria(TransInfo.class)
//				.add(Restrictions.eq("sourceXTDH", Source_XiTong_DH))
//				.add(Restrictions.eq("sourceSTLDH", ShiTiLei_FuJian_DH))
//				.add(Restrictions.eq("sourceZJZ", fuJianId))
//				.add(Restrictions.eq("targetXTDH", targetXTDH))
//				.setMaxResults(1)
//				.uniqueResult();
//		if(transInfo == null){
//			//之前没有传输过 新增待传输记录
//			transInfo = new TransInfo();
//			transInfo.setSourceXTDH(Source_XiTong_DH);
//			transInfo.setChuangJianSJ(Calendar.getInstance().getTime());//创建时间
//			transInfo.setSourceSTLDH(ShiTiLei_FuJian_DH);
//			transInfo.setSourceZJDH("fuJianDM");
//			transInfo.setSourceZJZ(fuJianId);
//			
//			transInfo.setTargetLBMC("fj");//传输目标是stl  stl|gn|fj
//			transInfo.setTargetXTDH(targetXTDH);
//			transInfo.setTargetZJZ(null);
//			
//			transInfo.setShuJuLBMC("file");//传输内容是json json|table|file
//			transInfo.setXinXiLBMC("file");//传输的是数据  data|file
//			
//		}
//		return transInfo;
//	}
//	
//	private static String encodeOutputPKValue(String shiTiLeiDH,Integer id){
//		return "${"+shiTiLeiDH+"_"+id+"?c}";
//	}
//	
//	public static String processTemplate(String templateString,Map<String, Object> root,File basePath ) throws Exception{
//		Configuration cfg = new Configuration();
//		cfg.setEncoding(Locale.CHINA, "UTF-8");
//		if(basePath!=null){
//			cfg.setDirectoryForTemplateLoading(basePath);
//		}
//		
//		Properties p = new Properties();
//		p.load(PageService.class.getResourceAsStream("/freemarker.properties"));
//		cfg.setSettings(p);
//		
//		Template t = new Template("name", new StringReader(templateString),cfg);
//		StringWriter writer = new StringWriter();
//		t.process(root, writer);
//		return writer.toString();
//	}
//
//	
//	public static void main(String[] args) {
////		Session sess = com.poweruniverse.oim.server.util.HibernateSessionFactory.getSession();
////
////		try {
////			sess = com.poweruniverse.oim.server.util.HibernateSessionFactory.getSession();
////			//插入 供应商对口事业部 信息
////			List<DuiKouSYB> dksybs = (List<DuiKouSYB>)sess.createCriteria(DuiKouSYB.class).list();
////			for(DuiKouSYB dksyb:dksybs ){
////				TransInfo transInfo = outputTableData(1, "HDGC_GYS_DuiKouSYB", dksyb.getDuiKouSYBDM(), "eop", null);
////				
////				transInfo.setShiFouCSWC(true);
////				transInfo.setTargetZJZ(dksyb.getDuiKouSYBDM());
////				sess.update(transInfo);
////			}
////			
////			//插入 企业类型 信息
////			List<QiYeLX> qiYeLXs = (List<QiYeLX>)sess.createCriteria(QiYeLX.class).list();
////			for(QiYeLX qiYeLX:qiYeLXs ){
////				TransInfo transInfo = outputTableData(1, "HDGC_GYS_QiYeLX", qiYeLX.getQiYeLXDM(), "eop", null);
////				
////				transInfo.setShiFouCSWC(true);
////				transInfo.setTargetZJZ(qiYeLX.getQiYeLXDM());
////				sess.update(transInfo);
////			}
////			
////			
////			//插入 申请资料采用标准 信息
////			List<ShenQingCYBZ> shenQingCYBZs = (List<ShenQingCYBZ>)sess.createCriteria(ShenQingCYBZ.class).list();
////			for(ShenQingCYBZ shenQingCYBZ:shenQingCYBZs ){
////				TransInfo transInfo = outputTableData(1, "HDGC_GYS_ShenQingCYBZ", shenQingCYBZ.getShenQingCYBZDM(), "eop", null);
////				
////				transInfo.setShiFouCSWC(true);
////				transInfo.setTargetZJZ(shenQingCYBZ.getShenQingCYBZDM());
////				sess.update(transInfo);
////			}
////			
////		} catch (Exception e) {
////			e.printStackTrace();
////			if(sess !=null){
////				HibernateSessionFactory.closeSession(false);
////				sess = null;
////			}
////		}finally{
////			if(sess !=null){
////				HibernateSessionFactory.closeSession(true);
////			}
////		}
//
//	}

}
