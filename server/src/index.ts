import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { serviceClient } from './db/client.js'
import { aiSkinRoute } from './routes/ai-skin.js'

const app = new Hono()

app.use('*', logger())

// Апп нь Expo web (өөр origin), гар утас (origin-гүй), EAS build бүгд
// эндрүү хандана. Cookie-гүй, Bearer token-оор баталгааждаг тул origin
// нээлттэй байх нь аюулгүй — `credentials` ашигладаггүй.
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/', (c) => c.json({ name: 'lumina-server', ok: true }))

app.route('/ai', aiSkinRoute)

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
