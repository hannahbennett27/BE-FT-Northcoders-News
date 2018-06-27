# **Northcoders News**

Introducing my Northcoders News functioning API; a platform for users to post news articles, make comments and vote on posted content.

API created using Node.js v10.4.0, interacting with a MongoDB shell v3.0.15 database.

## **Getting Started**

These instructions will get you a copy of the project up and running on your local machine, for development and testing purposes.

## **Setup Instructions**

1.  Fork this repository to your own GitHub account.

2.  Clone your fork of this repository to your local machine and `cd` into it:

```
$ git clone <your fork's URL>
$ cd BE-FT-northcoders-news
```

3.  Open the cloned repository in your preferred program, such as Visual Studio Code.

4.  Using the integrated terminal in your chosen program, install all dependencies by entering `npm install`. A list of all requirements can be found in the `package.json` file; separated by `development` and `non-development dependencies`.

5.  In order to utilise the enclosed MongoDB database, ensure `mongod` is running on your local machine (NB: Run `$ mongod` in a separate command line and leave it running in the background, ensuring you are using the correct repository folder in your terminal first).

## **Seed Setup Instructions**

Seeding your database for `testing` and `development` requires a config file dedicated to each environment.

Make sure you're still using the correct repository folder in your terminal and create your config files:

```
$ mkdir config
$ touch config/test.js
$ touch config/dev.js
$ touch config/index.js
```

In the test.js and dev.js files, export your database url and elected port:

```javascript
module.exports = {
  DB_URL: "mongodb://localhost:27017/<db-filename>",
  PORT: 9090
};
```

**Make sure you create two different database filenames for each environment, example:**

```
test.js:  northcoders_news_test
dev.js:   northcoders_news
```

Export both files together using your `config/index.js` file:

```javascript
const path = process.env.NODE_ENV || "dev";

module.exports = require(`./${path}`);
```

Note that our environment is set to `development` by default.

**IMPORTANT NOTE**: Be sure to add your `config` and `node_modules` folders to your `.gitignore` file.

## **Seed Database Instructions**

A command line script for seeding your development database has been completed for you (see `package.json: scripts`):

```
$ npm run seed:dev
```

Your test database will be seeded before each `it` test, to ensure accuracy is upheld throughout each individual test (see `spec/index.spec.js`, line `14`).

## **Test Instructions**

Note that our environment is set to `test` on line `1` of our test file (`spec/index.spec.js`).

A command line script for running your test file has been completed for you (see `package.json: scripts`):

```
$ npm test
```

Each test `describe` block is designed to test a unique API endpoint, with each internal `it` statement designed to test each request type ('GET', 'POST', etc) and ensure that all potential user errors are handled appropriately.

To run a separate `describe` block or an individual `it` test, append `only` to the required test:

```javascript
describe.only("...");

it.only("...");
```

To skip a certain `describe` block or an individual `it` test, prepend an `x` to the required test:

```javascript
xdescribe("...");

xit("...");
```

## **Development Instructions**

A command line script for running your repo in development mode has been completed for you (see `package.json: scripts`):

```
$ npm run dev
```

Once your repo is listening on the elected port, you can access all API endpoints on your browser:

```
http://localhost:<PORT>/api
```

To mimic POST/PUT/DELETE requests in development mode, use a program such as [Postman](https://www.getpostman.com/apps).

## **Updates**

If you make changes to your repo, don't forget to `add`, `commit` and `push` your edits to your forked repo:

```
$ git add .
$ git commit -m "<commit message>"
$ git push origin master
```

## **Production**

Northcoders News has been deployed to a `production` environment, using [mLab](https://mlab.com/) and [Heroku](https://www.heroku.com/).

Please check out my Northcoders News functioning API at:

[**https://hb-northcoders-news-api.herokuapp.com/api**](https://hb-northcoders-news-api.herokuapp.com/api)

## **Authors**

**Hannah Bennett**

[GitHub](https://github.com/hannahbennett27)

[Twitter](https://twitter.com/hanjben27)

## **Acknowledgments**

[Northcoders!](https://northcoders.com)
