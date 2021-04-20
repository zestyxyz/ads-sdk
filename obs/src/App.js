import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { 
  Switch,
  Route,
  BrowserRouter as Router,
  useLocation 
} from 'react-router-dom';


// TODO: Need to change the API base The Graph to fetch correct ad
const AD_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/zestymarket/zesty-graph-rinkeby';

const DEFAULT_AD_DATAS = {
  "uri": undefined,
}
const DEFAULT_AD_URI_CONTENT = {
  "name": "Default OBS Ad",
  "description": "This is the default ad that would be displayed for OBS",
  "image": "https://ipfs.io/ipfs/QmQvEfYbeCri4ySqbN1eUNXmRLaULgrCAoi8tEU7a4S8Gw/assets/zesty-ad-obs.png",
  "cta": "https://zesty.market"
}

const fetchNFT = async (tokenGroup, publisher) => {
  const currentTime = Math.floor(Date.now() / 1000) + 10000;
  return axios.post(AD_ENDPOINT, {
    query: `
      query {
        tokenDatas (
          first: 1
          where: {
            publisher: "${publisher}"
            tokenGroup: "${tokenGroup}"
            timeStart_lte: ${currentTime}
            timeEnd_gte: ${currentTime}
          } 
        ) {
          id
          tokenGroup
          publisher
          timeCreated
          timeStart
          timeEnd
          uri
          timestamp
        }
      }
    `
  })
  .then((res) => {
    if (res.data.data.tokenDatas && res.data.data.tokenDatas.length > 0) {
      return res.status == 200 ? res.data.data.tokenDatas[0] : null
    }

    return DEFAULT_AD_DATAS;
  })
  .catch((err) => {
    console.log(err);
    return DEFAULT_AD_DATAS;
  })
};

const fetchActiveAd = async (uri) => {
  if (!uri) {
    return { uri: 'DEFAULT_URI', data: DEFAULT_AD_URI_CONTENT }
  }

  return axios.get(uri)
  .then((res) => {
    return res.status == 200 ? { uri: uri, data: res.data } : null
  })
}

function Main() {

  return (
    <a href={DEFAULT_AD_URI_CONTENT.cta}>
      <img src={DEFAULT_AD_URI_CONTENT.image} />
    </a>
  )

}

function Child() {
  const [uri, setUri] = useState(undefined);
  const [uriContent, setUriContent] = useState(DEFAULT_AD_URI_CONTENT);
  const { search } = useLocation();
  const tokenGroup = new URLSearchParams(search).get('tokenGroup');
  const publisher = new URLSearchParams(search).get('publisher');

  console.log(uriContent);

  useEffect(() => {
    fetchNFT(tokenGroup, publisher).then(res => {
      if (typeof res.uri !== 'undefined') {
        fetchActiveAd(res.uri).then((res) => {
          console.log(res)
          setUriContent(res);
        })
      }
    })
  }, []);

  return (
    <a href={uriContent?.cta}>
      <img src={uriContent?.data?.image} />
    </a>
  )
}

function App() {
  // console.log(`${tokenGroup} , ${publisher}`);

  // useEffect(() => {
  //   // fetchNFT();
  // }, []);

  return (
    <Router>
      <Switch>
        <Route path="/nft" children={<Child />} />
        <Route path="/" children={<Main />} />
      </Switch>
    </Router>
  );
}

export default App;
