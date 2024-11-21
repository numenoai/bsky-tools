import path from 'path'
import fs from 'fs'
import pc from 'picocolors'
import minimist from 'minimist'
import { Followers } from './followers'

function usage(error?: string): void {
  const globals = [
    [
      '--user',
      'USERNAME',
      [
        'Your Bluesky username. It can also be set via the BLUESKY_USER',
        'environment variable.',
      ].join(' '),
    ],
    [
      '--password',
      'PASSWORD',
      [
        'A Bluesky app password for that user. It can also be set via the',
        'BLUESKY_PASSWORD environment variable.',
      ].join(' '),
    ],
    ['--output', 'FILE', 'Output to a file instead of stdout'],
    ['--format', 'FORMAT', 'Output format (json, csv)'],
    ['--help, -h', '', 'Show this help message'],
    ['--version, -v', '', 'Print the version of follow-tools'],
  ]

  const commands = [['followers', 'Export your followers']]

  const globalsShort = globals.map(([flag, arg]) =>
    arg ? `[${pc.bold(flag)}=${pc.underline(arg)}]` : `[${pc.bold(flag)}]`,
  )

  const globalsLong = globals
    .map(([flag, arg, desc]) => {
      const argStr = arg
        ? `${pc.bold(flag)}=${pc.underline(arg)}`
        : pc.bold(flag)
      return [`    ${argStr}`, brCmd(desc)].join('\n')
    })
    .join('\n\n')

  const commandsLong = commands
    .map(([cmd, desc]) => {
      return [`    ${pc.bold(cmd)}`, brCmd(desc)].join('\n')
    })
    .join('\n\n')

  const msg = [
    pc.bold(`NAME`),
    `    follow-tools - manage your followers on Bluesky, by numeno.ai`,
    ``,
    pc.bold(`SYNOPSIS`),
    brIns(pc.bold(`follow-tools`), pc.underline(`COMMAND`), ...globalsShort),
    ``,
    pc.bold(`DESCRIPTION`),
    brPar(
      `The follow-tools CLI logs in is a command line tool to manage your`,
      `follow and followers on Bluesky.`,
    ),
    ``,
    pc.bold(`GLOBAL FLAGS`),
    globalsLong,
    ``,
    pc.bold(`COMMANDS`),
    commandsLong,
    ``,
  ].join('\n')

  if (error) {
    console.error(msg)
    console.error(pc.redBright(`\nError: ${error}`))
    process.exit(1)
  }

  console.log(msg)
  process.exit(0)
}

function internalBr(strs: string[], i1: number, ix: number): string {
  // Break whenever we hit the 80 character limit
  const out: string[] = []
  let line = ' '.repeat(i1)
  let length = line.length
  for (const str of strs) {
    const strLength = stripColors(str).length
    if (length > 50 && length + strLength >= 80) {
      out.push(line)
      line = ' '.repeat(ix)
      length = line.length
    } else {
      line += length === i1 ? '' : ' '
      length++
    }
    line += str
    length += strLength
  }
  out.push(line)
  return out.join('\n')
}

function brIns(...strs: string[]): string {
  return internalBr(strs, 4, 8)
}

function brPar(...strs: string[]): string {
  return internalBr(
    strs.flatMap((str) => str.split(' ')),
    4,
    4,
  )
}

function brCmd(...strs: string[]): string {
  return internalBr(strs, 7, 7)
}

function stripColors(str: string): string {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  )
}

export function main() {
  const args = minimist(process.argv.slice(2), {
    alias: {
      help: 'h',
      version: 'v',
    },
    boolean: ['help', 'version'],
  })

  if (args.help) usage()
  if (args.version) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    console.log(require('../package.json').version)
    process.exit(0)
  }
  const user = args.user || process.env.BLUESKY_USER
  if (!user) usage('No user provided')
  const password = args.password || process.env.BLUESKY_PASSWORD
  if (!password) usage('No password provided')

  const command = args._[0]
  if (!command) usage('No command provided')
  if (command !== 'followers') usage(`Unknown command: ${command}`)

  if (command === 'followers') {
    const { output, format } = args
    if (format && format !== 'json' && format !== 'csv')
      usage(`Unknown format: ${format}`)
    if (output) {
      const file = path.resolve(output)
      const dir = path.dirname(file)
      // Directory must exist
      try {
        if (!dir) usage(`Invalid output file: ${output}`)
        fs.accessSync(dir, fs.constants.W_OK)
      } catch (err) {
        usage(`Cannot write to ${dir}: ${err}`)
      }
      // File must not exist
      try {
        fs.accessSync(file, fs.constants.F_OK | fs.constants.W_OK)
        usage(`Output file already exists: ${output}`)
      } catch (err: any) {
        if (err.code !== 'ENOENT') throw err
      }
    }
    const followers = new Followers(user, password, output, format)
    followers
      .run()
      .then(() => process.exit(0))
      .catch((err) => {
        console.error(err)
        process.exit(1)
      })
  }
}
