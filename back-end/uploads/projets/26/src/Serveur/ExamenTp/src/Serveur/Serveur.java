package Serveur;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
public class Serveur {
	public static void main(String[] args) {
        try (DatagramSocket sr = new DatagramSocket(9876)) {
            
            int n = (int) (1 + (Math.random() * 900));
            System.out.println("Nombre genere" + n);


            while (true) {
                byte[] buffer=new byte[2];
    			DatagramPacket pr=new DatagramPacket(buffer, buffer.length);
    		    sr.receive(pr);
    		    String S= new String(buffer);
    		    System.out.println("entier reçu :"+S);
    		    int guess=Integer.parseInt(S);


                String response;
                if (guess < n) {
                    response = "plus grand";
                } else if (guess > n) {
                    response = "plus petit";
                } else {
                    response = "vous avez gagne";
                    break;
                }
                byte[] b;

                b = response.getBytes();
                InetAddress clientAddress = InetAddress.getLocalHost();
                int clientPort = pr.getPort();
                DatagramPacket packet = new DatagramPacket(b, b.length, clientAddress, clientPort);
                sr.send(packet);
                

               
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}