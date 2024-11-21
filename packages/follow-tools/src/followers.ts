import assert from 'assert'
import EventEmitter from 'events'
import TypedEmitter from 'typed-emitter'
import path from 'path'
import fs from 'fs/promises'
import {
  AppBskyActorDefs,
  AtpAgent,
  AtpSessionData,
  AtpSessionEvent,
} from '@atproto/api'
import * as csv from '@fast-csv/format'

const BSKY_APPVIEW = 'https://bsky.social'

type Format = 'json' | 'csv'

export class Followers {
  private readonly outputFile: string | undefined
  private readonly agent: AtpAgent
  private _session: AtpSessionData | undefined
  private readonly sessionEmitter =
    new EventEmitter() as TypedEmitter<SessionEvents>
  private followers: AppBskyActorDefs.ProfileView[] = []

  constructor(
    private readonly user: string,
    private readonly password: string,
    output: string | undefined,
    private readonly format: Format = 'json',
  ) {
    this.outputFile = output ? path.resolve(output) : undefined
    this.agent = new AtpAgent({
      service: BSKY_APPVIEW,
      persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
        if (evt === 'create' || evt === 'update') this._session = sess
        else this._session = undefined
        this.sessionEmitter.emit('sessionChange', this._session)
      },
    })
  }

  async run() {
    await this.login()
    await this.getFollowers()
    await this.writeFollowers()
  }

  async login() {
    const promise = new Promise<void>((resolve, reject) => {
      this.once('sessionChange', (session) => {
        if (session) {
          if (this.outputFile) console.log('Logged in')
          this.on('sessionChange', (session) => {
            if (!session) {
              console.error('Session lost')
              process.exit(1)
            }
          })
          resolve()
        } else reject(new Error('Login failed'))
      })
    })
    if (this.outputFile) console.log(`Logging in as ${this.user}`)
    this.agent.login({ identifier: this.user, password: this.password })
    return promise
  }

  async getFollowers() {
    assert(this.session, 'No session')
    const actor = this.session.did
    let cursor: string | undefined = undefined
    this.followers = []
    do {
      const { data } = await this.agent.app.bsky.graph.getFollowers({
        actor,
        limit: 100,
        cursor,
      })
      cursor = data.cursor
      this.followers.push(...data.followers)
      if (this.outputFile)
        console.log(`Received ${this.followers.length} followers`)
      // Wait 100ms to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } while (cursor)
  }

  async writeFollowers() {
    console.log(
      `Writing ${this.followers.length} followers to ` +
        `${this.outputFile} in ${this.format}`,
    )
    if (this.format === 'json') {
      const json = JSON.stringify(this.followers, null, 2)
      if (this.outputFile) await fs.writeFile(this.outputFile, json)
      else console.log(json)
    } else {
      const file = this.outputFile ? await fs.open(this.outputFile, 'w') : null
      try {
        const out = file ? file.createWriteStream() : process.stdout
        const csvStream = csv.format({ headers: true })
        const complete = new Promise<void>((resolve, reject) => {
          csvStream.on('end', resolve)
          csvStream.on('error', reject)
        })
        csvStream.pipe(out)
        this.followers.forEach(
          ({ did, handle, displayName, description }, i) => {
            console.log(`Writing follower ${i + 1}: ${did}`)
            csvStream.write({ did, handle, displayName, description })
          },
        )
        csvStream.end()
        await complete
      } finally {
        if (file) await file.close()
      }
    }
  }

  on(event: 'sessionChange', listener: SessionEvents['sessionChange']) {
    this.sessionEmitter.on(event, listener)
  }

  once(event: 'sessionChange', listener: SessionEvents['sessionChange']) {
    this.sessionEmitter.once(event, listener)
  }

  off(event: 'sessionChange', listener: SessionEvents['sessionChange']) {
    this.sessionEmitter.off(event, listener)
  }

  get session() {
    return this._session
  }
}

type SessionEvents = {
  sessionChange: (session: AtpSessionData | undefined) => void
}
