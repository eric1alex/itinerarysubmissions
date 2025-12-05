import { defineDb, defineTable, column } from 'astro:db';

const User = defineTable({
    columns: {
        id: column.text({ primaryKey: true }),
        email: column.text({ unique: true }),
        createdAt: column.date(),
        lastLoginAt: column.date({ optional: true }),
    }
});

const Itinerary = defineTable({
    columns: {
        id: column.text({ primaryKey: true }),
        userId: column.text({ references: () => User.columns.id }),
        title: column.text(),
        summary: column.text(),
        location: column.text(),
        startDate: column.text(),
        endDate: column.text(),
        duration: column.text(),
        tripType: column.text(),
        budget: column.text({ optional: true }),
        transport: column.text({ optional: true }),
        days: column.json(), // Array of Day objects
        tags: column.json(), // Array of tag strings
        coverImage: column.text({ optional: true }),
        isPublished: column.boolean({ default: true }),
        createdAt: column.date(),
        updatedAt: column.date(),
    }
});

const VerificationCode = defineTable({
    columns: {
        id: column.text({ primaryKey: true }),
        email: column.text(),
        code: column.text(),
        purpose: column.text(), // 'submit' or 'login'
        expiresAt: column.date(),
        createdAt: column.date(),
    }
});

export default defineDb({
    tables: { User, Itinerary, VerificationCode }
});
