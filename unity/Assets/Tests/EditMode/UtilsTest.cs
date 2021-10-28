using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class UtilsTest
{
    [Test]
    public void TestParseProtocol()
    {
        // Test IPFS
        Assert.AreEqual(Utils.ParseProtocol("ipfs://test"), "https://ipfs.zesty.market/ipfs/test");
        // Test HTTP
        Assert.AreEqual(Utils.ParseProtocol("https://www.test.com"), "https://www.test.com");
        // Test Arweave
        Assert.AreEqual(Utils.ParseProtocol("ar://test"), "https://arweave.net/test");
        // Test bare IPFS hash
        Assert.AreEqual(Utils.ParseProtocol("test123"), "https://ipfs.zesty.market/ipfs/test123");
        // Test invalid protocol
        Utils.ParseProtocol("test");
        LogAssert.Expect(LogType.Error, "The given URI 'test' is too short and does not conform to any supported protocol.");
    }
}
