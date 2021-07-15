import { DropdownStepView, InfoStepView, StepFlow, StepFlowManager, CheckStepView, StepViewContainer, InputStepView, PromiseCompletionSource, TelemetryService } from 'diagnostic-data';
export class SubnetDeletionWordings {
    constructor() {
        this.subnetIsLocked = {
            get(locks, lockUri) {
                return new InfoStepView({
                    infoType: 1,
                    title: "Recommendations: remove the lock",
                    markdown: `Subnet is locked by ${locks.length} lock(s): ${locks.map(l => l.name).join(", ")}. \r\n\r\n` +
                        `You cannot delete a subnet if it's locked. Please remove them [here](${lockUri}) to unblock subnet deletion`
                });
            }
        }

        this.subnetIsNotUsedByAppService = {
            get() {
                return new InfoStepView({
                    infoType: 1,
                    title: "Subnet is used by another Azure service",
                    markdown: `Subnet is not locked nor used by AppService. But it was used by another Azure service thus it cannot be deleted.`
                });
            }
        }

        this.subnetIsNotUsed = {
            get() {
                return new InfoStepView({
                    infoType: 1,
                    title: "No problem detected",
                    markdown: `Subnet is not locked nor used by any Azure service thus it can be safely deleted. If deletion continues to fail, please contact Azure Network team via support.`
                });
            }
        }

        this.subnetIsInUse = {
            get(apps) {
                return new InfoStepView({
                    infoType: 1,
                    title: "Subnet is in use",
                    markdown: `Subnet is used by following app(s): ${apps.map(app => app.name).join(", ")}. \r\n\r\n` +
                        "Subnet cannot be deleted when it's in use. Please disconnect the VNet integration before deleting the subnet."
                });
            }
        }

        this.noPermission = {
            get(uri) {
                var views = [];
                views.push(new CheckStepView({
                    title: `You don't have permission to read serverfarm ${asp}`,
                    level: 1
                }));
                views.push(InfoStepView({
                    infoType: 1,
                    title: "Have no permission",
                    markdown: `Check is terminated because you don't have permission to access **${uri}**. Please grant the permission, refresh the page and run this check again.`
                }));
                return views;
            }
        }

        this.orphanSalDetected = {
            get(uri) {
                uri = uri.replace("/virtualNetworks/", "\r\n/virtualNetworks/");
                var views = [];
                views.push(new CheckStepView({
                    title: `Orphaned Service Association Link detected: ${uri}`,
                    level: 2
                }));
                return views;
            }
        }

        this.noWriteDeletePermissionOverScope = {
            get(uri, writePerm, deletePerm) {
                var views = [];
                var perms = [!writePerm ? "write" : null, !deletePerm ? "delete" : null].filter(p => p != null).join(" and "); //write and delete
                views.push(new CheckStepView({
                    title: `You don't have ${perms} permission over scope ${uri}`,
                    level: 2
                }));

                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Have no permission",
                    markdown: `Failed to delete orphaned Service Association Link because you don't have ${perms} permission over scope **${uri}**. Please grant the permission and remove the lock if there is any, refresh the page and run this check again.`
                }));
                return views;
            }
        }

        this.resourcesGoingToCreate = {
            get(resources) {
                var views = [];
                var table = "|Resource Type|Id|\r\n| --- | --- |";
                for (var type in resources) {
                    table += `\r\n|${type}|${resources[type]}|`;
                }
                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Problem detected",
                    markdown: `The tool is going to fix the problem which blocks subnet deletion. During the fixing process, following resources will be created.\r\n\r\n` +
                        table + "\r\n\r\n" +
                        "The tool will delete all these resources after Service Association Link deletion is done. \r\n\r\n" +
                        "By clicking **Continue** you agree to create these temporary resources."
                }));
                return views;
            }
        }

        this.subscriptionNotExist = {
            get(subscription) {
                var views = [];
                views.push(new CheckStepView({
                    title: `Subscription ${subscription} doesn't exist`,
                    level: 2
                }));

                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Subscription doesn't exist",
                    markdown: `Failed to delete orphaned Service Association Link because subscription **${subscription}** no longer exists. \r\n\r\n` +
                        `Please consider creating a support request.`
                }));
                return views;
            }
        }

        this.salDeletionResult = {
            get(salDeletionSucceeded, resourceDeletionResult) {
                var views = [];
                var resourceDeletionSucceeded = Object.values(resourceDeletionResult).every(i => i == true);
                var markdown = "";

                if (salDeletionSucceeded) {
                    views.push(new CheckStepView({
                        title: "Successfully removed orphaned Service Association Link",
                        level: 0
                    }));

                    markdown += "Successfully removed orphaned Service Association Link, please hit refresh button and run the checks again.\r\n\r\n";
                } else {
                    views.push(new CheckStepView({
                        title: "Failed to remove orphaned Service Association Link",
                        level: 2
                    }));

                    markdown += "Failed to remove orphaned Service Association Link, please consider creating a support request.\r\n\r\n";
                }

                var table = "|Resource Id|Deletion|\r\n| --- | --- |";
                for (var resourceId in resourceDeletionResult) {
                    table += `\r\n|${resourceId}|${resourceDeletionResult[resourceId] ? `<span style="color:green"> **success** </span>` : ` <span style="color:red"> **fail** </span>`}|`;
                }

                if(resourceDeletionSucceeded){
                    views.push(new CheckStepView({
                        title: "Successfully cleaned up all temporary resources.",
                        level: 0
                    }));
                    markdown += "Successfully cleaned up all temporary resources.\r\n\r\n"
                        + table + "\r\n\r\n";
                }else{
                    views.push(new CheckStepView({
                        title: "Failed to clean up some temporary resource.",
                        level: 2
                    }));
                    markdown += "Failed to clean up some temporary resource.\r\n\r\n"
                        + table + "\r\n\r\nClick **Retry** to try again or try deleting them manually.";
                }

                views.push(new InfoStepView({
                    infoType: 1,
                    title: "Result",
                    markdown: markdown
                }));
                return views;
            }
        }
    }
}