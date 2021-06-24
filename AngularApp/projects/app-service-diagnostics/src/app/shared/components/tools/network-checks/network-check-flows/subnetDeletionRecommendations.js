import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
export class SubnetDeletionRecommendations {
    constructor() {
        this.SubnetIsLocked = {
            Get(locks, lockUri) {
                return new InfoStepView({
                    infoType: 1,
                    title: "Recommendations: remove the lock",
                    markdown: `Subnet is locked by ${locks.length} lock(s): ${locks.map(l => l.name).join(", ")}. \r\n\r\n` +
                        `You cannot delete a subnet if it's locked. Please remove them [here](${lockUri}) to unblock subnet deletion`
                });
            }
        }

        this.SubnetIsNotUsedByAppService = {
            Get() {
                return new InfoStepView({
                    infoType: 1,
                    title: "Subnet is used by other Azure service",
                    markdown: `Subnet is not locked nor used by AppService. But it was used by other Azure service thus it cannot be deleted.`
                });
            }
        }

        this.SubnetIsNotUsed = {
            Get() {
                return new InfoStepView({
                    infoType: 1,
                    title: "No problem detected",
                    markdown: `Subnet is not locked nor used by any Azure service thus it can be safely deleted. If deletion continues to fail, please check with Azure Network team.`
                });
            }
        }

        this.SubnetIsInUse = {
            Get(apps) {
                return new InfoStepView({
                    infoType: 1,
                    title: "Subnet is in use",
                    markdown: `Subnet is used by following app(s): ${apps.map(app => app.name).join(", ")}. \r\n\r\n` +
                        "Subnet cannot be deleted when it's in use. Please disconnect the VNet integration before deleting the subnet."
                });
            }
        }
    }
}