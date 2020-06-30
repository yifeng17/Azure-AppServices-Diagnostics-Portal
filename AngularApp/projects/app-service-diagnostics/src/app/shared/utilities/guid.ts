export class Guid {
    private static readonly guidRegex = new RegExp('[xy]', 'g');
    static newGuid(): string {
        let returnValue = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(Guid.guidRegex, function(c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return returnValue;
    }
    static newShortGuid(): string {
        let returnValue = 'xxxxxxxx-yxxx'.replace(Guid.guidRegex, function(c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return returnValue;
    }
    static newTinyGuid(): string {
        let returnValue = 'yxxx'.replace(Guid.guidRegex, function(c) {
            var r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return returnValue;
    }

    static newCustomGuid(length: number): string {
        if (length > 0) {
            let returnValue = 'x'.repeat(length).replace(Guid.guidRegex, c => {
                var r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            return returnValue;
        }

        return '';
    }
}