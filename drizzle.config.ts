import type { Config } from "drizzle-kit";

export default {
	schema: "./electron/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	dbCredentials: {
		url: "./spendora.db",
	},
} satisfies Config;


