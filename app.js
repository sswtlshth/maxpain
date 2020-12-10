var axios = require("axios");
var DomParser = require("dom-parser");
const { put } = require("request");
const parser = new DomParser();

const NSE_URL = "https://www.nseindia.com/api/liveEquity-derivatives?index=nse50_opt&date=22OCT2020";
const NSE_URL_TCS = "https://www1.nseindia.com/marketinfo/companyTracker/compInfo.jsp?symbol=TCS&series=EQ";

//inputs
const EXPIRY_DATE = '22-OCT-2020';
//JSON DATA
const UNDERLYING = 'underlying';
const STRIKE_PRICE = 'strikePrice';
const UNDERLYING_VALUE = 'underlyingValue';
const OPEN_INTEREST = 'openInterest';
const OPTION_TYPE = 'optionType';

axios(NSE_URL)
    .then(response => response.data)
    .then(data => {
        optionData = data['data'];
        dataWithRequiredFields = optionData.
        filter(d => d['expiryDate'] === EXPIRY_DATE)
        .map(obj => {
                return { 'underlying' : obj[UNDERLYING],
                    'strikePrice' : obj[STRIKE_PRICE],
                    'openInterest' : obj[OPEN_INTEREST],
                    'optionType' : obj[OPTION_TYPE]
                }
        })
        MaxPain(dataWithRequiredFields);
    })
    .catch(function (err) {
        console.log("Failed to fetch page: ", err);
    });

 /*   dataWithRequiredFields = [{
        underlying : 'NIFTY',
        strikePrice : 11000,
        openInterest : 23,
        optionType : 'Call'
    },{
        underlying : 'NIFTY',
        strikePrice : 11000,
        openInterest : 2,
        optionType : 'Put'
    },{
        underlying : 'NIFTY',
        strikePrice : 11100,
        openInterest : 230,
        optionType : 'Call'
    },{
        underlying : 'NIFTY',
        strikePrice : 11100,
        openInterest : 20,
        optionType : 'Put'
    },{
        underlying : 'NIFTY',
        strikePrice : 11200,
        openInterest : 30,
        optionType : 'Call'
    },{
        underlying : 'NIFTY',
        strikePrice : 11200,
        openInterest : 230,
        optionType : 'Put'
    },{
        underlying : 'NIFTY',
        strikePrice : 11300,
        openInterest : 90,
        optionType : 'Call'
    },{
        underlying : 'NIFTY',
        strikePrice : 11300,
        openInterest : 80,
        optionType : 'Put'
    }]

    MaxPain(dataWithRequiredFields)
*/
function MaxPain(data) {
    //array of json with strike price and combinedloss
    let maxPainForCall = calculateMaxPainForCallOptions(data)
    let maxPainForPut = calculateMaxPainForPutOptions(data)
    //let totalMaxPainForStrike = calculateCombineMaxPainForStrike()
}

function calculateMaxPainForCallOptions(data){
    let callData = getDataBasedOnField(data,OPTION_TYPE , 'Call').sort((a, b) => a[STRIKE_PRICE] - b[STRIKE_PRICE])
    let maxPainForCall = callData.map( (strikePriceData,i) => {
        callDataAboveStrike = callData.slice(i+1).filter( f => f[OPEN_INTEREST] !== 0)
        return {
            'strike_price' : strikePriceData[STRIKE_PRICE],
            'combined_loss' : calculateMaxPainATStrikePrice(strikePriceData[STRIKE_PRICE],callDataAboveStrike)
        } 
    })
    maxPainForCall.map( s => console.log("Call "+s['strike_price'] + " max pain "+s['combined_loss']))
    return maxPainForCall
}
function calculateMaxPainForPutOptions(data){
    let putData = getDataBasedOnField(data, OPTION_TYPE, 'Put').sort((a, b) => a[STRIKE_PRICE] - b[STRIKE_PRICE])
    let maxPainForPut = putData.map( (strikePriceData,i) => {
        putDataBelowStrike = putData.slice(i+1)
        return {
            'strike_price' : strikePriceData[STRIKE_PRICE],
            'combined_loss' : calculateMaxPainATStrikePrice(strikePriceData[STRIKE_PRICE],putDataBelowStrike)
        } 
    })
    maxPainForPut.map( s => console.log("Put "+s['strike_price'] + " max pain "+s['combined_loss']))
    return maxPainForPut
}
function calculateMaxPainATStrikePrice(strikePrice, data) {
    let sum = 0
    data.map( a => {
        sum += (Math.abs(a[STRIKE_PRICE] - strikePrice)*a[OPEN_INTEREST])
    })
    return sum;
}

function getDataBasedOnField(data, field, value) {
    return data.filter(obj => obj[field] === value)
}
