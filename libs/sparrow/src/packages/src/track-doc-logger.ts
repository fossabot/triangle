const _ = require('lodash');
import { Package } from '../Package';

const options = {
  docsToTrackFn: function (docs) {}
};

const generations = [];
let previousTrackedDocs;

@Package({
  name: 'track-doc-logger'
})
export class TrackDocLogger {

  @Factory('trackDocLoggerOptions')
  trackDocLoggerOptions() {
    return options;
  }

  @Event('processorEnd')
  processorEnd({event, processor, docs}) {
    let trackedDocs = options.docsToTrackFn(docs);
    if (trackedDocs) {
      if (!_.isEqual(trackedDocs, previousTrackedDocs)) {
        trackedDocs = _.cloneDeep(trackedDocs);
        generations.push({processor: processor.name, docs: trackedDocs});
        previousTrackedDocs = trackedDocs;
      }
    }
  }

  @Event('generationEnd')
  generationEnd() {
    log.info('trackDocLogger settings:', options);
    log.info('trackDocLogger tracked changes:', generations);
  }
}