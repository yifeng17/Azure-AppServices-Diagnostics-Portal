import { TimeSeriesType } from '../models/detector';

export class HighchartsUtilities {
    public static getChartType(chartType: TimeSeriesType) {
        let type: string;

        switch (chartType as TimeSeriesType) {
            case TimeSeriesType.StackedAreaGraph:
                type = 'area';
                break;
            case TimeSeriesType.BarGraph:
                type = 'column';
                break;
            case TimeSeriesType.LineGraph:
            default:
                type = 'line';
                break;
        }

        return type;
    }
}
