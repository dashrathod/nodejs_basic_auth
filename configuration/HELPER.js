global.SITEDATA ={
    title : "nodejs_basic_auth",
    name : "nodejs_basic_auth",
    version : "1.0.0",
    web:""
}

const {
    check,
    validationResult
} = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const isset = async function (variable) {
    return typeof variable !== typeof undefined ? true : false;
}
global.isset = isset;

const getTime = async function () {
    var d = new Date();
    return d.toLocaleTimeString().toString();
}
global.getTime = getTime;

const comparePassword = async function (cryptPassword, normalPassword) {
    var res = await bcrypt.compare(cryptPassword, normalPassword);
    return res;
}
global.comparePassword = comparePassword;

const randomString = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
global.randomString = randomString;

const randomNumber = function (length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
global.randomNumber = randomNumber;

const addTime = async function (minutes) {
    var date = new Date();
    return new Date(date.getTime() + minutes * 60000).toISOString();
}
global.addTime = addTime;

const minusTime = async function (minutes) {
    var date = new Date();
    return new Date(date.getTime() - minutes * 60000).toISOString();
}
global.minusTime = minusTime;

const paginationResponse = async function (totalRow, limit = 500, page = 1) {

    const lastPage = Math.ceil(totalRow / limit);
    var pagination = {
        totalRow: totalRow,
        limit: limit || 500,
        lastPage: lastPage,
        previusPage: (page > lastPage + 1) ? 0 : Math.max(page - 1, 0),
        currentPage: page || 1,
        nextPage: (page > lastPage) ? 0 : (parseInt(page) + 1 > lastPage) ? 0 : parseInt(page) + 1,
    };
    pagination.limit = parseInt(pagination.limit);
    pagination.currentPage = parseInt(pagination.currentPage);

    return pagination;
}
global.paginationResponse = paginationResponse;

var getDateArray = function (startDate, endDate) {
    let arr = new Array();
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    let a1 = `${startDate.getUTCFullYear()}-${startDate.getUTCMonth()+1}-${startDate.getUTCDate()}`;
    let a2 = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth()+1}-${endDate.getUTCDate()}`;
    let start = new Date(a1);
    let end = new Date(a2);
    while (start < end) {
        start.setDate(start.getDate() + 1);
        arr.push(new Date(start));
    }
    if (arr.length == 0) {
        arr.push(end);
    }
    return arr;
}

global.getDateArray = getDateArray;

function randomTimeoutNumber(min = 1, max = 11) {
    return Math.floor(Math.random() * (max - min) + min) * 1000;
}
global.randomTimeoutNumber = randomTimeoutNumber;
