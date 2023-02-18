import bcrypt from 'bcryptjs';

/*
* Example usage: npm run cryptPassword 'somepassword'
*/

const args = process.argv.slice(2);

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(args[0], salt);

console.log("PASSWORD", args[0]);
console.log("HASHED PASSWORD", hash);
