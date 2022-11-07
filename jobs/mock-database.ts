const fs = require('fs');
const database = require('../database');
const string: string = JSON.stringify(database);
const path: string = `${__dirname}/../database/database.mock.json`;

fs.writeFile(path, string, (err) =>
	err ? console.log(err) : console.log('The file was saved!')
);
