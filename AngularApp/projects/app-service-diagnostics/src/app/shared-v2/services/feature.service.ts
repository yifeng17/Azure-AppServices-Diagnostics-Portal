import { Injectable } from '@angular/core';
import { DiagnosticService, DetectorMetaData, DetectorType } from 'diagnostic-data';
import { Category } from '../models/category';
import { Feature, FeatureType, FeatureTypes, FeatureAction } from '../models/features';
import { ContentService } from './content.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../startup/services/auth.service';
import { LoggingV2Service } from './logging-v2.service';
import { OperatingSystem } from '../../shared/models/site';
import { WebSitesService } from '../../resources/web-sites/services/web-sites.service';
import { AppType } from '../../shared/models/portal';

@Injectable()
export class FeatureService {

  public detectors: DetectorMetaData[];

  protected _features: Feature[] = [];
  protected _featureDisplayOrder = [];

  constructor(protected _diagnosticApiService: DiagnosticService, protected _contentService: ContentService, protected _router: Router, protected _authService: AuthService,
    protected _logger: LoggingV2Service, protected _resourceService: WebSitesService) {

    this._featureDisplayOrder = [{
      category: "Availability and Performance",
      platform: OperatingSystem.windows,
      appType: AppType.WebApp,
      order: ['appdownanalysis', 'perfanalysis', 'webappcpu', 'memoryusage', 'webapprestart'].reverse()
    }];

    this._authService.getStartupInfo().subscribe(startupInfo => {
      this._diagnosticApiService.getDetectors().subscribe(detectors => {
        detectors.forEach(detector => {
          if (detector.type === DetectorType.Detector) {
            this._features.push(<Feature>{
              id: detector.id,
              description: detector.description,
              category: detector.category,
              featureType: FeatureTypes.Detector,
              name: detector.name,
              clickAction: this._createFeatureAction(detector.name, detector.category, () => {
                this._router.navigateByUrl(`resource${startupInfo.resourceId}/detectors/${detector.id}`);
              })
            });
          } else {
            this._features.push(<Feature>{
              id: detector.id,
              description: detector.description,
              category: detector.category,
              featureType: FeatureTypes.Detector,
              name: detector.name,
              clickAction: this._createFeatureAction(detector.name, detector.category, () => {
                this._router.navigateByUrl(`resource${startupInfo.resourceId}/analysis/${detector.id}`);
              })
            });
          }
        });

        this.sortFeatures();
      });

      this._contentService.getContent().subscribe(articles => {
        articles.forEach(article => {
          this._features.push(<Feature>{
            id: article.title,
            name: article.title,
            description: article.description,
            category: '',
            featureType: FeatureTypes.Documentation,
            clickAction: this._createFeatureAction(article.title, 'Content', () => {
              window.open(article.link, '_blank');
            })
          });
        });
      });
    });
  }

  sortFeatures() {
    let featureDisplayOrder = this._featureDisplayOrder;

    featureDisplayOrder.forEach(feature => {

      if (feature.platform === this._resourceService.platform && this._resourceService.appType === feature.appType) {
        // Add all the features for this category to a temporary array
        let categoryFeatures: Feature[] = [];
        this._features.forEach(x => {
          if (x.category != null && x.category.indexOf(feature.category) > -1) {
            categoryFeatures.push(x);
          }
        });

        // Remove all the features for the sorted category
        this._features = this._features.filter(x => {
          return x.category !== feature.category;
        });

        // Sort all the features for this category
        categoryFeatures.sort(
          function (a, b) {
            let categoryOrder = featureDisplayOrder.find(x => x.category.toLowerCase().startsWith(feature.category.toLowerCase()));
            if (categoryOrder != null) {
              if (categoryOrder.order.indexOf(a.id.toLowerCase()) < categoryOrder.order.indexOf(b.id.toLowerCase())) {
                return 1;
              } else if (categoryOrder.order.indexOf(b.id.toLowerCase()) === categoryOrder.order.indexOf(a.id.toLowerCase())) {
                return 0;
              }
              else {
                return -1;
              }
            }
          }
        );

        // add the sorted features for this category back to the array
        this._features = this._features.concat(categoryFeatures);
      }
    });

  }

  protected _createFeatureAction(name: string, category: string, func: Function): FeatureAction {
    return () => {
      this._logger.LogClickEvent(name, 'feature', category);
      func();
    };
  }

  getFeaturesForCategory(category: Category) {
    return this._features.filter(feature => feature.category === category.name);
  }

  getFeatures(searchValue?: string) {
    if (!searchValue || searchValue === '') {
      return this._features;
    }

    searchValue = searchValue.toLowerCase();
    return this._features.filter(feature => {
      return feature.name.toLowerCase().indexOf(searchValue) != -1
        || (feature.category && feature.category.toLowerCase().indexOf(searchValue) != -1)
        || (feature.description && feature.description.toLowerCase().indexOf(searchValue) != -1);
    });
  }
}