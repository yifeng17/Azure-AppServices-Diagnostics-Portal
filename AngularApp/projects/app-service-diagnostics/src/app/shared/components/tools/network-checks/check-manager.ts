declare var jsDynamicImportChecks: any;
export class CheckManager {
    private static _jsUrl = "http://127.0.0.1:8000/test-check.js";
    private static _debugModeJsUrl = "http://127.0.0.1:8000/test-check.js";
    private static _remoteCheckPromise:Promise<any[]>;
    static loadRemoteCheckAsync(reset:boolean = false): Promise<any[]> {
        if (reset || CheckManager._remoteCheckPromise == null) {
            CheckManager._remoteCheckPromise = new Promise<any[]>((resolve, reject) => {
                var existedScript = document.getElementById("remoteChecks");
                if (existedScript != null) {
                    document.head.removeChild(existedScript);
                }
                var script = document.createElement("script");
                script.setAttribute('type', 'text/javascript');
                var url = window["NetworkCheckDebugMode"] ? CheckManager._debugModeJsUrl : CheckManager._jsUrl;
                script.setAttribute('src', url);
                script.setAttribute('id', "remoteChecks");
                script.onload = () => {
                    console.log("remote script loaded!");
                    console.log(script);
                    if (typeof jsDynamicImportChecks != 'undefined') {
                        resolve(jsDynamicImportChecks);
                    }
                    else {
                        resolve([]);
                    }
                }
                script.onerror = () => {
                    resolve([]);
                }
                document.head.appendChild(script);
            });
        }
        return CheckManager._remoteCheckPromise;
    }
}