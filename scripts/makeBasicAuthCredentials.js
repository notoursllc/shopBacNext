import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const salt = bcrypt.genSaltSync(10);
const token = uuidv4().replace(/-/g, '');
const hash = bcrypt.hashSync(token, salt);

console.log("TENANT BASIC AUTH PASSWORD:", token);
console.log("FOR DB:", hash);
