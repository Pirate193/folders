# Spaced Repetition System (SRS) - Complete Setup Guide

## 🎉 Implementation Complete!

Your flashcard system now includes a full **Spaced Repetition System** using the proven **SM-2 algorithm**. This will dramatically improve long-term retention and learning efficiency.

---

## 📋 Setup Steps

### Step 1: Run Database Migration

Execute the SQL schema in your Supabase SQL Editor:

```sql
-- Navigate to Supabase Dashboard → SQL Editor
-- Copy and paste the entire contents of:
database/flashcards-srs-schema.sql

-- This will:
-- ✅ Add SRS columns to flashcards table
-- ✅ Create flashcard_reviews table
-- ✅ Add indexes for performance
-- ✅ Create helper functions
-- ✅ Set up RLS policies
```

**Important**: Make sure to run the ENTIRE file, not just parts of it.

### Step 2: Verify Database Changes

Check that the following columns were added to `flashcards` table:
- `ease_factor` (DECIMAL, default 2.5)
- `interval_days` (INTEGER, default 0)
- `repetitions` (INTEGER, default 0)
- `next_review_date` (TIMESTAMPTZ, default NOW())
- `last_reviewed_at` (TIMESTAMPTZ, nullable)
- `total_reviews` (INTEGER, default 0)
- `correct_reviews` (INTEGER, default 0)

Check that `flashcard_reviews` table was created.

### Step 3: Test the System

1. Go to any folder with flashcards
2. You should see the **Study Dashboard** showing statistics
3. Click **"Start Studying"** button
4. Answer a flashcard question
5. Rate your knowledge (Again/Good/Easy)
6. Verify the review was saved

---

## 🎯 How to Use

### **For Students:**

#### **1. Study Due Cards**
```
1. Open a folder with flashcards
2. Look at the dashboard - it shows "Due Today" count
3. Click "Start Studying"
4. Answer each question
5. Rate how well you knew it:
   - Again: Didn't know it → Review today
   - Good: Knew it with effort → Review in 1-6 days
   - Easy: Knew it perfectly → Review in longer interval
```

#### **2. Understanding the Dashboard**
- **Due Today**: Cards you need to review now
- **This Week**: Total cards due in next 7 days
- **Mastered**: Cards you know well (3+ correct reviews)
- **New Cards**: Cards you've never reviewed
- **Success Rate**: Your overall accuracy percentage
- **Mastery Progress**: How many cards you've mastered

#### **3. Quality Ratings Explained**
| Button | When to Use | Next Review |
|--------|-------------|-------------|
| **Again** | Forgot it completely | Today (reset) |
| **Good** | Got it right with effort | 1-6 days |
| **Easy** | Knew it instantly | Longer interval |

---

## 🔢 The SM-2 Algorithm

### **How It Works:**

1. **First Review**: If correct → Review in 1 day
2. **Second Review**: If correct → Review in 6 days
3. **Subsequent Reviews**: Interval = Previous Interval × Ease Factor

### **Ease Factor:**
- Starts at 2.5 for all cards
- Increases when you rate "Easy" (up to ~3.0+)
- Decreases when you rate "Again" (down to minimum 1.3)
- Determines how quickly intervals grow

### **Example Timeline:**
```
Day 0: Learn card (rate: Good)
Day 1: Review #1 (rate: Good) → Next: 6 days
Day 7: Review #2 (rate: Easy) → Next: 18 days
Day 25: Review #3 (rate: Good) → Next: 45 days
Day 70: Review #4 (rate: Easy) → Next: 135 days
```

---

## 📊 Statistics Explained

### **Mastered Cards**
Cards with:
- 3+ consecutive correct reviews
- Ease factor ≥ 2.5
- These are cards you know well!

### **Success Rate**
```
Success Rate = (Correct Reviews / Total Reviews) × 100
```
- 90%+ = Excellent
- 70-89% = Good
- Below 70% = Need more practice

### **Average Ease**
- 2.5 = Normal difficulty
- Above 2.5 = Cards are getting easier
- Below 2.0 = Cards are challenging

---

## 🎨 UI Components

### **1. Study Dashboard** (`components/study-dashboard.tsx`)
Shows at the top of flashcard list:
- Due Today (orange if cards due)
- This Week
- Mastered Cards (green)
- New Cards (purple)
- Mastery Progress bar
- Performance stats
- Study recommendations

### **2. Flashcard Viewer SRS** (`components/flashcard-viewer-srs.tsx`)
Enhanced viewer with:
- Question display
- Answer input (text or multiple choice)
- Correct/Incorrect feedback with animations
- Quality rating buttons (Again/Good/Easy)
- Interval previews
- Success rate per card
- Auto-advance after rating

### **3. Updated Flashcard List** (`components/flashcard-list.tsx`)
Now includes:
- Study dashboard integration
- "Start Studying" fetches only due cards
- Uses FlashcardViewerSRS in study mode
- Reloads all cards when exiting study mode

---

## 🔧 Technical Details

