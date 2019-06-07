using AppLensV3.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AppLensV3.Attributes
{
    /// <summary>
    /// Attribute to enforce Fresh Chat type Authorization.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true, Inherited = true)]
    public class FreshChatAuth : Attribute, IAuthorizationFilter
    {
        // This should come from config.
        private const string constPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk34cqRXsIe1M9RbXrBkxTaRKPi1Btz6IuM1ABVhzyfBT4tOQ63BBP9p9IiwNfDVyBl97woh+CO274EjTWTZDxg1FBJ4xnEhEufj3IseWdXt3h8+EAl8F1fwP/F4eRZE958Lv5aAOO0bHfO9na31bEufze1xBOeVnyUA7OrfiXbfeDbTk9wTnU15s2ogqdGlS/jtJz8qESEqyMYGgAJO8UVj+mniYsHJYyi8Iwoi8M+YVEiCDkowD5mGMkI6TU5guTlY6rqAADwoEX5JAUvBP5DM4hCLhpud3lpDrPaGsundFuK9PxiL523kJf2bplK363WDVOB9F7QT2YrCcrnpulwIDAQAB";
        private readonly bool _forceAuth = true;

        private byte[] ReadFileKey(string publicKey)
        {
            if (string.IsNullOrWhiteSpace(publicKey))
            {
                throw new ArgumentNullException("Empty public Key");
            }

            return Convert.FromBase64String(publicKey);
        }

        private RSAParameters LoadRsaPublicKey(String publicKeyFilePath)
        {
            RSAParameters RSAKeyInfo = new RSAParameters();
            byte[] pubkey = ReadFileKey(publicKeyFilePath);
            byte[] SeqOID = { 0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01, 0x05, 0x00 };
            byte[] seq = new byte[15];

            // ---------  Set up stream to read the asn.1 encoded SubjectPublicKeyInfo blob  ------
            MemoryStream mem = new MemoryStream(pubkey);
            BinaryReader binr = new BinaryReader(mem);    //wrap Memory Stream with BinaryReader for easy reading
            byte bt = 0;
            ushort twobytes = 0;

            try
            {

                twobytes = binr.ReadUInt16();
                if (twobytes == 0x8130) //data read as little endian order (actual data order for Sequence is 30 81)
                    binr.ReadByte();    //advance 1 byte
                else if (twobytes == 0x8230)
                    binr.ReadInt16();   //advance 2 bytes
                else
                    return RSAKeyInfo;

                seq = binr.ReadBytes(15);       //read the Sequence OID
                if (!CompareBytearrays(seq, SeqOID))    //make sure Sequence for OID is correct
                    return RSAKeyInfo;

                twobytes = binr.ReadUInt16();
                if (twobytes == 0x8103) //data read as little endian order (actual data order for Bit String is 03 81)
                    binr.ReadByte();    //advance 1 byte
                else if (twobytes == 0x8203)
                    binr.ReadInt16();   //advance 2 bytes
                else
                    return RSAKeyInfo;

                bt = binr.ReadByte();
                if (bt != 0x00)     //expect null byte next
                    return RSAKeyInfo;

                twobytes = binr.ReadUInt16();
                if (twobytes == 0x8130) //data read as little endian order (actual data order for Sequence is 30 81)
                    binr.ReadByte();    //advance 1 byte
                else if (twobytes == 0x8230)
                    binr.ReadInt16();   //advance 2 bytes
                else
                    return RSAKeyInfo;

                twobytes = binr.ReadUInt16();
                byte lowbyte = 0x00;
                byte highbyte = 0x00;

                if (twobytes == 0x8102) //data read as little endian order (actual data order for Integer is 02 81)
                    lowbyte = binr.ReadByte();  // read next bytes which is bytes in modulus
                else if (twobytes == 0x8202)
                {
                    highbyte = binr.ReadByte(); //advance 2 bytes
                    lowbyte = binr.ReadByte();
                }
                else
                    return RSAKeyInfo;

                byte[] modint = { lowbyte, highbyte, 0x00, 0x00 };   //reverse byte order since asn.1 key uses big endian order
                int modsize = BitConverter.ToInt32(modint, 0);

                byte firstbyte = binr.ReadByte();
                binr.BaseStream.Seek(-1, SeekOrigin.Current);

                if (firstbyte == 0x00)
                {   //if first byte (highest order) of modulus is zero, don't include it
                    binr.ReadByte();    //skip this null byte
                    modsize -= 1;   //reduce modulus buffer size by 1
                }

                byte[] modulus = binr.ReadBytes(modsize);   //read the modulus bytes

                if (binr.ReadByte() != 0x02)            //expect an Integer for the exponent data
                    return RSAKeyInfo;
                int expbytes = (int)binr.ReadByte();        // should only need one byte for actual exponent data (for all useful values)
                byte[] exponent = binr.ReadBytes(expbytes);


                RSAKeyInfo.Modulus = modulus;
                RSAKeyInfo.Exponent = exponent;

                return RSAKeyInfo;
            }
            catch (Exception)
            {
                return RSAKeyInfo;
            }

            finally { binr.Close(); }
            //return RSAparams;

        }

        private RSACryptoServiceProvider InitRSAProvider(RSAParameters rsaParam)
        {
            //
            // Initailize the CSP
            //   Supresses creation of a new key
            //
            CspParameters csp = new CspParameters();
            //csp.KeyContainerName = "RSA Test (OK to Delete)";

            const int PROV_RSA_FULL = 1;
            csp.ProviderType = PROV_RSA_FULL;

            const int AT_KEYEXCHANGE = 1;
            // const int AT_SIGNATURE = 2;
            csp.KeyNumber = AT_KEYEXCHANGE;
            //
            // Initialize the Provider
            //
            RSACryptoServiceProvider rsa =
              new RSACryptoServiceProvider(csp);
            rsa.PersistKeyInCsp = false;

            //
            // The moment of truth...
            //
            rsa.ImportParameters(rsaParam);
            return rsa;
        }

        private int GetIntegerSize(BinaryReader binr)
        {
            byte bt = 0;
            byte lowbyte = 0x00;
            byte highbyte = 0x00;
            int count = 0;
            bt = binr.ReadByte();
            if (bt != 0x02)     //expect integer
                return 0;
            bt = binr.ReadByte();

            if (bt == 0x81)
                count = binr.ReadByte();    // data size in next byte
            else
                if (bt == 0x82)
            {
                highbyte = binr.ReadByte(); // data size in next 2 bytes
                lowbyte = binr.ReadByte();
                byte[] modint = { lowbyte, highbyte, 0x00, 0x00 };
                count = BitConverter.ToInt32(modint, 0);
            }
            else
            {
                count = bt;     // we already have the data size
            }

            while (binr.ReadByte() == 0x00)
            {   //remove high order zeros in data
                count -= 1;
            }
            binr.BaseStream.Seek(-1, SeekOrigin.Current);       //last ReadByte wasn't a removed zero, so back up a byte
            return count;
        }

        private static bool CompareBytearrays(byte[] a, byte[] b)
        {
            if (a.Length != b.Length)
                return false;
            int i = 0;
            foreach (byte c in a)
            {
                if (c != b[i])
                    return false;
                i++;
            }
            return true;
        }

        private bool VerifySignatureWithPublicKey(string requestBody, string signature, RSACryptoServiceProvider publicKey)
        {
            RSAParameters _publicKey = LoadRsaPublicKey(constPublicKey);
            RSACryptoServiceProvider rsa = InitRSAProvider(_publicKey);

            byte[] signatureBytes = Convert.FromBase64String(signature);

            // Hash the data
            SHA1Managed sha1 = new SHA1Managed();

            UnicodeEncoding encoding = new UnicodeEncoding();

            byte[] data = encoding.GetBytes(requestBody);

            byte[] hash = sha1.ComputeHash(data);

            // Verify the signature with the hash
            return rsa.VerifyHash(hash, CryptoConfig.MapNameToOID("SHA1"), signatureBytes);
        }

        private string DecryptUsingPublicKey(string encryptedData)
        {
            if (encryptedData == null)
            {
                throw new ArgumentNullException("Encypted Data");
            }

            if (string.IsNullOrWhiteSpace(constPublicKey))
            {
                throw new ArgumentNullException("Public Key");
            }

            try
            {
                RSAParameters _publicKey = LoadRsaPublicKey(constPublicKey);
                RSACryptoServiceProvider rsa = InitRSAProvider(_publicKey);

                byte[] bytes = Convert.FromBase64String(encryptedData);
                byte[] decryptedBytes = rsa.Decrypt(bytes, false);

                // I assume here that the decrypted data is intended to be a
                // human-readable string, and that it was UTF8 encoded.
                return Encoding.UTF8.GetString(decryptedBytes);
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        public FreshChatAuth(bool forceAuth = true)
        {
            _forceAuth = forceAuth;
        }

        void IAuthorizationFilter.OnAuthorization(AuthorizationFilterContext context)
        {
            if (_forceAuth)
            {
                if (!context.HttpContext.Request.Headers.ContainsKey("X-Freshchat-Signature"))
                {
                    context.Result = new BadRequestResult();
                }
                else
                {
                    Microsoft.Extensions.Primitives.StringValues apiKeyValues = new Microsoft.Extensions.Primitives.StringValues();
                    if (context.HttpContext.Request.Query.TryGetValue("apikey", out apiKeyValues))
                    {
                        if (apiKeyValues.Count > 0)
                        {
                            string apiKey = apiKeyValues[0];
                            IFreshChatClientService freshChat = (IFreshChatClientService)context.HttpContext.RequestServices.GetService(typeof(IFreshChatClientService));
                            if (!freshChat.VerifyCall(apiKey))
                            {
                                context.Result = new UnauthorizedResult();
                            }
                        }
                        else
                        {
                            context.Result = new BadRequestResult();
                        }
                    }
                    else
                    {
                        context.Result = new UnauthorizedResult();
                    }

                    //string signatureHeaderValue = "aVqZdFe/chfBWE3O9MbWELxiAvXcRtXknnmHa9Tch3H4QMF9flvqZIFDqcHvdVgAq3pzG8AinpL8BEE9MSOciJHEwkm83S3Y4ut2su3nLsG+uhncelhOtblveTY6xhvx5utue/05vcbnCR8yJZ/BouJ8sGeK+dOoXC2sMGEPt8W6QjsBRFcuMGKu7M8S70x2KIKwYq2umQvy/ZYVRwhNn7Vgakfn+xa6gXtAL7eptJSjrj6WM8cDauTJtHL9d/F6UcsCUYxQEIRpTOF3turtpYWn0EEZh77IlM96w0GCKrOK1RBa0HUpYwG2UqZGc2itLRNDYGI/uExLHPPyN+sxdA==";
                    //string body = @"{""actor"": {""actor_type"": ""user"",""actor_id"": ""0cb5f08d-3979-4fe7-a2a3-7a713f42878b""},""action"": ""message_create"",""action_time"": ""2019-06-03T22:54:49.438Z"",""data"": {""message"": {""message_parts"": [{""text"": {""content"": ""it will help me with the high cpu that happened earlier?""}}],""app_id"": ""4a9bc03e-66e8-4755-aa65-0fd008d1cec0"",""actor_id"": ""0cb5f08d-3979-4fe7-a2a3-7a713f42878b"",""id"": ""32a75c59-8907-46d1-8aaf-99e390e1632b"",""channel_id"": ""ba9bbcf0-b229-469f-8763-4370ea17d69f"",""conversation_id"": ""bc9cef09-0894-4fa2-82e4-393bd40e8776"",""message_type"": ""normal"",""actor_type"": ""user"",""created_time"": ""2019-06-03T22:54:49.427Z""}}}";
                    //Microsoft.Extensions.Primitives.StringValues signatureCollection;
                    //context.HttpContext.Request.Headers.TryGetValue("X-Freshchat-Signature", out signatureCollection);

                    //try
                    //{
                    //    var dSig = DecryptUsingPublicKey(signatureHeaderValue);
                    //}
                    //catch(Exception ex)
                    //{

                    //}

                    //try
                    //{
                    //    RSAParameters _publicKey = LoadRsaPublicKey(constPublicKey);
                    //    RSACryptoServiceProvider rsa = InitRSAProvider(_publicKey);
                    //    bool verifyResult = VerifySignatureWithPublicKey(body, signatureHeaderValue, rsa);
                    //}
                    //catch(Exception e)
                    //{

                    //}
                    //string signature = signatureCollection[0];
                    //string result = string.Empty;

                    //context.Result = new ForbidResult();
                }
            }
        }
    }
}
