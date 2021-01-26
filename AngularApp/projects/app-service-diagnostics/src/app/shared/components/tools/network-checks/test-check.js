export async function sampleJsCheck(appSettings, armService){
    var s = Object.keys(appSettings).map(key => key + ":" + appSettings[key]);
    return [0, s.join(";")];
}