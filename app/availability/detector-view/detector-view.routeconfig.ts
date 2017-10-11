import { Route } from '@angular/router';

import { DetectorViewBaseComponent } from './detector-view-base/detector-view-base.component';
import { DetectorViewMainComponent } from './detector-view-main/detector-view-main.component';
import { SiteCpuAnalysisDetectorComponent } from './detectors/site-cpu-analysis-detector/site-cpu-analysis-detector.component';
import { SiteMemoryAnalysisDetectorComponent } from './detectors/site-memory-analysis-detector/site-memory-analysis-detector.component';
import { ThreadDetectorComponent } from './detectors/thread-detector/thread-detector.component';
import { FrebAnalysisDetectorComponent } from './detectors/freb-analysis-detector/freb-analysis-detector.component';
import { PhpLogAnalyzerComponent } from './detectors/php-log-analyzer-detector/php-log-analyzer-detector.component';
import { CommittedMemoryUsageComponent } from './detectors/committed-memory-detector/committed-memory-detector.component';
import { PageFileOperationsComponent } from './detectors/page-operations-detector/page-operations-detector.component';
import { AspNetCoreComponent } from "./detectors/aspnetcore-detector/aspnetcore-detector.component";

export const DetectorViewRouteConfig: Route[] = [
    {
        path: 'sitecpuanalysis',
        component: SiteCpuAnalysisDetectorComponent,
        data: {
            navigationTitle: 'CPU Analysis'
        }
    },
    {
        path: 'sitememoryanalysis',
        component: SiteMemoryAnalysisDetectorComponent,
        data: {
            navigationTitle: 'Memory Analysis'
        }
    },
    { 
        path: 'threadcount', 
        component: ThreadDetectorComponent, 
        data:{
            navigationTitle: 'Threads Usage'
        } 
    },
    { 
        path: 'frebanalysis', 
        component: FrebAnalysisDetectorComponent,
        data: {
            navigationTitle: 'Failed Request Traces'
        } 
    },
    { 
        path: 'loganalyzer', 
        component: PhpLogAnalyzerComponent,
        data: {
            navigationTitle: 'Php Logs'
        } 
    },
    { 
        path: 'committedmemoryusage', 
        component: CommittedMemoryUsageComponent,
        data: {
            navigationTitle: 'Committed Memory Usage'
        } 
    },
    { 
        path: 'pagefileoperations', 
        component: PageFileOperationsComponent,
        data: {
            navigationTitle: 'Page File Operations'
        } 
    },
    { 
        path: 'aspnetcore', 
        component: AspNetCoreComponent,
        data: {
            navigationTitle: 'AspNetCore Logs'
        } 
    },
    { 
        path: ':detectorName', 
        component: DetectorViewBaseComponent,
        data:{
            navigationTitle: ':detectorName'
        }
    }
];