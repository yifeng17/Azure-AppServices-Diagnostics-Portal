
import { map, retry, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseMessageEnvelope } from '../models/responsemessageenvelope';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../startup/services/auth.service';
import { ArmService } from './arm.service';
import { DetectorResponse, DetectorMetaData } from 'diagnostic-data';
import { CategoryService } from '../../shared-v2/services/category.service';



@Injectable()
export class DetectorCategorizationService {

    resourceId: string;
    detectorCategories: any = {};

    constructor(private categoryService: CategoryService, private _armService: ArmService, private _authService: AuthService) {
        this.categoryService.categories.subscribe(categories => {
            categories.forEach((category) => {
                if (!this.detectorCategories.hasOwnProperty(category.id))
                {
                    this.detectorCategories[category.id]=[];
                }
            })
        });
    }

    public addDetectorToCategory(detectorId: string, categoryId: string) {
        if (!this.detectorCategories.hasOwnProperty(categoryId))
        {
            this.detectorCategories[categoryId]=[detectorId];
            console.log("uncategorized detectors is empty in current category", detectorId, categoryId, this.detectorCategories);
        }
        else
        {
            this.detectorCategories[categoryId].push(detectorId);
            console.log("uncategorized detectors exists", detectorId, categoryId, this.detectorCategories);
        }
    }
}
