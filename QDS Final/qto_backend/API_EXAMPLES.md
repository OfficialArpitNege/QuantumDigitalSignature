# API examples

## Sign HELLO
```bash
curl -X POST http://127.0.0.1:8000/api/v1/sign \
  -H "Content-Type: application/json" \
  -d '{"message":"HELLO","max_symbols":8}'
```

## Teleport a general qubit
```bash
curl -X POST http://127.0.0.1:8000/api/v1/teleport \
  -H "Content-Type: application/json" \
  -d '{"theta":1.2,"phi":0.7,"shots":2048}'
```

## Simulate channel manipulation
```bash
curl -X POST http://127.0.0.1:8000/api/v1/attack \
  -H "Content-Type: application/json" \
  -d '{"theta":1.2,"phi":0.7,"attack":"channel_manipulation","strength":0.35,"shots":2048}'
```

## Run complete experiment
```bash
curl -X POST http://127.0.0.1:8000/api/v1/experiment \
  -H "Content-Type: application/json" \
  -d '{"message":"HELLO","attack":"forgery","attack_strength":0.35,"shots":2048,"max_symbols":4}'
```
