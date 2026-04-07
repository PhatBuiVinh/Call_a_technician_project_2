#!/usr/bin/env node
/**
 * Phase 1.5 Migration Script (Hardened)
 * Populates Job.assignedTo from legacy Job.technician string
 * 
 * Usage:
 *   node migrate-jobs-assignedTo.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Preview changes without writing to database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Load models
const Job = require('./models/Job');

// Tech Schema (inline to avoid circular deps)
const TechSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: true });
const Tech = mongoose.models.Tech || mongoose.model('Tech', TechSchema);

const DRY_RUN = process.argv.includes('--dry-run');

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in .env');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB... ${DRY_RUN ? '(DRY RUN - no changes will be made)' : ''}`);
  
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  
  console.log('MongoDB connected');
  console.log('\n========================================');
  console.log('Phase 1.5 Migration: Populate Job.assignedTo');
  console.log('========================================\n');

  // Find all jobs with non-empty technician string but no assignedTo
  const jobsToMigrate = await Job.find({
    technician: { $exists: true, $ne: '', $regex: /\S/ }, // Has non-whitespace content
    $or: [
      { assignedTo: { $exists: false } },
      { assignedTo: null }
    ]
  });

  console.log(`Found ${jobsToMigrate.length} jobs with technician but no assignedTo\n`);

  const stats = {
    matched: 0,
    matchedWithDuplicates: 0,
    unmatched: 0,
    ambiguous: 0,
    skippedWhitespace: 0,
    updated: 0,
    errors: 0
  };

  const unmatchedJobs = [];
  const ambiguousJobs = [];
  const duplicateJobs = [];
  const errors = [];

  // Build a cache of all techs by owner to detect duplicates
  const allTechs = await Tech.find({}).lean();
  const techNameCache = new Map(); // owner+name -> techs array
  
  for (const tech of allTechs) {
    const key = `${tech.createdBy}-${tech.name?.trim()}`;
    if (!techNameCache.has(key)) {
      techNameCache.set(key, []);
    }
    techNameCache.get(key).push(tech);
  }

  for (const job of jobsToMigrate) {
    try {
      // Skip whitespace-only technician names
      if (!job.technician || !job.technician.trim()) {
        stats.skippedWhitespace++;
        console.log(`⚪ Skipped (whitespace-only): Job "${job.title}" (${job._id})`);
        continue;
      }

      const trimmedTechName = job.technician.trim();
      const cacheKey = `${job.owner}-${trimmedTechName}`;
      const matchingTechs = techNameCache.get(cacheKey) || [];

      if (matchingTechs.length === 0) {
        // No matching tech found
        stats.unmatched++;
        unmatchedJobs.push({
          jobId: job._id.toString(),
          title: job.title,
          technician: job.technician,
          trimmedName: trimmedTechName,
          owner: job.owner.toString(),
          status: job.status
        });
        console.log(`⚠️  Unmatched: Job "${job.title}" (${job._id}) - Technician "${trimmedTechName}" not found for owner ${job.owner}`);
        
      } else if (matchingTechs.length > 1) {
        // Multiple techs with same name - ambiguous
        stats.ambiguous++;
        stats.matchedWithDuplicates++;
        ambiguousJobs.push({
          jobId: job._id.toString(),
          title: job.title,
          technician: job.technician,
          trimmedName: trimmedTechName,
          owner: job.owner.toString(),
          status: job.status,
          matchingTechIds: matchingTechs.map(t => t._id.toString()),
          chosenTechId: matchingTechs[0]._id.toString() // We'll use the first one
        });
        
        // Use the first (oldest) tech, but warn about ambiguity
        if (!DRY_RUN) {
          job.assignedTo = matchingTechs[0]._id;
          
          // Set assignedAt if in workflow
          const workflowStatuses = ['Assigned', 'Accepted', 'En Route', 'On Site', 'In Progress', 'Completed'];
          if (workflowStatuses.includes(job.status) && !job.assignedAt) {
            job.assignedAt = job.createdAt || new Date();
          }
          
          await job.save();
          stats.updated++;
        }
        
        console.log(`🔶 ${DRY_RUN ? '[DRY] ' : ''}Ambiguous (using oldest): Job "${job.title}" (${job._id}) -> Tech "${trimmedTechName}" (${matchingTechs[0]._id})`);
        console.log(`   ⚠️  Warning: ${matchingTechs.length} technicians found with this name. IDs: ${matchingTechs.map(t => t._id.toString()).join(', ')}`);
        
      } else {
        // Exactly one match - perfect
        const tech = matchingTechs[0];
        stats.matched++;
        
        if (!DRY_RUN) {
          job.assignedTo = tech._id;
          
          // Set assignedAt if in workflow
          const workflowStatuses = ['Assigned', 'Accepted', 'En Route', 'On Site', 'In Progress', 'Completed'];
          if (workflowStatuses.includes(job.status) && !job.assignedAt) {
            job.assignedAt = job.createdAt || new Date();
          }
          
          await job.save();
          stats.updated++;
        }
        
        console.log(`✅ ${DRY_RUN ? '[DRY] ' : ''}Matched: Job "${job.title}" (${job._id}) -> Tech "${tech.name}" (${tech._id})`);
      }
    } catch (e) {
      stats.errors++;
      errors.push({ jobId: job._id.toString(), error: e.message });
      console.error(`❌ Error processing job ${job._id}: ${e.message}`);
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('Migration Summary');
  console.log('========================================');
  console.log(`Total jobs scanned:           ${jobsToMigrate.length}`);
  console.log(`  Perfect matches:            ${stats.matched}`);
  console.log(`  Matched with duplicates:    ${stats.matchedWithDuplicates} (ambiguous, used oldest)`);
  console.log(`  Skipped (whitespace):       ${stats.skippedWhitespace}`);
  console.log(`  Unmatched (needs review):   ${stats.unmatched}`);
  console.log(`  Ambiguous (needs review):   ${stats.ambiguous}`);
  console.log(`  Errors:                     ${stats.errors}`);
  console.log(`Jobs updated:                 ${stats.updated}`);

  if (unmatchedJobs.length > 0) {
    console.log('\n----------------------------------------');
    console.log('UNMATCHED JOBS (Manual Review Required)');
    console.log('----------------------------------------');
    console.log('These jobs reference a technician name that does not exist.\n');
    unmatchedJobs.forEach(j => {
      console.log(`  Job ID: ${j.jobId}`);
      console.log(`  Title: "${j.title}"`);
      console.log(`  Technician name: "${j.technician}" (trimmed: "${j.trimmedName}")`);
      console.log(`  Owner: ${j.owner}`);
      console.log(`  Status: ${j.status}`);
      console.log('');
    });
    console.log('To fix unmatched jobs:');
    console.log('  1. Create a Tech record with the exact name shown above');
    console.log('  2. Re-run this migration script');
    console.log('  OR');
    console.log('  3. Manually edit the job to select a valid technician\n');
  }

  if (ambiguousJobs.length > 0) {
    console.log('\n----------------------------------------');
    console.log('AMBIGUOUS JOBS (Duplicate Technician Names)');
    console.log('----------------------------------------');
    console.log('These jobs were matched but multiple technicians share the same name.');
    console.log('The oldest technician was used, but you should review and possibly rename duplicates.\n');
    ambiguousJobs.forEach(j => {
      console.log(`  Job ID: ${j.jobId}`);
      console.log(`  Title: "${j.title}"`);
      console.log(`  Technician name: "${j.technician}"`);
      console.log(`  All matching Tech IDs: ${j.matchingTechIds.join(', ')}`);
      console.log(`  Used (oldest): ${j.chosenTechId}`);
      console.log('');
    });
    console.log('To resolve:');
    console.log('  1. Rename duplicate technicians to have unique names');
    console.log('  2. Re-run migration to reassign with correct matches\n');
  }

  if (errors.length > 0) {
    console.log('\n----------------------------------------');
    console.log('ERRORS DURING MIGRATION');
    console.log('----------------------------------------');
    errors.forEach(e => {
      console.log(`  - ${e.jobId}: ${e.error}`);
    });
  }

  console.log('\n========================================');
  if (DRY_RUN) {
    console.log('DRY RUN complete. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('Migration complete.');
    if (stats.unmatched === 0 && stats.ambiguous === 0 && stats.errors === 0) {
      console.log('✅ All jobs successfully matched and updated!');
    } else {
      console.log('⚠️  Some jobs require manual review (see above).');
    }
  }
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});
