import { Hono } from 'hono'

import { serviceClient } from './db/client.js'

const app = new Hono()

app.get('/', (c) => c.json({ name: 'lumina-server', ok: true }))

/** DB холбогдож байгаа эсэх — deploy шалгахад. */
app.get('/health/db', async (c) => {
  try {
    const { error } = await serviceClient()
      .from('businesses')
      .select('id', { count: 'exact', head: true })

    if (error) return c.json({ ok: false, error: error.message }, 500)
    return c.json({ ok: true })
  } catch (error) {
    return c.json({ ok: false, error: (error as Error).message }, 500)
  }
})

export default app
