export enum CommonLogEventType {
    Message,
    Error,
    Click,
    StartUp,
    MissingSolution,
    Feedback,
    FeedbackMessage,
    TabOpened,
    TabClosed
}

export enum AvailabilityEventType {
    AnalysisInitialized,
    CurrentAppHealth,
    DowntimeVisitedSummary,
    SolutionExpanded,
    SolutionTried,
    InlineActionTriggered,
    InlineSubActionSummary,
    AppAnalysisSummary,
    DetectorViewOpened,
    DetectorViewInstanceSelected,
    AppRestartAnalysisSummary,
    MemorySummaryStatus,
    SummaryViewExpanded, 
    SolutionDisplayed,
    SolutionFeedback
}

export enum BotEventType{
    HealthCheckInvoked,
    HealthCheckReportStats,
    DetectorViewChatDisplayed
}