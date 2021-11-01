using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class UtilsTest
{
    [Test]
    public void TestParseProtocolIPFS()
    {
        Assert.AreEqual(Utils.ParseProtocol("ipfs://test"), "https://ipfs.zesty.market/ipfs/test");
    }

    [Test]
    public void TestParseProtocolHTTP()
    {
        Assert.AreEqual(Utils.ParseProtocol("https://www.test.com"), "https://www.test.com");
    }

    [Test]
    public void TestParseProtocolArweave()
    {
        Assert.AreEqual(Utils.ParseProtocol("ar://test"), "https://arweave.net/test");
    }

    [Test]
    public void TestParseProtocolIPFSHash()
    {
        Assert.AreEqual(Utils.ParseProtocol("test123"), "https://ipfs.zesty.market/ipfs/test123");
    }

    [Test]
    public void TestParseProtocolInvalid()
    {
        Utils.ParseProtocol("test");
        LogAssert.Expect(LogType.Error, "The given URI 'test' is too short and does not conform to any supported protocol.");
    }
}
