# Development Workflow Rules

## Frontend Integration Workflow

We use `src/config/axios.ts` for making API calls using an axios instance with predefined configurations like baseURL, headers, and interceptors.

1. List API endpoints in `src/config/api-endpoints.ts`.
2. Create services in `src/services/frontend/{api_name}.services.ts` to handle API calls using the listed endpoints.
3. Create hooks in `src/hooks/use-{api_name}/` to encapsulate interaction logic using the services.
4. Integrate hooks into relevant frontend components.
5. Use shadcn/ui components for consistent UI design.
6. Create components in `src/components/{feature_name}/{feature-name}.tsx`.
7. Constants and enums go in `src/config/constants.ts`.
8. Schema and form validation go in `src/schemas/{api_name}.ts` using zod.
9. Loading skeletons and loaders go in `src/components/loaders/`.
10. Use shared formatting utilities from `src/lib/formatters.ts`.

## Server Integration Workflow

1. Define routes in `src/app/api/{api_name}/route.ts`.
2. If the API needs server-side services, create them in `src/services/server/{service_name}.ts`. Business logic lives in route handlers or server services.
3. For structured responses, use `src/lib/response/server-response.ts` for consistent formatting.
4. Constants and enums go in `src/config/constants.ts`.

## Code Standards

- Follow Vercel React best practices for data fetching and component patterns.
- Keep documentation clear and direct. No em dashes, minimal emojis.
- Use SWR for client-side data fetching with cache invalidation after mutations.
- Use axios for HTTP requests via the configured instance.
