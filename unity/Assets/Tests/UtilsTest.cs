using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class UtilsTest
{
    // A Test behaves as an ordinary method
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

    // A UnityTest behaves like a coroutine in Play Mode. In Edit Mode you can use
    // `yield return null;` to skip a frame.
    [UnityTest]
    public IEnumerator NewTestScriptWithEnumeratorPasses()
    {
        // Use the Assert class to test conditions.
        // Use yield to skip a frame.
        yield return null;
    }
}
