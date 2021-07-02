import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
export class SubnetDeletionWordings {
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

        this.NoPermission = {
            Get(uri) {
                return new InfoStepView({
                    infoType: 1,
                    title: "Have no permission",
                    markdown: `Check is terminated because you don't have permission to access **${uri}**. Please grant the permission, refresh the page and run this check again.`
                });
            }
        }
        
        this.OrphanSalDetected = {
            Get(uri) {
                uri = uri.replace("/virtualNetworks/", "\r\n/virtualNetworks/");
                var views = [];
                views.push(new CheckStepView({
                    title: `Orphaned SAL detected: ${uri}`,
                    level: 1
                }));
                return views;
            }
        }

        this.NoWriteDeletePermissionOverScope = {
            Get(uri, writePerm, deletePerm) {
                var views = [];
                var perms = [!writePerm ? "write" : null, !deletePerm ? "delete" : null].filter(p => p != null).join(" and "); //write and delete
                views.push(new CheckStepView({
                    title: `You don't have ${perms} permission over scope ${uri}`,
                    level: 2
                }));

                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Have no permission",
                    markdown: `Failed to delete orphaned SAL because you don't have ${perms} permission over scope **${uri}**. Please grant the permission and remove the lock if there is any, refresh the page and run this check again.`
                }));
                return views;
            }
        }

        this.ResourcesGoingToCreate = {
            Get(resources) {
                var views = [];
                var table = "|Resource Type|Id|\r\n| --- | --- |";
                for(var type in resources){
                    table+=`\r\n|${type}|${resources[type]}|`;
                }
                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Problem detected",
                    markdown: `We are going to fix the problem which blocks subnet deletion. During the fixing process, following temporal resources will be created.\r\n\r\n`
                        + table + "\r\n\r\n"
                        + "We will delete all these resources after SAL deletion is done. \r\n\r\n"
                        + "By clicking **Continue** you agree to create these resources temporally."
                }));
                return views;
            }
        }
    }
}