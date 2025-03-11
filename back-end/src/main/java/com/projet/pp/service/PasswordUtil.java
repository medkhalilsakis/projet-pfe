package com.projet.pp.service;

import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

public class PasswordUtil {

    private static final String PRIVATE_KEY_PEM = """
        -----BEGIN RSA PRIVATE KEY-----
        MIIEogIBAAKCAQBowND8P21noe1WzMY0NSLWJOwQbFPOmgjavc4jjcRtXEy2fCtu
        HNT1s/Y8L5KIAZP3BSQxOrAxKW8MBYAQKSUbDlCjKXPvu/wBzJOIbLFD9w1wiA6E
        9k+y8MQg+5kjEsff6hWtjSPIVFnIwMJVHMbhFv7IivP4C5Ruhq64wJLimvDQk/7e
        oGuQeN/Xp5q1PIfEM6wISWY4mI6oe/jFnxta2fnA1WmUYgh5tAd3Qid1exYkgBXS
        McrNKf1iGBsV1f5dryvvspqbb0b+JRp4qyQm+ZhZXZzo7G46na6LfdmsyUe0Rqm6
        FcJwxDYKkjUF+mmJ7jUUmI7Eqv+18bzwf38nAgMBAAECggEAVYV92ULrTh1MSH48
        Hyl2fIB+XdYjAdyN+A/X+Pzn7iTZ2G49gtN1Jfe7w11Pc0xegeCnsK1qZWifaaAf
        8pG04oboXJ0eMw41az6bAFlEy+kqBsJ9oB376WpZpVfjqVfO6McS1bMSEJ6VAqok
        vhoVYHVGo3GWRt8lWqsIgHtwMCIjJrV/lbuLRH7AEHQeS1kfLEgS/E3H4PPhT04d
        9UeodtYksEjfODbMSqZvTLzMm2HuyNKwDA50iPLxX8SHOvShaM2XpUVxV6M9zzuI
        fd+/TEgt/xWXi/ExYBhZceNFx3xfWYZSZmNpu21WfOmWZjX60vor56vrmTeKmk1Z
        OeaxOQKBgQC75W4FFqqg3bkBrt9jHW6rwttHnOEHQ+toC5eT3i6Ai/pbsA3bVvEx
        sluW1dtjZ1G3+jCAOxisFvqCfhK+lgwtkAYZ01OJ1IEdEBT/NbLsfokLeFnPUEMZ
        hjVfZUcSgzk9KYQugEZjH6kXVBEgnepVT4Y556hnpAscOtsigAuRfQKBgQCOuK/V
        PXDI4nsGOX0yIuUujBe7Xkel7on0PV2XclkjMg4rSSYj1IE+MhdYgXV++Di8M/WL
        J/9QVK/5RIlOZYpq/pyV6HZ6emItugTpbs4RrXwwncO12308B3byjUGnq9i5jbkS
        Bf+eoddHkAfogj4I8QUfUHqbuQI0EseLeMr0cwKBgQCb/Hkcwld+2vNHAW00dG+3
        Kjoutn9eL7WTl+QLfu0uDIcYbQzj5cawkjhU/U93s4N078AqBGWUIDNx98YJ8LlF
        bgaSlA0LJJ7XiM1Vnbffe6C8I/qzEBfUbcWLX6HkLYpsSzYQAK/uhI807baWVGMA
        1ddB5R66g8Yxdm8Lsi9oZQKBgE5LsWKJV0NNQ/JxPWZw0EvN3QMUQLgd+Z58v8hi
        mdX+EtnaQksrvE9TiY0rUDr8j5tn4c+afK0kGHnmCHFysRHrZhmzMrQUSaIOR72L
        5Q67nsLI+eHdbIGvEqkTpy4Fz1pUDnB9y/LJlGGU+VGrib68AnRgYTLmtve8Sa4Q
        8T5TAoGAX3hEB3Lh1pTlEkcosu1UJy846gPy7v4Qkgq6iXcX/vMGft4OOkdBEyMJ
        VUsAJ0yORqF7lgNUGZJKjvSDTx4ZeZEKB65D17SzuSZDbIxdLdg5cuuwOdoAzh3J
        7gGzMpivzadCLoTKjaY54v/RabDtMKNX74/kLzP6KUiUUBHa/vg=
        -----END RSA PRIVATE KEY-----
        """;

    private static PrivateKey getPrivateKey() throws Exception {
        // Nettoyage du PEM
        String privateKeyPem = PRIVATE_KEY_PEM
                .replace("-----BEGIN RSA PRIVATE KEY-----", "")
                .replace("-----END RSA PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] keyBytes = Base64.getDecoder().decode(privateKeyPem);

        // Pour une clé PKCS#1, besoin d'une conversion en PKCS#8
        PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(spec);
    }

    public static String decrypt(String encryptedData) throws Exception {
        PrivateKey privateKey = getPrivateKey();
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}