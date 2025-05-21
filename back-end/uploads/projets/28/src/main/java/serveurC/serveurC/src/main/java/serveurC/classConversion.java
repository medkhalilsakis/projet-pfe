 package serveurC;
 import java.rmi.RemoteException;
 import java.rmi.server.UnicastRemoteObject;
 import interfaceC.interfaceConversion;
 public class classConversion extends UnicastRemoteObject implements interfaceConversion{
 public classConversion( )throws RemoteException{super();}
 public float cm2inch(float v) throws RemoteException
 {return (float) (v/2.54);}
 public float inch2cm(float v) throws RemoteException
 {return (float) (v*2.54);}
 }