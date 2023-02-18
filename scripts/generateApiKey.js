const bcrypt = require('bcrypt');
const uuidV4 = require('uuid/v4');

const salt = bcrypt.genSaltSync(10);

const token = uuidV4().replace(/-/g, '');
const hash = bcrypt.hashSync(token, salt);

console.log("TENANT_API_KEY:", token);
console.log("FOR DB:", hash);
