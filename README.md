# Create Renaissance App Block

Quickly scaffold a new Renaissance app block from the [official template](https://github.com/buidl-renaissance/renaissance-app-block-template).

## Usage

```bash
npx @buidl-renaissance/create-renaissance-app-block my-project
```

Or if you prefer to install it globally:

```bash
npm install -g @buidl-renaissance/create-renaissance-app-block
create-renaissance-app-block my-project
```

## What's Included

The template comes with:

- **Next.js 16** with TypeScript
- **Styled Components** for styling
- **Drizzle ORM** with SQLite (libSQL)
- **Authentication** system with phone login and PIN
- **User context** and theme management
- Pre-configured API routes

## Getting Started

After creating your project:

```bash
cd my-project
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Environment Variables

Copy `env.example` to `.env` and configure your variables:

```bash
cp env.example .env
```

## Database

Generate and run migrations:

```bash
yarn db:generate
yarn db:migrate
```

Open Drizzle Studio to manage your database:

```bash
yarn db:studio
```

## Options

### Custom Repository

You can specify a different template repository:

```bash
npx @buidl-renaissance/create-renaissance-app-block my-project --repo https://github.com/your-org/your-template.git
```

## Authentication

The template includes a phone + PIN authentication system:

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register new user with phone + PIN |
| `POST /api/auth/phone-login` | Login with phone + PIN |
| `POST /api/auth/set-pin` | Set PIN for existing user |
| `POST /api/auth/context` | Auth from Renaissance app context |
| `POST /api/auth/logout` | Clear session |

**Security:** Account locks after 3 failed attempts. PINs are hashed with bcrypt. Sessions expire after 24 hours.

## Links

- [Template Repository](https://github.com/buidl-renaissance/renaissance-app-block-template)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## License

MIT
