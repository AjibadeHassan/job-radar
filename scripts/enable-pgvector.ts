// Enable pgvector extension on Neon before running Prisma migrations.
// Prisma's `extensions = [vector]` config doesn't auto-CREATE EXTENSION;
// it just adds it to the connection's search_path. We need to create it manually.
import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) throw new Error('DATABASE_URL not set')

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL })
  const client = await pool.connect()
  try {
    console.log('Enabling pgvector extension...')
    await client.query('CREATE EXTENSION IF NOT EXISTS vector')
    console.log('✓ pgvector extension enabled')

    console.log('\nVerifying installation...')
    const res = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'")
    console.log('✓ Extension record:', res.rows[0])
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
