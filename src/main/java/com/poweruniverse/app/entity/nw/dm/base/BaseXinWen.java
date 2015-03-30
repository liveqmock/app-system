package com.poweruniverse.app.entity.nw.dm.base;
import java.io.Serializable;
import java.util.List;
import com.poweruniverse.nim.data.entity.Version;
import com.poweruniverse.nim.data.entity.sys.base.EntityI;
/*
* 实体类：新闻
*/
@Version("2015-03-30 10:54:36")
public abstract class BaseXinWen  implements Serializable,Comparable<Object> ,EntityI {
	private static final long serialVersionUID = 1L;
	private int hashCode = Integer.MIN_VALUE;

	// constructors
	public BaseXinWen () {
		initialize();
	}

	/**
	 * Constructor for primary key
	 */
	public BaseXinWen (java.lang.Integer id) {
		this.setXinWenDM(id);
		initialize();
	}

	protected abstract void initialize ();
	
	// 主键：xinWenDM
	private java.lang.Integer xinWenDM = null;
	public java.lang.Integer getXinWenDM(){return this.xinWenDM ;}
	public void setXinWenDM(java.lang.Integer xinWenDM){this.xinWenDM = xinWenDM;}

			
	// 属性：新闻标题 （xinWenBT）
	private java.lang.String xinWenBT = null;
	public java.lang.String getXinWenBT(){return this.xinWenBT ;}
	public void setXinWenBT(java.lang.String xinWenBT){this.xinWenBT = xinWenBT;}
	
			
	// 属性：新闻序号 （xinWenXH）
	private java.lang.Integer xinWenXH = new java.lang.Integer(0);
	public java.lang.Integer getXinWenXH(){return this.xinWenXH ;}
	public void setXinWenXH(java.lang.Integer xinWenXH){this.xinWenXH = xinWenXH;}
	
			
	// 属性：新闻内容 （xinWenNR）
	private java.lang.String xinWenNR = null;
	public java.lang.String getXinWenNR(){return this.xinWenNR ;}
	public void setXinWenNR(java.lang.String xinWenNR){this.xinWenNR = xinWenNR;}
	
	// 对象：新闻类别 （xinWenLB）
	private com.poweruniverse.app.entity.nw.dm.XinWenLB xinWenLB;
	public com.poweruniverse.app.entity.nw.dm.XinWenLB getXinWenLB(){return this.xinWenLB ;}
	public void setXinWenLB(com.poweruniverse.app.entity.nw.dm.XinWenLB xinWenLB){this.xinWenLB = xinWenLB;}

	public boolean equals (Object obj) {
		if (null == obj) return false;
		if (!(obj instanceof com.poweruniverse.app.entity.nw.dm.XinWen)) return false;
		else {
			com.poweruniverse.app.entity.nw.dm.XinWen entity = (com.poweruniverse.app.entity.nw.dm.XinWen) obj;
			if (null == this.getXinWenDM() || null == entity.getXinWenDM()) return false;
			else return (this.getXinWenDM().equals(entity.getXinWenDM()));
		}
	}

	public int hashCode () {
		if (Integer.MIN_VALUE == this.hashCode) {
			if (null == this.getXinWenDM()) return super.hashCode();
			else {
				String hashStr = this.getClass().getName() + ":" + this.getXinWenDM().hashCode();
				this.hashCode = hashStr.hashCode();
			}
		}
		return this.hashCode;
	}
	
	public String toString() {
		return this.xinWenBT+"";
	}

	public Integer pkValue() {
		return this.xinWenDM;
	}

	public String pkName() {
		return "xinWenDM";
	}

	public void pkNull() {
		this.xinWenDM = null;;
	}
	
	public int compareTo(Object o) {
		com.poweruniverse.app.entity.nw.dm.XinWen obj = (com.poweruniverse.app.entity.nw.dm.XinWen)o;
		if(this.getXinWenDM()==null){
			return 1;
		}
		return this.getXinWenDM().compareTo(obj.getXinWenDM());
	}
	
	public com.poweruniverse.app.entity.nw.dm.XinWen clone(){
		com.poweruniverse.app.entity.nw.dm.XinWen xinWen = new com.poweruniverse.app.entity.nw.dm.XinWen();
		
		xinWen.setXinWenBT(xinWenBT);
		xinWen.setXinWenXH(xinWenXH);
		xinWen.setXinWenNR(xinWenNR);
		xinWen.setXinWenLB(xinWenLB);
		
		return xinWen;
	}
	
	
	
	
	
	
}