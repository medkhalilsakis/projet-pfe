import { Injectable } from '@angular/core';
import * as forge from 'node-forge';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBowND8P21noe1WzMY0NSLW
JOwQbFPOmgjavc4jjcRtXEy2fCtuHNT1s/Y8L5KIAZP3BSQxOrAxKW8MBYAQKSUb
DlCjKXPvu/wBzJOIbLFD9w1wiA6E9k+y8MQg+5kjEsff6hWtjSPIVFnIwMJVHMbh
Fv7IivP4C5Ruhq64wJLimvDQk/7eoGuQeN/Xp5q1PIfEM6wISWY4mI6oe/jFnxta
2fnA1WmUYgh5tAd3Qid1exYkgBXSMcrNKf1iGBsV1f5dryvvspqbb0b+JRp4qyQm
+ZhZXZzo7G46na6LfdmsyUe0Rqm6FcJwxDYKkjUF+mmJ7jUUmI7Eqv+18bzwf38n
AgMBAAE=
-----END PUBLIC KEY-----`.trim();

encrypt(password: string): string {
  try {
    const publicKey = forge.pki.publicKeyFromPem(this.publicKey);
    const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: {
        md: forge.md.sha256.create()
      }
    });
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error('Erreur de chiffrement:', error);
    throw new Error('Échec du chiffrement RSA');
  }
}
}