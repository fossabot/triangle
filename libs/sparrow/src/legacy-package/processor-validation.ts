const Q = require('q');
const validate = require('validate.js');
import { Config } from 'codelyzer';
import { Dgeni } from 'dgeni';
import { Package } from '../Package';

@Package({
  name: 'processorValidation'
})
export class ProcessorValidation {

  @Config()
  config(dgeni: Dgeni) {
    dgeni.stopOnValidationError = true;
  }

  @Event('generationStart')
  validateProcessors(log: Log, dgeni: Dgeni) {
    const validationErrors = [];

    let validationPromise = Q();

    // Apply the validations on each processor
    dgeni.processors.forEach(function (processor) {
      validationPromise = validationPromise.then(function () {
        return validate.async(processor, processor.$validate).catch(function (errors) {
          validationErrors.push({
            processor: processor.name,
            package  : processor.$package,
            errors   : errors
          });
          log.error('Invalid property in "' + processor.name + '" (in "' + processor.$package + '" package)');
          log.error(errors);
        });
      });
    });

    validationPromise = validationPromise.then(function () {
      if (validationErrors.length > 0 && dgeni.stopOnValidationError) {
        return Q.reject(validationErrors);
      }
    });

    return validationPromise;
  }
}
