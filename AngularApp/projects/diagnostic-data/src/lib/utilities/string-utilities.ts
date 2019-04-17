export class StringUtilities {
    static TrimStart(target: string, trimSubstring?: string): string {
        if (trimSubstring == undefined) {
            return target.replace(/^\s+/m, '');
        }

        let result = target;

        while (result.length >= trimSubstring.length && result.startsWith(trimSubstring)) {
            result = result.slice(trimSubstring.length);
        }

        return result;
    }

    static TrimEnd(target: string, trimSubstring?: string): string {
        if (trimSubstring == undefined) {
            return target.replace(/\s+$/m, '');
        }

        let result = target;

        while (result.length >= trimSubstring.length && result.endsWith(trimSubstring)) {
            result = result.slice(0, -1 * trimSubstring.length);
        }

        return result;
    }

    static TrimBoth(target: string, trimSubstring?: string): string {
        if (trimSubstring == undefined) {
            return target.trim();
        }

        return this.TrimStart(this.TrimEnd(target, trimSubstring), trimSubstring);
    }
}
