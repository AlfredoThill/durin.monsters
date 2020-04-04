const crypto = require('crypto');

let encrypt = function cipher(input) {
    let mykey = crypto.createCipher('aes-128-cbc', input);
    let mystr = mykey.update('abc', 'utf8', 'hex');
    mystr += mykey.final('hex');
    return mystr
}

module.exports = encrypt;