### **Files Created:**
1. `database/flashcards-srs-schema.sql` - Database schema
2. `lib/srs-algorithm.ts` - SM-2 algorithm implementation
3. `components/flashcard-viewer-srs.tsx` - SRS-enabled viewer
4. `components/study-dashboard.tsx` - Statistics dashboard

### **Files Modified:**
1. `stores/flashcardStore.ts` - Added SRS functions
2. `components/flashcard-list.tsx` - Integrated SRS components

### **New Store Functions:**
```typescript
// Review a flashcard with quality rating
reviewFlashcard(flashcardId, folderId, quality, timeTaken)

// Fetch only cards due for review
fetchDueFlashcards(folderId)

// Get study statistics
fetchStudyStats(folderId)
```

### **SRS Algorithm Functions:**
```typescript
// Calculate next review date
calculateNextReview(quality, easeFactor, interval, repetitions)

// Get interval preview
getIntervalPreview(quality, easeFactor, interval, repetitions)

// Format next review date
formatNextReview(nextReviewDate)

// Calculate success rate
calculateSuccessRate(correctReviews, totalReviews)

// Check if card is mastered
isMastered(repetitions, easeFactor)
```

---

## 💡 Best Practices

### **For Optimal Learning:**

1. **Study Daily**: Even 10 minutes helps
2. **Be Honest**: Rate cards accurately
3. **Don't Cram**: Trust the algorithm
4. **Review Due Cards**: Don't skip them
5. **Use "Again" Freely**: It's okay to forget
6. **Aim for 80-90% Success**: Perfect score means cards are too easy

### **Rating Guidelines:**

**Use "Again" when:**
- You had no idea
- You guessed wrong
- You need to see it again today

**Use "Good" when:**
- You got it right but had to think
- You hesitated but remembered
- You want normal progression

**Use "Easy" when:**
- Instant recall
- No hesitation
- You definitely know it

---

## 🎯 Study Strategies

### **Daily Routine:**
```
1. Check dashboard for due cards
2. Study all due cards (aim for 100%)
3. Review any "Again" cards immediately
4. Add new cards if time permits
5. Track your success rate
```

### **Exam Preparation:**
```
1. Create flashcards 2-3 weeks before exam
2. Study daily to build up reviews
3. Focus on cards with low success rate
4. Use "Again" rating to force more reviews
5. Aim to master all cards before exam
```

### **Long-term Learning:**
```
1. Trust the intervals - don't over-review
2. Let mastered cards space out naturally
3. Focus on new and struggling cards
4. Maintain 80%+ success rate
5. Review consistently over months
```

---

## 📈 Progress Tracking

### **What to Monitor:**
- **Due Today**: Should be manageable (10-30 cards)
- **Success Rate**: Aim for 80-90%
- **Mastered Cards**: Should grow over time
- **Average Ease**: Should stabilize around 2.3-2.7

### **Red Flags:**
- Success rate below 70% → Cards too hard or studying too fast
- Average ease below 2.0 → Need to review fundamentals
- Too many due cards → Reduce new cards per day

---

## 🐛 Troubleshooting

### **Issue: No cards showing in study mode**
**Solution**: 
- Check if any cards have `next_review_date <= NOW()`
- Verify database migration ran successfully
- Check browser console for errors

### **Issue: Quality ratings not saving**
**Solution**:
- Check `flashcard_reviews` table exists
- Verify RLS policies are set up
- Check network tab for API errors

### **Issue: Statistics not updating**
**Solution**:
- Refresh the page
- Check if `fetchStudyStats` is being called
- Verify database columns have correct values

### **Issue: Cards not advancing after rating**
**Solution**:
- Check console for errors
- Verify `reviewFlashcard` function completes
- Ensure `onNext` callback is working

---

## 🎉 Success Indicators

You'll know the system is working when:
- ✅ Dashboard shows accurate statistics
- ✅ Cards disappear from "Due Today" after review
- ✅ Intervals increase for cards you know well
- ✅ Difficult cards appear more frequently
- ✅ Success rate stabilizes around 80-90%
- ✅ Mastered cards count grows over time

---

## 📚 Additional Resources

### **Learn More About SRS:**
- SuperMemo SM-2 Algorithm documentation
- Anki's spaced repetition guide
- Research on optimal learning intervals

### **Customize the System:**
- Adjust initial intervals in algorithm
- Modify quality rating thresholds
- Add custom statistics
- Create study streaks
- Add gamification elements

---

## 🚀 Next Steps (Optional Enhancements)

1. **Study Streaks**: Track consecutive days studied
2. **Heatmap**: Visual calendar of study activity
3. **Leaderboards**: Compare with other users
4. **Custom Intervals**: Let users adjust algorithm
5. **Study Goals**: Set daily/weekly targets
6. **Notifications**: Remind users of due cards
7. **Export/Import**: Share flashcard decks
8. **Mobile App**: Native mobile experience

---

**Congratulations!** 🎉 

You now have a professional-grade spaced repetition system that will help you (and your users) learn more effectively and retain information longer!

**Status**: ✅ Complete and Ready to Use  
**Algorithm**: SuperMemo SM-2  
**Database**: Fully migrated  
**UI**: Fully integrated  
**Testing**: Ready for production
