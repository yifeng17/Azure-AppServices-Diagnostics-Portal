import { Injectable } from '@angular/core';
import { SeverityLevel } from '../models/telemetry';
import { KustoTelemetryService } from './telemetry/kusto-telemetry.service';

@Injectable({
  providedIn: 'root'
})
export class UnhandledExceptionHandlerService {

  constructor(private logService: KustoTelemetryService) { }

  handleError(error: Error) {
    try {
      this.logService.logException(error, null, null, null, SeverityLevel.Critical);
    }
    catch(err) {
      // Squash logging error
    }
  }
}
