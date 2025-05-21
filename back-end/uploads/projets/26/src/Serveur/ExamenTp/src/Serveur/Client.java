package Serveur;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Scanner;

public class Client {
    public static void main(String[] args) {
        try {
        	DatagramSocket se=new DatagramSocket();
    		DatagramSocket sr=new DatagramSocket(2020);

        	
        
            InetAddress serverAddress =InetAddress.getLocalHost();;
            int serverPort = 9876;
            byte[] buffer = new byte[2048];


            Scanner sc = new Scanner(System.in);


            System.out.println("Devinez le nombre généré par le serveur (entre 1 et 900) :");

            while (true) {
                System.out.print("Votre tentative : ");
                int n = sc.nextInt();
                String be=Integer.toString(n);
                int l=be.length();
			    byte[] b=new byte[l];



                b = be.getBytes();
                DatagramPacket pe = new DatagramPacket(b, b.length, serverAddress, serverPort);
                se.send(pe);

                DatagramPacket rp = new DatagramPacket(buffer, buffer.length);
                sr.receive(rp);

                DatagramPacket pr=new DatagramPacket(buffer, buffer.length);
    		    sr.receive(pr);
    		    String s= new String(buffer);
                if (s=="vous avez gagne") {
                	se.close();
        	 	    sr.close();

                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
