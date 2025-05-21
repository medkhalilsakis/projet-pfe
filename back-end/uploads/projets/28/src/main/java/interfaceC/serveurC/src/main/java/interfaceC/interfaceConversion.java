package interfaceC;
import java.rmi.Remote;
import java.rmi.RemoteException;
public interface interfaceConversion extends Remote{
public float cm2inch(float v) throws RemoteException;
public float inch2cm(float v) throws RemoteException;
}