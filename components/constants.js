import axios from "axios"

const BASE_URL = "https://hassanabbasnaqvi.pythonanywhere.com/api/"

const COINMARKET_API = BASE_URL + "coinmarket"
const DEXSCREENER_API = "https://api.dexscreener.com/latest/dex/tokens/"

const SET_DATA = BASE_URL + "setdata"
const GET_DATA = BASE_URL + "getdata"


const CoinMarketRequest = async (address=null, id=null) => {
  try {
    const response = await axios.post(COINMARKET_API,
      {
        address: address,
        id: id,
      
    })
    return response.data
  }
  catch (error) {
    return "wrong address"
  }
}

const DexScreenerRequest = async (address=null) => {
  try {
    const response = await axios.get(DEXSCREENER_API+address)

    return response.data.pairs
  }
  catch (error) {
    return "wrong address"
  }
}




async function updateData(username, password, json) {
    const url = SET_DATA;
    const data = {
      username: username,
      password: password,
      data: JSON.stringify(json)
    };

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
  
    try {
      const response = await axios.post(url, data, config);
      return ('Data posted successfully:', response.data);


    } catch (error) {
      console.error('Error occurred during the POST request:', error);
      return undefined
    }
  }

async function getData(username, password) {
    const url = GET_DATA;
    const data = {
      username: username,
      password: password
    };

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await axios.post(url, data, config);
      return JSON.parse(response.data);

    } catch (error) {
      console.error('Error occurred during the POST request:', error);
      return undefined
    }
  }

  export {updateData, getData, CoinMarketRequest, DexScreenerRequest}