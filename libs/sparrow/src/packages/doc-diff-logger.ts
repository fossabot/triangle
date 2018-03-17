const _ = require('lodash');
const {diff} = require('objectdiff');
import { Package } from '../Package';

let firstDocs, startDocs, endDocs, lastDocs;
const options = {
  start: null,
  end  : null
};

@Package({
  name: 'doc-diff-logger'
})
export class DocDiffLogger {
  @Factory()
  docDiffLoggerOptions() {
    return options;
  }

  @Event('processorStart')
  processorStart({event, processor, docs}) {
    firstDocs = firstDocs || _.cloneDeep(docs);

    if (options.start === processor.name) {
      startDocs = _.cloneDeep(docs);
    }
  }

  @Event('processorEnd')
  processEnd({event, processor, docs}) {
    lastDocs = docs;

    if (options.end === processor.name) {
      endDocs = _.cloneDeep(docs);
      logDiff(log);
    }
  }

  @Event('generationEnd')
  generationEnd() {
    if (options.start && !startDocs) {
      throw new Error('docDiffLogger: missing start processor');
    }
    if (options.end && !endDocs) {
      throw new Error('docDiffLogger: missing end processor');
    }
    if (!options.end) {
      logDiff(log);
    }
  }

}

function logDiff(log) {
  const changes = diff(startDocs || firstDocs, endDocs || lastDocs);
  log.info(options);
  log.info(changes);
}
