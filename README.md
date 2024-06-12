# Labs Order Processing

## Architecture

This repository contains system consisting of 2 services (contract/person service and order service), MongoDB database and Kafka messaging platform.

It has the following architecture: ![architecture](assets/architecture.svg)

Order service is responsible for handling CRUD operations on Order entity, and conforms to [OpenAPI spec](assets/order_service_openapi.yaml). It uses MongoDB as a main storage and syncs persons data from contract service via kafka using standard Cloud Events format.

Order service is built using:
1) [Fastify.js](https://fastify.dev/) framework - it is one of the fastest frameworks for Node.Js, it has very good integration with OpenAPI spec (validation is based on it), built in support for structured logging;
1) official mongodb driver for node.js without any ORMs - I prefer to keep dependencies to a minimum, that is why I decided to go with using mongodb client directly;
1) [Kafkajs](https://kafka.js.org/) client - fast search for alternatives didn't give results, so I picked it as it covers all the needs of the project;

## Proposed improvements

To simplify usage of service we would need to expose OpenAPI documentation at one of the endpoints of service.

To avoid complication of docker-compose setup, transaction support was stripped from implementation, as it requires setup of mongodb replica set, but in order to make service more production ready it needs to be re-implemented (to preserve consistency of data between "orders" and "persons" collections).

In order to avoid potential multiple handling of same contract event we need to make handling idempotent.

To simplify debugging of multi-service flows (ex. creation of new order) it makes sense to propagate x-request-id header and use it in all log messages.

To make service monitorable we would need to implement business metrics: count of failing calls to contract-service API, latency of API, latency of DB operations, count of active orders.

## Proposed security measures

Public REST API of both services needs to be secured by authorization technics, for example JWT.

Right now both services use same mongodb instance without authentication. To separate access we need to introduce own mongodb user for each service and give this user access only to collections/databases it supposed to have access to.

Same applies to Kafka. We should use secure connection to it.

As a next step, services can also use mTLS connection between each other.

## HOW TO RUN

In order to run the system one just needs to execute command:
```bash
docker-compose up
```

It will spawn all required subsystems. After that REST api of order service will be available at `http://127.0.0.1:3000/api/v1/order` base URL.