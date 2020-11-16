# play_with_microservices

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

## Table of contents

* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Test](#test)
* [License](#license)

## General info

This is a very asynchronous Rubik's cube web application that I built while learning about event-driven architecture
following the book ['Practical Microservices'](https://pragprog.com/titles/egmicro/practical-microservices/).
The code is completely rewritten but keeping the architecture of the original. I chose the Rubik's cube as my
implementation since they may have many states but very simple actions. I use the [cubejs](https://www.npmjs.com/package/cubejs) package for interaction and representation of the Rubik's cube. After registration and log-in, users can
create their own cubes. Three different 'applications' handles the creation, listing, and handling of the cubes.
The applications create commands that are messages sent to the message store connected to a stream. Streams
are connected to a category ('cubes') and a unique id (cubeId). The cubes component subscribes to these commands
and act upon them. If the command is accepted, the component creates an event message. (E.g. the 'Create' command
leads to an 'Created' event.) The events are again stored to the message store and the cubes aggregator module
subscribe to the events. The aggregator can load a rubik's cube state by running a reduce command over all
events and then crate a specific view data (database entry) for the applications to show to the users. This architecture
allows for decoupling between users actions (commands), system results (events), and database entries (aggregation).
However, since every action automatically becomes a background task, it results in slower response times
for the user. Since solving rubik's cubes should be a time sensitive task, this architecure is perhaps the
worst example for this sort of appllication, but that is besides the point.

### Features

* Register user
* Create rubik's cubes
* Do moves to solve the cubes

### Sources

* Logic based on code by [Ethan Garofolo](https://github.com/juanpaco) accompanying the book [Practical Microservices](https://pragprog.com/titles/egmicro/practical-microservices/).
* The message and streams naming logics follow the logic of the [Eventide](http://docs.eventide-project.org/user-guide/stream-names/) project.

## Technologies

Some selected packages.

* [cubejs](https://www.npmjs.com/package/cubejs) 1.3.2
* [express](https://www.npmjs.com/package/express) 4.17.1
* [mongoose](https://www.npmjs.com/package/mongoose) 5.10.13 => MongoDB object modeling tool.
* [mongodb-message-store](https://www.npmjs.com/package/mongodb-message-store) 1.0.3
* [winston](https://www.npmjs.com/package/winston) 3.3.3 => logger
* [morgan](https://www.npmjs.com/package/morgan) 1.10.0 => HTTP request logger middleware
* [pug](https://www.npmjs.com/package/pug) 3.0.0 => HTML template engine
* [ava](https://www.npmjs.com/package/ava) 3.13.0 => Test framework
* [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) 6.9.2 => In memory MongoDB implementation (used for testing).

## Setup

### Install

* [node.js](https://nodejs.org/en)
* [MongoDB](https://www.mongodb.com/)

### Crete .env file

```
COOKIE_SECRET=some secret
LOG_LEVEL=e.g. debug
MONGO_URI_DB=Url to database for view data, e.g. mongodb://127.0.0.1:27017/view-data
MONGO_URI_MESSAGE_STORE=Url to database for view data, e.g. mongodb://127.0.0.1:27017/message-store
PORT=web server listening port to e.g. 3000
```

## Run

Start a MongoDB instance.

```
$ npm run start
```

## License

* **[MIT license](http://opensource.org/licenses/mit-license.php)**
