package com.projet.pp.service;

import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.stream.Collectors;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

public class PasswordUtil {

    private static final String PRIVATE_KEY_PEM = """
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDgiWQbbONxXxku
A2McFcTOtSQHuhfhp21asjI58RP7ljVibmH4rizeSbX6dIK/p9d/I0k111tjaPeg
BZbNFj37Zia6YRUpVU+bguxQOdno2BvrFR3kFwaX+CKRxdj2iVAdneHv/nPzWFPm
ZcgSWkp0pWedTk6G7NepVMBw9QipmLhh5/sSBA/HtWCsR/fCCEKkVQpaHYIjHI3d
6CZkR0vFSrhj0lXlCyoaCCVeDvNqjHtK5DMZ1C0S66AMJMz+fj3/EXgLNHfwflqM
MmXSHIbTi2yVwlBWSsLrmWU03jUVFjD8yEyHm+/Q/92QRYsbbIMreIfI+gViQuiM
XIZ2C/evAgMBAAECggEASmv/bD+pGzikBeZFgVeNxd2wNYduxvJRgpAxqZbIQslE
pH1lp6FDaeIQmRTpCVE+UfuGFnxs5AQ0nyt7EjrfDGaNS5VGCE8odajtXqHuIgkP
J9n18FXZb6FlA+AJy50zmr1r17oFAJE0LddqevrGVudD8pWz3XC/Anb+2fG9j0ha
R/L2TpiauRKo1fpUgFl86AyiW8OYJ5cY3uDMLn2gHVsmYOwvy27VgCodavk51WDR
bvoc3U5uTU8/9C01R6JOX/w6igM5yOM+V7y/sLtXpyHYYMza6hlJXroFmK6FcS+n
ynvU7KF22EHey7IOlP6cwFWzDBMCMCk6hAjQZcKToQKBgQD2IpXDVyrDZ8nXE1P4
EgB/Go7L1Wb+bs6fzCxpvp1Ww94i7KrtvXvOk15DBuFhWRKRDB+JvuqJV3oM829l
u6mlta+r8lUvDBRqgqMUvhhvjv9aCVNHaCoR4iqXdlLMKhY3LV7Oo3x+b64nqiMl
ZWYOww1u0e2eMTbiH6JnY47g2QKBgQDpiTNEOjyuDhEWJCu2xpxupHYxmNe/+9+d
Pv4lc0W0SvMOngnpX3ZEdlVvif0TjtEd1/VuUVPmfLQ9qPJjCDEV8Bz3CjbN/nJ6
sQQRib0jkOXt44Mw6w+oAlhiXz9Sk5ZYNW4SSTZiHBV/tx/lQzjyJU6/2OyylH+D
T2/MWzdHxwKBgF/PkKqseLn94cT2Ah6zqzvO870GwgPS0F3F1ZgIGikXL5Y6uEK5
GsOL/AptWDhTuvV5WaF+DsANrDX0YO2iAmS997cgKuaYdi4L0j2Vzd9HM8Exlhha
xN2XQ2sYJRzSWTl7UMdxPlndUVahVPMOqI6ggM8dqriEgc+97rL+PzTpAoGBAJJP
fcn5/nhBodzQTn7VUb5T1STfkBPclk0q4QjPflUlO7/lrWoDf9IGnSIjPmXZbRQY
b9BsrXbSnA2hYjI/OJl49Hylbo6CInDRpC3ksJWuuw7eIhwsuINW7M68w6xVgLTE
zLAyJBs1Yxa/wQDeq7exPfQd0LVVKco3o2BRqYGTAoGBAIn4cpDq+y7i1qd+U7S6
O+lQqNXSgYevheBt35RRy+S58yVc3dQQDIDkgUz2CFH/XAXu5XyIUjBNepxvrpnj
c2dmZWeykOIo/C5U2h3Rt5909kePnNdR8URYdhvffiE4NsFgHcBms9+fKwNIpu0e
PAF0iiaVElZNFm9dehsHzKjQ
-----END PRIVATE KEY-----
""";
    private static PrivateKey getPrivateKey() throws Exception {
        String privateKeyPemClean = PRIVATE_KEY_PEM
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\n", "")
                .replaceAll("\\s", "")
                .trim();

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPemClean);
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    public static String decrypt(String encryptedData) throws Exception {
        PrivateKey privateKey = getPrivateKey();


        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPPadding");
        OAEPParameterSpec oaepParams = new OAEPParameterSpec(
                "SHA-256",
                "MGF1",
                MGF1ParameterSpec.SHA256,
                PSource.PSpecified.DEFAULT
        );

        cipher.init(Cipher.DECRYPT_MODE, privateKey, oaepParams);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}