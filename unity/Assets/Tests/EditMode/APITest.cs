using System.Collections;
using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using SimpleJSON;
using Zesty;

public class APITest
{
    string MOCK_GRAPH_RESPONSE_NO_TOKENDATAS = $@"
    {{}}";
    string MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING = $@"
    {{
      sellerNFTSetting: {{}}
    }}";
    string MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS = $@"
    {{
      sellerNFTSetting: {{
        sellerAuctions:[],
      }}
    }}";
    string MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS = $@"
    {{
      sellerNFTSetting: {{
        sellerAuctions: [
          {{
            buyerCampaigns:[],
            buyerCampaignsApproved:[false],
          }},
        ],
      }}
    }}";
    string MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED = $@"
    {{
      sellerNFTSetting: {{
        sellerAuctions: [
          {{
            buyerCampaigns: [
              {{
                id: ""0"",
                uri: """",
              }},
            ],
            buyerCampaignsApproved:[false],
          }},
        ],
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_VALID = $@"
    {{
      sellerNFTSetting: {{
        sellerAuctions: [
          {{
            buyerCampaigns: [
              {{
                id: ""0"",
                uri: ""test"",
              }},
            ],
            buyerCampaignsApproved:[true],
          }},
        ],
      }}
    }}";

    string[] elmsKey = { "uri" };
    Dictionary<string, string> result = new Dictionary<string, string>();

    [Test]
    public void TestParseGraphResponseNoTokenDatas()
    {
        result.Add("uri", null);

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_NO_TOKENDATAS), elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoSellerNFTSetting()
    {
        result.Add("uri", null);

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING), elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoSellerAuctions()
    {
        result.Add("uri", null);

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS), elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoBuyerCampaigns()
    {
        result.Add("uri", null);

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS), elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseBuyerCampaignNotApproved()
    {
        result.Add("uri", null);

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED), elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseResponseValid()
    {
        result.Add("uri", "test");

        Assert.AreEqual(API.ParseGraphResponse(JSON.Parse(MOCK_GRAPH_RESPONSE_VALID), elmsKey), result);

        result.Clear();
    }
}
