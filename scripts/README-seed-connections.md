# Connection Seeding Script

This script seeds the `Connections` table with realistic connection data for testing similarity algorithms and visualizing the network graph.

## Quick Start

```bash
# Basic seeding with medium density
npm run seed:connections

# Clear existing and create sparse connections
npm run seed:connections:sparse

# Clear existing and create dense connections
npm run seed:connections:dense

# Test with limited connections
npm run seed:connections:test
```

## Manual Usage

```bash
# Full command with all options
npx tsx scripts/seed-connections.ts --clear --density medium --max 500 --distribution realistic --no-weak

# Show help
npx tsx scripts/seed-connections.ts --help
```

## Options

| Option | Values | Description |
|--------|--------|-------------|
| `--clear` | - | Clear existing connections before seeding |
| `--density` | `sparse`, `medium`, `dense`, `full` | Connection density (default: medium) |
| `--max` | number | Maximum number of connections to create |
| `--distribution` | `random`, `realistic`, `clustered` | Weight distribution pattern (default: realistic) |
| `--no-weak` | - | Exclude weak connections (weight ≤ 2) |

## Density Levels

- **Sparse (10%)**: Minimal connections, good for testing isolated clusters
- **Medium (30%)**: Balanced network, good for general testing
- **Dense (60%)**: Highly connected network, good for testing performance
- **Full (100%)**: Everyone connected to everyone (use with caution!)

## Weight Distributions

### Realistic (Default)
- 60% weak connections (weight 1-3)
- 25% medium connections (weight 4-7)
- 15% strong connections (weight 8-10)

### Random
- Uniform distribution across all weights (1-10)

### Clustered
- Creates tight clusters with strong internal connections
- Weak connections between clusters
- Good for testing community detection

## Examples

```bash
# Create a sparse network for testing similarity algorithms
npm run seed:connections:sparse

# Create clustered network to test community detection
npx tsx scripts/seed-connections.ts --clear --distribution clustered --density medium

# Create dense network without weak connections
npx tsx scripts/seed-connections.ts --clear --density dense --no-weak

# Create exactly 200 connections with random weights
npx tsx scripts/seed-connections.ts --clear --max 200 --distribution random
```

## Sample Output

```
🌱 Starting connection seeding...
🧹 Clearing existing connections...
   Deleted 450 existing connections
👥 Fetching users...
   Found 25 users
🔗 Planning to create 75 connections (medium density)
🎲 Generating user pairs...
💾 Creating connections...
   Inserting 150 total connections (bidirectional)...
✅ Connection seeding completed!

📊 Summary:
    - Users: 25
    - Connections created: 150
    - Average connections per user: 6.0
    - Weight distribution: realistic
    - Density: medium

🔗 Sample connections:
   Alice ↔ Bob (weight: 9) - Collaborated on multiple projects together
   Charlie ↔ Dana (weight: 7) - Share some common interests
   Eve ↔ Frank (weight: 4) - Met at a conference, stayed in touch
```

## Use Cases

### Testing Similarity Algorithms
```bash
# Start with sparse connections
npm run seed:connections:sparse

# Run your similarity algorithm
# Compare results with dense connections
npm run seed:connections:dense
```

### Nook Visualization Testing
```bash
# Test with different densities to see how the graph behaves
npm run seed:connections:sparse   # Easy to see individual connections
npm run seed:connections:medium   # Balanced view
npm run seed:connections:dense    # Test performance with many connections
```

### Algorithm Development
```bash
# Create controlled test data
npx tsx scripts/seed-connections.ts --clear --max 50 --distribution clustered

# Verify your algorithm detects the clusters correctly
```

## Notes

- Connections are bidirectional (A→B and B→A both created)
- Script prevents duplicate connections with the unique constraint
- Uses realistic descriptions based on connection strength
- Ensures no user is completely isolated
- Batch inserts for performance with large datasets