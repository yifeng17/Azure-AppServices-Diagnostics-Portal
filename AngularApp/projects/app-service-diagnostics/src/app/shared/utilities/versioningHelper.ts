import { DemoSubscriptions } from "../../betaSubscriptions";

export class VersioningHelper {

    static isV2Subscription(subscriptionId: string): boolean {

        // When we decide to enable the A/B testing for v2, change this to true
        let enableV2 = true;

        let isBetaSubscription = DemoSubscriptions.betaSubscriptions.findIndex(item => subscriptionId.toLowerCase() === item.toLowerCase()) > -1;
        if (isBetaSubscription) {
            return true;
        }

        let firstDigit = "0x" + subscriptionId.substr(0, 1);

        return (parseInt(firstDigit, 16) > 14) && enableV2;
    }
}
