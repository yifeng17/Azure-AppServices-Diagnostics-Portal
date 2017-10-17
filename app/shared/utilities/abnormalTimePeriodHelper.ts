import { IDetectorAbnormalTimePeriod } from '../models/detectorresponse';

export class AbnormalTimePeriodHelper {

    static getMetaDataValue(period: IDetectorAbnormalTimePeriod, key: string) {
        let searchKey = key.toLowerCase();
        if (period.metaData && period.metaData.length > 0) {
            period.metaData.forEach(element => {
                element.forEach(nameValuePair => {
                    if (nameValuePair.name.toLowerCase() === searchKey) {
                        return nameValuePair.value;
                    }
                });
            });
        }
    }

    static getMetaDataValues(period: IDetectorAbnormalTimePeriod, key: string) {
        let values: string[] = [];
        let searchKey = key.toLowerCase();
        if (period.metaData && period.metaData.length > 0) {
            period.metaData.forEach(element => {
                element.forEach(nameValuePair => {
                    if (nameValuePair.name.toLowerCase() === searchKey) {
                        values.push(nameValuePair.value);
                    }
                });
            });
        }

        return values;
    }
}