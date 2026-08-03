/**
 * The landing page, as a Worker.
 *
 * It has no public URL of its own — no workers.dev subdomain, no custom domain. The only
 * thing that can reach it is the brezel-app Worker's LANDING service binding, which is
 * what makes brezel.cc a single front door rather than the tidiest of several ways in.
 *
 * Serving assets is all it does. The routing and the gate live in the private repo.
 */

interface Env {
  ASSETS: Fetcher
}

export default {
  fetch(req: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(req)
  },
} satisfies ExportedHandler<Env>
