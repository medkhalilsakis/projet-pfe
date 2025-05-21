 package serveurC;
 import java.rmi.Naming;
 import java.rmi.registry.LocateRegistry;
 public class serveurConversion {
 public static void main(String[] args)
 {
 try {
 LocateRegistry.createRegistry(1099);
 classConversion c=new classConversion();
 Naming.rebind("MonObjet", c);
 } catch (Exception e) {
 // TODO Auto-generated catch block
 e.printStackTrace();
 }
 }
 }