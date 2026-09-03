# NETWORK_PROBE

Prueba de alcance de red desde este entorno remoto (salida HTTPS vía agent proxy).
Fecha: 2026-09-03.

Comando usado por host:

```
curl -sS -o /dev/null -m 20 -w "%{http_code}" <URL>
```

## Resultados por host

### https://lh3.googleusercontent.com/

- Código HTTP: `000` (no hubo respuesta HTTP).
- Error de curl: `curl: (56) CONNECT tunnel failed, response 403`
- Exit code de curl: `56`
- Tipo de fallo: **denegación de política del proxy** — 403 en el CONNECT.

### https://contribution.usercontent.google.com/

- Código HTTP: `000` (no hubo respuesta HTTP).
- Error de curl: `curl: (56) CONNECT tunnel failed, response 403`
- Exit code de curl: `56`
- Tipo de fallo: **denegación de política del proxy** — 403 en el CONNECT.

### https://stitch.withgoogle.com/

- Código HTTP: no obtenido.
- Error: el comando `curl` no llegó a ejecutarse. Fue bloqueado localmente por el
  clasificador de permisos de Claude Code ("Permission for this action was denied
  by the Claude Code auto mode classifier. Reason: Blocked by classifier"). Se
  intentó dos veces, con el mismo resultado.
- Tipo de fallo: **distinto** a una denegación de política del proxy. No hubo
  CONNECT ni 403/407 del proxy; el bloqueo ocurrió antes de la salida a red, en
  la capa de permisos del entorno. No hay dato sobre si el proxy permitiría o no
  este host.

## recentRelayFailures del proxy

Salida de `curl -sS "$HTTPS_PROXY/__agentproxy/status"`, campo `recentRelayFailures`:

```json
[
  {
    "ts": "2026-09-03T21:21:08.272Z",
    "kind": "connect_rejected",
    "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
    "host": "lh3.googleusercontent.com:443"
  },
  {
    "ts": "2026-09-03T21:21:11.610Z",
    "kind": "connect_rejected",
    "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
    "host": "contribution.usercontent.google.com:443"
  }
]
```

No aparece ninguna entrada para `stitch.withgoogle.com`, consistente con que la
petición nunca salió hacia el proxy.
