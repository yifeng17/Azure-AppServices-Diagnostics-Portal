export interface ChartSeries {
    key: string;
    metricName: string;
    values: ChartPoint[];
    area: boolean;
    roleInstance: string;
    isAggregated: boolean;
}

export interface ChartPoint {
    x: any;
    y: number;
}

export enum ChartType {
    multiBarChart,
    lineChart,
    stackedAreaChart
}