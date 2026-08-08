# DevFusion — package shared

> Zod schemas + generated TypeScript types, mirrored on the API side via Pydantic.
> Single source of truth for every API contract.

## Usage

```ts
import { HealthResponseSchema } from '@devfusion/shared';

const data = HealthResponseSchema.parse(await res.json());
```
