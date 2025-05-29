# User Similarity Scoring System

A comprehensive system for calculating user similarity based on profile data, behavioral patterns, and network connections. The system automatically updates the `Connections` table with weighted similarity scores that power the network visualization.

## Overview

The similarity system analyzes user profiles to determine how similar users are to each other:

- **Profile Similarity** (100%): Keywords, bio content, affiliations

## Architecture

### Core Components

1. **`SimilarityCalculator`** - Core algorithm implementation
2. **`SimilarityDataProcessor`** - Data extraction and preprocessing
3. **`SimilarityService`** - High-level orchestration and database updates
4. **Types** - TypeScript interfaces for type safety

### Similarity Factors

#### Profile Similarity (100% total weight)
- **Keywords Overlap** (30%): Jaccard similarity on profile keywords
- **Bio Similarity** (45%): TF-IDF based text similarity
- **Affiliation Match** (25%): Organization/company similarity

## Usage

### Command Line Scripts

```bash
# Calculate similarities for all users
npm run similarity:calculate

# Clear existing algorithm connections and recalculate
npm run similarity:calculate:clear

# Dry run to preview changes
npm run similarity:dry-run

# Calculate for specific user
npm run similarity:user -- "user-id-here"

# Show help
npm run similarity:help
```

### Programmatic Usage

```typescript
import { SimilarityService } from 'src/lib/similarity/similarity-service';

const service = new SimilarityService();

// Calculate all similarities
const result = await service.calculateAndUpdateAllSimilarities();

// Calculate for specific user
const userSimilarities = await service.calculateSimilarityForUser(userId);

// Get detailed breakdown
const breakdown = await service.getSimilarityBreakdown(userId1, userId2);
```

### API Endpoints

#### Calculate Similarities
```
POST /api/similarity/calculate
{
  "action": "all" | "user" | "stats",
  "userId": "optional-user-id"
}
```

#### Get Similarity Breakdown
```
GET /api/similarity/calculate?userId1=xxx&userId2=yyy
```

## Algorithm Details

### Keyword Similarity
Uses Jaccard similarity coefficient:
```
similarity = |intersection| / |union|
```

### Bio Similarity
1. Tokenize and normalize text
2. Remove stop words
3. Calculate term overlap
4. Apply TF-IDF weighting (future enhancement)

### Affiliation Match
- Exact match scoring
- Partial organization name matching
- Keyword overlap in company names

### Event Pattern Similarity
- Analyzes event types attended/created
- Future: Time patterns, frequency analysis
- Uses Jaccard similarity on event type sets

### Activity Level Similarity
- Compares total event participation levels
- Normalizes by activity volume differences
- Higher similarity for users with comparable engagement

## Database Integration

### Connections Table Updates
The system updates the existing `Connections` table:
- **weight**: 1-10 similarity score
- **description**: Human-readable explanation
- **bidirectional**: Creates connections in both directions

### Generated Descriptions
The system now generates extremely detailed descriptions showing the complete calculation process:

**Example Description:**
```
STRONG SIMILARITY | CALCULATION BREAKDOWN: | • Keywords: 75.0% match × 30% weight = 22.5 points | • Bio Text: 45.2% match × 45% weight = 20.3 points | • Affiliation: 100.0% match × 25% weight = 25.0 points | • Raw Sum: 67.8 points | • Final Score: 67.8/100 → 7/10 | FACTOR ANALYSIS: HIGH keyword overlap (75.0%), MODERATE bio text similarity (45.2%), HIGH affiliation match (100.0%) | DOMINANT FACTOR: affiliation contributed 25.0 points (25% weight)
```

**Description Components:**
- **Similarity Level**: VERY STRONG/STRONG/MODERATE/WEAK based on final score
- **Calculation Breakdown**: Shows exact math for each factor
- **Factor Analysis**: Categorizes each factor as HIGH/MODERATE/LOW/NO match
- **Dominant Factor**: Identifies which factor contributed most to the final score

