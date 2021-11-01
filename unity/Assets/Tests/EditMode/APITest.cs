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
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [],
        }},
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING = $@"
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [
            {{
              sellerNFTSetting: {{}},
            }},
          ],
        }},
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS = $@"
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [
            {{
              sellerNFTSetting: {{
                sellerAuctions:[],
              }},
            }},
          ],
        }},
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS = $@"
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [
            {{
              sellerNFTSetting: {{
                sellerAuctions: [
                  {{
                    buyerCampaigns:[],
                    buyerCampaignsApproved:[false],
                  }},
                ],
              }},
            }},
          ],
        }},
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED = $@"
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [
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
            }},
          ],
        }},
      }},
    }}";
    string MOCK_GRAPH_RESPONSE_VALID = $@"
    {{
      status: ""200"",
      data: {{
        data: {{
          tokenDatas: [
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
              }},
            }},
          ],
        }},
      }},
    }}";

    string[] elmsKey = { "uri" };
    Dictionary<string, string> result = new Dictionary<string, string>();
    string mock = "";

    [Test]
    public void TestParseGraphResponseNoTokenDatas()
    {
        result.Add("uri", null);

        mock = MOCK_GRAPH_RESPONSE_NO_TOKENDATAS;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoSellerNFTSetting()
    {
        result.Add("uri", null);

        mock = MOCK_GRAPH_RESPONSE_NO_SELLERNFTSETTING;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoSellerAuctions()
    {
        result.Add("uri", null);

        mock = MOCK_GRAPH_RESPONSE_NO_SELLERAUCTIONS;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseNoBuyerCampaigns()
    {
        result.Add("uri", null);

        mock = MOCK_GRAPH_RESPONSE_NO_BUYERCAMPAIGNS;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseBuyerCampaignNotApproved()
    {
        result.Add("uri", null);

        mock = MOCK_GRAPH_RESPONSE_BUYERCAMPAIGN_NOT_APPROVED;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }

    [Test]
    public void TestParseGraphResponseResponseValid()
    {
        result.Add("uri", "test");

        mock = MOCK_GRAPH_RESPONSE_VALID;
        Assert.AreEqual(API.ParseGraphResponse(mock, elmsKey), result);

        result.Clear();
    }
}
