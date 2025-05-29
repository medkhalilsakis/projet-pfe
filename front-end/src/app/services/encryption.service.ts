import { Injectable } from '@angular/core';
import * as forge from 'node-forge';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private readonly PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4IlkG2zjcV8ZLgNjHBXE
zrUkB7oX4adtWrIyOfET+5Y1Ym5h+K4s3km1+nSCv6fXfyNJNddbY2j3oAWWzRY9
+2YmumEVKVVPm4LsUDnZ6Ngb6xUd5BcGl/gikcXY9olQHZ3h7/5z81hT5mXIElpK
dKVnnU5OhuzXqVTAcPUIqZi4Yef7EgQPx7VgrEf3wghCpFUKWh2CIxyN3egmZEdL
xUq4Y9JV5QsqGgglXg7zaox7SuQzGdQtEuugDCTM/n49/xF4CzR38H5ajDJl0hyG
04tslcJQVkrC65llNN41FRYw/MhMh5vv0P/dkEWLG2yDK3iHyPoFYkLojFyGdgv3
rwIDAQAB
-----END PUBLIC KEY-----`;

  encrypt(password: string): string {
    try {
      // Convertir la clé PEM en objet forge
      const publicKey = forge.pki.publicKeyFromPem(this.PUBLIC_KEY);
      
      // Convertir le mot de passe en buffer UTF-8
      const buffer = forge.util.createBuffer(password, 'utf8');
      
      // Chiffrer avec les bons paramètres OAEP
      const encrypted = publicKey.encrypt(buffer.getBytes(), 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: {
          md: forge.md.sha256.create(),
          saltLength: 32 
        }
      });
      
      return forge.util.encode64(encrypted);
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      throw new Error('Échec du chiffrement RSA');
    }
  }
}