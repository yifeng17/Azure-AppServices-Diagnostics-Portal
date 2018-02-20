import { Injectable } from '@angular/core';
import { ProblemType, Category } from '../models/problem-category';
import * as _ from 'underscore';
import { OperatingSystem, Site, SiteExtensions } from '../models/site';
import { operators } from 'rxjs';

@Injectable()
export class ProblemCategoriesService {

    private problemTypes: ProblemType[] = [];
    private Categories: Category[] = [];

    constructor() {
        this.initProblems();
    }

    initProblems(): void {

        let perfCategory = new Category();
        perfCategory.Name = "Availability and Performance";
        perfCategory.Collapsed = false;
        perfCategory.ProblemTypes = [];

        perfCategory.ProblemTypes.push({
            Name: 'Web App Down',
            BgColor: '#1446a0',
            TextColor: 'White',
            Href: 'availability/analysis',
            OperatingSystem: OperatingSystem.windows || OperatingSystem.linux
        });

        perfCategory.ProblemTypes.push({
            Name: 'Web App Slow',
            BgColor: '#ef476f',
            TextColor: 'White',
            Href: 'performance/analysis',
            OperatingSystem: OperatingSystem.windows || OperatingSystem.linux
        });

        perfCategory.ProblemTypes.push({
            Name: 'High CPU Usage',
            BgColor: '#540d6e',
            TextColor: 'White',
            Href: 'availability/detectors/sitecpuanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        perfCategory.ProblemTypes.push({
            Name: 'High Memory Usage',
            BgColor: 'rgb(1, 185, 137)',
            TextColor: 'White',
            Href: 'availability/memoryanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        perfCategory.ProblemTypes.push({
            Name: 'Container Initialization',
            BgColor: '#540d6e',
            TextColor: 'White',
            Href: 'availability/detectors/dockercontainerstartstop',
            OperatingSystem: OperatingSystem.linux
        });
        
        
        let monitorCategory = new Category();
        monitorCategory.Name = "Monitor";
        monitorCategory.ProblemTypes = [];

        monitorCategory.ProblemTypes.push({
            Name: 'Web App Restarted',
            BgColor: 'rgb(234, 131, 0)',
            TextColor: 'White',
            Href: 'availability/apprestartanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        monitorCategory.ProblemTypes.push({
            Name: 'TCP Connections',
            BgColor: 'rgb(59, 99, 123)',
            TextColor: 'White',
            Href: 'availability/tcpconnectionsanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        let toolsCategory = new Category();
        toolsCategory.Name = "Diagnostic Tools";
        toolsCategory.ProblemTypes = [];

        toolsCategory.ProblemTypes.push({
            Name: 'CLR Profiling Tool',
            BgColor: 'rgb(153, 51, 0)',
            TextColor: 'White',
            Href: 'availability/apprestartanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        toolsCategory.ProblemTypes.push({
            Name: 'Database Tester',
            BgColor: 'rgb(102, 153, 0)',
            TextColor: 'White',
            Href: 'availability/tcpconnectionsanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        toolsCategory.ProblemTypes.push({
            Name: 'Client Cert Checker',
            BgColor: 'rgb(0, 102, 153)',
            TextColor: 'White',
            Href: 'availability/tcpconnectionsanalysis',
            OperatingSystem: OperatingSystem.windows
        });

        this.Categories.push(perfCategory);
        this.Categories.push(monitorCategory);
        this.Categories.push(toolsCategory);
    }

    getCategories(site: Site): Category[] {
        let categories = this.Categories.filter(c => c.ProblemTypes.filter(x => x.OperatingSystem === SiteExtensions.operatingSystem(site)));
        return categories;
    }
}