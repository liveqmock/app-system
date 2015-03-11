package com.poweruniverse.app.entity.nw.dm.base;
import java.io.Serializable;
import java.util.List;
import com.poweruniverse.nim.data.entity.Version;
import com.poweruniverse.nim.data.entity.system.base.EntityI;
/*
* 实体类：新闻类别
*/
@Version("2015-03-09 05:46:39")
public abstract class BaseXinWenLB  implements Serializable,Comparable<Object> ,EntityI {
	private static final long serialVersionUID = 1L;
	private int hashCode = Integer.MIN_VALUE;

	// constructors
	public BaseXinWenLB () {
		initialize();
	}

	/**
	 * Constructor for primary key
	 */
	public BaseXinWenLB (java.lang.Integer id) {
		this.setXinWenLBDM(id);
		initialize();
	}

	protected abstract void initialize ();
	
	// 主键：xinWenLBDM
	private java.lang.Integer xinWenLBDM = null;
	public java.lang.Integer getXinWenLBDM(){return this.xinWenLBDM ;}
	public void setXinWenLBDM(java.lang.Integer xinWenLBDM){this.xinWenLBDM = xinWenLBDM;}

			
	// 属性：xinWenLBMC （xinWenLBMC）
	private java.lang.String xinWenLBMC = null;
	public java.lang.String getXinWenLBMC(){return this.xinWenLBMC ;}
	public void setXinWenLBMC(java.lang.String xinWenLBMC){this.xinWenLBMC = xinWenLBMC;}
	
			
	// 属性：xinWenLBBH （xinWenLBBH）
	private java.lang.String xinWenLBBH = null;
	public java.lang.String getXinWenLBBH(){return this.xinWenLBBH ;}
	public void setXinWenLBBH(java.lang.String xinWenLBBH){this.xinWenLBBH = xinWenLBBH;}
	
	public boolean equals (Object obj) {
		if (null == obj) return false;
		if (!(obj instanceof com.poweruniverse.app.entity.nw.dm.XinWenLB)) return false;
		else {
			com.poweruniverse.app.entity.nw.dm.XinWenLB entity = (com.poweruniverse.app.entity.nw.dm.XinWenLB) obj;
			if (null == this.getXinWenLBDM() || null == entity.getXinWenLBDM()) return false;
			else return (this.getXinWenLBDM().equals(entity.getXinWenLBDM()));
		}
	}

	public int hashCode () {
		if (Integer.MIN_VALUE == this.hashCode) {
			if (null == this.getXinWenLBDM()) return super.hashCode();
			else {
				String hashStr = this.getClass().getName() + ":" + this.getXinWenLBDM().hashCode();
				this.hashCode = hashStr.hashCode();
			}
		}
		return this.hashCode;
	}
	
	public String toString() {
		return this.xinWenLBMC+"";
	}

	public Integer pkValue() {
		return this.xinWenLBDM;
	}

	public String pkName() {
		return "xinWenLBDM";
	}

	public void pkNull() {
		this.xinWenLBDM = null;;
	}
	
	public int compareTo(Object o) {
		com.poweruniverse.app.entity.nw.dm.XinWenLB obj = (com.poweruniverse.app.entity.nw.dm.XinWenLB)o;
		if(this.getXinWenLBDM()==null){
			return 1;
		}
		return this.getXinWenLBDM().compareTo(obj.getXinWenLBDM());
	}
	
	public com.poweruniverse.app.entity.nw.dm.XinWenLB clone(){
		com.poweruniverse.app.entity.nw.dm.XinWenLB xinWenLB = new com.poweruniverse.app.entity.nw.dm.XinWenLB();
		
		xinWenLB.setXinWenLBMC(xinWenLBMC);
		xinWenLB.setXinWenLBBH(xinWenLBBH);
		
		return xinWenLB;
	}
	
	
	
	
	
	
}