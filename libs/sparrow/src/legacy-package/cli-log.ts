import { Package } from '@gradii/sparrow/core';

@Package({
  name: 'cli-log'
})
export class CliLog {
  @Config()
  log(log: Log) {
    // override log settings
    log.level = logLevel;
  }
}