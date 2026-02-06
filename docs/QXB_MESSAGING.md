# QXB Messaging

Backbone: NATS + JetStream with CloudEvents envelope and QXB extensions.

## Streams

- QXB_EVENTS: subjects qxb.evt.>
- QXB_CHAT: subjects qxb.chat.>
- QXB_RUNS: subjects qxb.run.>

## Consumers

- UI_OBSERVER (durable)
- LEDGER_SEALER (durable)
- AGENT_INBOX (durable per agent)

## Envelope

All events must be CloudEvents with QXB extensions.
