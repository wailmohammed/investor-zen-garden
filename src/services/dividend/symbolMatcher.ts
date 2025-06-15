
// Symbol matching utilities for Trading212 and other brokers
export const cleanSymbol = (rawSymbol: string): string => {
  // Remove common Trading212 suffixes
  let cleanedSymbol = rawSymbol.replace(/_US_EQ$|_EQ$|\.L$|\.TO$|_LON$|_NYSE$|_NASDAQ$/, '');
  
  // Handle specific Trading212 formatting quirks
  const symbolMappings: Record<string, string> = {
    'BRK.B': 'BRK.B',
    'RDS.A': 'SHEL',
    'RDSA': 'SHEL',
    'GOOGL': 'GOOGL',
    'GOOG': 'GOOG'
  };
  
  // Apply specific mappings if they exist
  if (symbolMappings[cleanedSymbol]) {
    cleanedSymbol = symbolMappings[cleanedSymbol];
  }
  
  return cleanedSymbol.toUpperCase();
};

// Enhanced symbol matching that tries multiple variations
export const findDividendSymbol = (rawSymbol: string, dividendDatabase: Record<string, any>): string | null => {
  const variations = [
    cleanSymbol(rawSymbol),
    rawSymbol.toUpperCase(),
    rawSymbol.replace(/_US_EQ$/, ''),
    rawSymbol.replace(/_EQ$/, ''),
    rawSymbol.replace(/\.L$/, ''),
    rawSymbol.replace(/\.TO$/, ''),
    rawSymbol.split('_')[0].toUpperCase(),
    rawSymbol.split('.')[0].toUpperCase()
  ];
  
  // Try each variation
  for (const variation of variations) {
    if (dividendDatabase[variation]) {
      console.log(`Symbol match found: ${rawSymbol} -> ${variation}`);
      return variation;
    }
  }
  
  // Log unmatched symbols for debugging
  console.log(`No dividend data found for symbol: ${rawSymbol} (tried: ${variations.join(', ')})`);
  return null;
};
