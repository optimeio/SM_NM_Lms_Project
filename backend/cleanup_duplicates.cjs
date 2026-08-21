const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

function sanitizeUserId(rawId) {
  if (!rawId) return '';
  return String(rawId).replace(/@nm\.student\.local/g, '').trim();
}

function sanitizeEmail(rawId) {
  const cleanId = sanitizeUserId(rawId);
  if (!cleanId) return '';
  return cleanId.includes('@') ? cleanId : `${cleanId}@nm.student.local`;
}

async function cleanup() {
  console.log('🧹 Starting cleanup of duplicate / corrupted student records...');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  const usersCollection = db.collection('users');
  const allUsers = await usersCollection.find({}).toArray();

  const seenKeys = new Map();
  const idsToDelete = [];

  for (const user of allUsers) {
    if (user.role === 'admin') continue;

    const rawEmail = user.email || '';
    const cleanId = user.user_unique_id ? sanitizeUserId(user.user_unique_id) : sanitizeUserId(rawEmail);
    const cleanMail = sanitizeEmail(rawEmail || cleanId);

    // Identify corrupted emails with repeated domain
    const isCorrupted = rawEmail.includes('@nm.student.local@nm.student.local') || rawEmail.split('@').length > 2;

    const key = cleanId || cleanMail;

    if (isCorrupted || (seenKeys.has(key) && key)) {
      console.log(`❌ Flagging duplicate/corrupted record to remove: ID=${user._id}, Email="${user.email}"`);
      idsToDelete.push(user._id);

      // Merge assigned courses into the primary record if needed
      if (seenKeys.has(key)) {
        const primaryUser = seenKeys.get(key);
        const mergedCourses = Array.from(new Set([...(primaryUser.assignedCourses || []), ...(user.assignedCourses || [])]));
        await usersCollection.updateOne({ _id: primaryUser._id }, { $set: { assignedCourses: mergedCourses } });
      }
    } else {
      seenKeys.set(key, user);
      // Clean up email field if it was slightly off
      if (user.email !== cleanMail || user.user_unique_id !== cleanId) {
        console.log(`🔧 Sanitizing user ID=${user._id}: email "${user.email}" -> "${cleanMail}"`);
        await usersCollection.updateOne({ _id: user._id }, {
          $set: {
            email: cleanMail,
            user_unique_id: cleanId
          }
        });
      }
    }
  }

  if (idsToDelete.length > 0) {
    const res = await usersCollection.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`✅ Deleted ${res.deletedCount} duplicate/corrupted user document(s) from MongoDB.`);
  } else {
    console.log('✅ No duplicate users to delete in MongoDB.');
  }

  // Also clean up local users.json file
  const usersJsonPath = path.join(__dirname, 'data', 'users.json');
  if (fs.existsSync(usersJsonPath)) {
    try {
      const localUsers = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
      const localSeenMap = new Map();
      const cleanedLocalUsers = [];

      for (const u of localUsers) {
        if (u.role === 'admin') {
          cleanedLocalUsers.push(u);
          continue;
        }
        const cleanId = u.user_unique_id ? sanitizeUserId(u.user_unique_id) : sanitizeUserId(u.email);
        const cleanMail = sanitizeEmail(u.email || cleanId);
        const key = cleanId || cleanMail;

        if (!localSeenMap.has(key)) {
          u.email = cleanMail;
          if (u.user_unique_id) u.user_unique_id = cleanId;
          localSeenMap.set(key, u);
          cleanedLocalUsers.push(u);
        } else {
          console.log(`❌ Removing duplicate local user entry: ${u.email || u.user_unique_id}`);
        }
      }
      fs.writeFileSync(usersJsonPath, JSON.stringify(cleanedLocalUsers, null, 2));
      console.log('✅ Local users.json cleaned up.');
    } catch (e) {
      console.warn('Could not clean users.json:', e.message);
    }
  }

  await mongoose.disconnect();
  console.log('🎉 Cleanup complete.');
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
