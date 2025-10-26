// Base value types that can appear in WIF files
type WifFieldType = string | number | boolean | number[] | string[] | boolean[];

// Known WIF sections with their specific field structures
interface KnownWifSections {
  contents?: Record<string, WifFieldType>;
  
  wif?: Record<string, WifFieldType> & {
    version?: number;
  };
  
  weaving?: Record<string, WifFieldType> & {
    shafts?: number;
    treadles?: number;
    risingShed?: boolean;
  };
  
  warp?: Record<string, WifFieldType> & {
    threads?: number;
    units?: string;
    spacing?: number;
    thickness?: number;
  };
  
  weft?: Record<string, WifFieldType> & {
    threads?: number;
    units?: string;
    spacing?: number;
    thickness?: number;
  };
  
  // Pattern sections with consistent types
  tieup?: Record<string, number[]>;
  threading?: Record<string, number>;
  treadling?: Record<string, number>;
}

// WIF file sections - combines known structure with flexibility
interface WifSections extends KnownWifSections {
  // Index signature for unknown/custom sections
  [sectionName: string]: Record<string, WifFieldType> | undefined;
}

// Main WifState type
type WifState = {
  sections: WifSections;
}

// // Schema-related types for your factory
// type WifFieldType = 'string' | 'number' | 'float' | 'boolean' | 'numberArray' | 'stringArray';

interface WifSectionSchema {
  fields?: Record<string, WifFieldType>;
  defaultValueType?: WifFieldType;
}

interface WifSchema {
  [sectionName: string]: WifSectionSchema;
}

// Export all types
export type { 
  WifState, 
  WifSections, 
  KnownWifSections,
  WifSchema, 
  WifSectionSchema, 
  WifFieldType 
};