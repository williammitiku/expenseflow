# ExpenseFlow — Repository Structure

```
expense_tracker/
├── backend/                 # NestJS REST API
│   ├── src/
│   │   ├── common/          # Guards, filters, pipes, DTOs, utils
│   │   ├── config/          # App configuration modules
│   │   ├── database/
│   │   │   ├── models/
│   │   │   ├── migrations/
│   │   │   ├── seeders/
│   │   │   └── repositories/
│   │   ├── modules/         # Domain modules (auth, expenses, …)
│   │   └── health/
│   ├── test/                # unit / integration / e2e
│   └── uploads/             # Local upload scratch (dev)
│
├── frontend/                # React + Vite + TypeScript
│   ├── public/
│   └── src/
│       ├── app/             # Router, providers
│       ├── assets/
│       ├── components/      # UI, charts, forms, layout
│       ├── features/        # Feature-oriented modules
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── services/        # Axios API clients
│       ├── stores/          # Zustand
│       ├── styles/
│       ├── types/
│       └── utils/
│
├── telegram-bot/            # Telegram Bot service
│   └── src/
│       ├── bot/             # commands, handlers, middleware, keyboards
│       ├── ai/              # NLP parsing helpers
│       ├── services/        # API client, user resolve
│       ├── config/
│       ├── types/
│       └── utils/
│
├── worker/                  # BullMQ background workers
│   └── src/
│       ├── queues/
│       ├── processors/
│       ├── jobs/
│       ├── services/
│       ├── config/
│       └── utils/
│
├── shared/                  # Cross-service contracts
│   └── src/
│       ├── types/
│       ├── dto/
│       ├── constants/
│       ├── enums/
│       ├── utils/
│       └── validators/
│
├── docs/
│   ├── architecture/        # System design (start here)
│   ├── api/
│   ├── database/
│   ├── deployment/
│   └── guides/
│
├── nginx/                   # Reverse proxy configs
├── infrastructure/          # Docker, monitoring extras
├── scripts/                 # Dev / ops scripts
└── .github/workflows/       # CI/CD (later)
```

## Package Boundaries

| Package | Depends on |
|---------|------------|
| `backend` | `shared` |
| `worker` | `shared` |
| `telegram-bot` | `shared` |
| `frontend` | `shared` (types/enums only) |
| `shared` | nothing (leaf) |

Services communicate over HTTP (bot/worker → API) and Redis queues (API → worker). They do **not** import each other's `src` trees.