## Customization

### Adjusting Weights
```typescript
import { SimilarityService } from 'src/lib/similarity/similarity-service';

const customWeights = {
  keywords: 0.40,      // Increase keyword importance
  bio: 0.35,           // Adjust bio importance
  affiliation: 0.25,   // Adjust affiliation importance
};

const service = new SimilarityService(customWeights);
```

### Minimum Score Filtering
```bash
# Only create connections with score >= 5
npx tsx scripts/calculate-similarity.ts --min-score 5
```

## Performance Considerations

### Batch Processing
- Processes connections in batches of 50
- Progress reporting every 250 connections
- Graceful error handling for individual pairs

### Memory Optimization
- Streams user data processing
- Efficient data structures (Maps, Sets)
- Limited memory footprint for large datasets

### Computational Complexity
- O(n²) for full recalculation (all user pairs)
- O(n) for single user recalculation
- Suitable for datasets up to ~10k users

## Monitoring & Analytics

### Network Statistics
```typescript
const stats = await service.getNetworkSimilarityStats();
// Returns: total connections, average weight, distribution, etc.
```

### Available Metrics
- Total connections created/updated
- Weight distribution histogram
- High similarity pairs count (score ≥ 7)
- Last calculation timestamp
- Error rates and types

## Future Enhancements

### Advanced NLP
- Sentence embeddings (BERT, GPT)
- Semantic similarity beyond keyword matching
- Multi-language support

### Temporal Analysis
- Event timing patterns
- Activity rhythms
- Seasonal preferences

### Social Network Analysis
- Community detection
- Influence propagation
- Bridge detection

### Machine Learning
- Supervised learning from user feedback
- Collaborative filtering
- Deep learning embeddings

### Real-time Updates
- Incremental updates on profile changes
- Event-driven recalculation
- Webhook integrations

## Testing

### Unit Tests
```bash
# Run similarity algorithm tests
npm test -- similarity
```

### Integration Tests
```bash
# Test with sample data
npm run similarity:dry-run
```

### Performance Tests
```bash
# Benchmark with large datasets
npm run similarity:calculate -- --dry-run --verbose
```

## Troubleshooting

### Common Issues

#### No Similarities Calculated
- Check if users have profile data (keywords, bio)
- Verify minimum user count (≥2 required)
- Check for database connection issues

#### Low Similarity Scores
- Adjust similarity weights
- Review keyword quality in profiles
- Check bio content completeness

#### Performance Issues
- Reduce batch size for memory constraints
- Implement pagination for very large datasets
- Consider async processing for real-time apps

### Debug Mode
```bash
# Verbose output with detailed factor breakdown
npm run similarity:dry-run
```

### Error Recovery
```bash
# Clear problematic connections and restart
npm run similarity:calculate:clear
```

## Configuration

### Environment Variables
```env
# Optional: Custom similarity thresholds
SIMILARITY_MIN_SCORE=1
SIMILARITY_BATCH_SIZE=50

# Optional: Algorithm tuning
SIMILARITY_KEYWORD_WEIGHT=0.15
SIMILARITY_BIO_WEIGHT=0.15
```

### Database Configuration
Ensure the `Connections` table schema supports:
- Bidirectional relationships
- Weight values 1-10
- Text descriptions
- Timestamps for monitoring

## Contributing

### Adding New Similarity Factors
1. Update `SimilarityFactors` interface in `types.ts`
2. Implement calculation method in `SimilarityCalculator`
3. Add factor to overall scoring function
4. Update weights configuration
5. Add tests and documentation

### Optimizing Algorithms
1. Profile performance bottlenecks
2. Implement optimized data structures
3. Add benchmarking tests
4. Update performance documentation

### Extending Data Sources
1. Add new data extraction methods to `SimilarityDataProcessor`
2. Update `UserProfileAnalysis` interface
3. Implement corresponding similarity calculations
4. Add data validation and error handling