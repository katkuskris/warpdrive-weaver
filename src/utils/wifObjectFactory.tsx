import type { WifState } from '../types/wifData';

/**
 * Factory function for creating WIF objects from parsed JSON data
 */
export class WifObjectFactory {
    /**
     * Creates a WIF object from JSON data
     * @param jsonData - The parsed JSON data from the WIF file
     * @returns A structured WIF object
     */
    static createFromJson(jsonData: any): WifState {
        try {
            // Validate the input data first
            if (!this.validate(jsonData)) {
                throw new Error('Invalid WIF JSON structure - validation failed');
            }

            // Now we know jsonData.sections exists and is valid
            const wifObject: WifState = {
                sections: jsonData.sections
            };

            return wifObject;
        } catch (error) {
            throw new Error(`Failed to create WIF object: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Creates a default/empty WIF object
     * @returns A default WIF object structure
     */
    static createDefault(): WifState {
        return {
            sections: {
                wif: {
                    version: 1.1,
                    date: new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    }),
                    developers: "warpdrive-weaver",
                    sourceProgram: "WarpDrive Weaver",
                },
                contents: {
                    wif: true,
                    weaving: false,
                    warp: false,
                    weft: false,
                    threading: false,
                    tieup: false,
                    treadling: false
                }
            }
        };
    }

    /**
     * Validates if the provided data can be used to create a valid WIF object
     * @param jsonData - The data to validate
     * @returns True if valid, false otherwise
     */
    static validate(jsonData: any): boolean {
        try {
            // Quick structural checks
            if (!jsonData?.sections || typeof jsonData.sections !== 'object') {
                return false;
        
            }

            // Must have wif section with version
            if (!jsonData.sections.wif?.version || typeof jsonData.sections.wif.version !== 'number') {
                return false;
            }

            // If it has basic structure, assume it's valid
            // Let createFromJson handle detailed validation
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Transforms WIF object back to JSON format
     * @param wifObject - The WIF object to serialize
     * @returns JSON representation
     */
    static toJson(wifObject: WifState): string {
        try {
            return JSON.stringify(wifObject, null, 2);
        } catch (error) {
            throw new Error(`Failed to serialize WIF object: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}