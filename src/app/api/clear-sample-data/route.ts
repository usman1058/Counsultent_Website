import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Delete all data in correct order due to foreign key constraints
    const deleteDynamicTables = await db.dynamicTable.deleteMany({});
    const deleteDetailPages = await db.detailPage.deleteMany({});
    const deleteCards = await db.card.deleteMany({});
    const deleteCategories = await db.category.deleteMany({});
    const deleteStudyPages = await db.studyPage.deleteMany({});
    const deleteTestimonials = await db.testimonial.deleteMany({});
    const deleteContactSubmissions = await db.contactSubmission.deleteMany({});
    const deleteB2BSubmissions = await db.b2BSubmission.deleteMany({});
    const deleteLuckyDrawEntries = await db.luckyDrawEntry.deleteMany({});
    
    // Keep admin and site settings as they are essential
    
    const totalDeleted = deleteDynamicTables.count + deleteDetailPages.count + 
                        deleteCards.count + deleteCategories.count + 
                        deleteStudyPages.count + deleteTestimonials.count +
                        deleteContactSubmissions.count + deleteB2BSubmissions.count +
                        deleteLuckyDrawEntries.count;
    
    console.log(`Deleted ${totalDeleted} records:
      - Study Pages: ${deleteStudyPages.count}
      - Categories: ${deleteCategories.count}
      - Cards: ${deleteCards.count}
      - Detail Pages: ${deleteDetailPages.count}
      - Dynamic Tables: ${deleteDynamicTables.count}
      - Testimonials: ${deleteTestimonials.count}
      - Contact Submissions: ${deleteContactSubmissions.count}
      - B2B Submissions: ${deleteB2BSubmissions.count}
      - Lucky Draw Entries: ${deleteLuckyDrawEntries.count}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully removed all sample data (${totalDeleted} records)`,
      deletedCount: totalDeleted,
      details: {
        studyPages: deleteStudyPages.count,
        categories: deleteCategories.count,
        cards: deleteCards.count,
        detailPages: deleteDetailPages.count,
        dynamicTables: deleteDynamicTables.count,
        testimonials: deleteTestimonials.count,
        contactSubmissions: deleteContactSubmissions.count,
        b2bSubmissions: deleteB2BSubmissions.count,
        luckyDrawEntries: deleteLuckyDrawEntries.count
      }
    });
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear sample data' },
      { status: 500 }
    );
  }
}